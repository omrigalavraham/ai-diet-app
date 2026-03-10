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
        const { meal, oldIngredient, newIngredient, userProfile } = await req.json();

        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        const systemPrompt = `You are an elite AI nutritionist validating an ingredient swap for a user's meal.
Meal: ${JSON.stringify(meal)}
User Profile: Calories Goal ${userProfile.targetDailyCalories}, Macros ${JSON.stringify(userProfile.targetMacros)}
Requested Swap: Replace "${oldIngredient}" with "${newIngredient}".

Analyze the nutritional impact. 
Return a JSON object EXACTLY matching this structure:
{
  "success": boolean, 
  "requiresOverride": boolean, 
  "warningMessage": "string containing warning if calories spike > 150 or ruins macros, otherwise null", 
  "updatedMeal": { "id": "...", "name": "...", "description": "...", "calories": int, "macros": { "protein": int, "carbs": int, "fat": int }, "ingredients": ["ing1", "ing2"], "prepTimeMinutes": int, "satietyScore": int }
}
If 'requiresOverride' is true, do NOT change success to true. If the swap is perfectly fine, success=true and requiresOverride=false.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
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
