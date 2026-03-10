import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// Need to run `supabase secrets set GEMINI_API_KEY=your_key` later
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { userProfile, selectedDays } = await req.json();

        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        // Connect to Supabase to verify user/auth if needed
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        );

        // Create the system prompt enforcing the JSON structure
        const systemPrompt = `You are an elite AI nutritionist.
Generate a structured JSON weekly diet plan for ${selectedDays.length} days (${selectedDays.join(', ')}).
User Profile:
- Calories Goal: ${userProfile.targetDailyCalories}
- Macros Goal: ${JSON.stringify(userProfile.targetMacros)}
- Allergies: ${userProfile.allergies?.join(', ') || 'None'}
- Dietary Preferences: ${userProfile.dietaryPreferences?.join(', ') || 'None'}

You MUST return a JSON object with this exact structure (no markdown blocks, pure JSON):
{
  "plannedMeals": {
    "dayName (e.g., tuesday)": {
      "breakfast": { "id": "uuid", "name": "Meal Name", "description": "Short desc", "calories": int, "macros": { "protein": int, "carbs": int, "fat": int }, "ingredients": ["ing1", "ing2"], "prepTimeMinutes": int, "satietyScore": int (1-10) },
      "lunch": { ... },
      "dinner": { ... },
      "snack": { ... }
    }
  }
}
It is critical that you respect the calorie budget for EACH DAY.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: 'user',
                    parts: [{ text: systemPrompt }]
                }],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            })
        });

        const aiData = await response.json();
        const textOutput = aiData.candidates[0].content.parts[0].text;
        const jsonParsed = JSON.parse(textOutput);

        return new Response(JSON.stringify(jsonParsed), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
