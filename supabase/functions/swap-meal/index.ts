import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
        const { currentMeal, mealType, userProfile } = await req.json();

        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        const systemPrompt = `You are an elite AI nutritionist. The user wants to swap their planned ${mealType}.

Current Meal (they didn't want this): ${JSON.stringify(currentMeal)}

User Constraints:
- Calorie target per day: ${userProfile.targetDailyCalories}
- Target macros per day: ${JSON.stringify(userProfile.targetMacros)}
- Allergies: ${userProfile.allergies?.join(', ') || 'None'}
- Preferences: ${userProfile.dietaryPreferences?.join(', ') || 'None'}
- Dislikes: ${userProfile.dislikedFoods?.join(', ') || 'None'}

Generate a REPLACEMENT meal that fits the same macro/calorie profile roughly (+/- 50 calories).
Return a JSON object EXACTLY matching this structure:
{
  "id": "uuid", "name": "Meal Name", "description": "Short desc", "calories": int, "macros": { "protein": int, "carbs": int, "fat": int }, "ingredients": ["ing1", "ing2"], "prepTimeMinutes": int, "satietyScore": int (1-10) 
}
Do not use markdown blocks, just raw JSON.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        const aiData = await response.json();
        const textOutput = aiData.candidates[0].content.parts[0].text;
        const jsonParsed = JSON.parse(textOutput);

        // Ensure we maintain a unique ID for the front-end to track
        jsonParsed.id = currentMeal.id + '-swapped-' + Date.now();

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
