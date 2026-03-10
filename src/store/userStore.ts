import { create } from 'zustand';
import type { UserProfile, WeeklyPlan, DailyWorkout, WeightLog, Meal } from '../types';
import type { Json } from '../types/supabase';
import { calculateCaloricGoal, calculateMacros } from '../services/mathEngine';
import { supabase } from '../lib/supabase';

// --- Helpers ---

function getStartOfWeekSunday(): string {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const diff = now.getDate() - dayOfWeek;
    const sunday = new Date(now.getFullYear(), now.getMonth(), diff);
    return sunday.toISOString().split('T')[0];
}

async function persistWeeklyPlan(userId: string, weeklyPlan: WeeklyPlan) {
    try {
        const { error } = await supabase.from('weekly_plans').upsert(
            {
                user_id: userId,
                start_date: getStartOfWeekSunday(),
                plan_data: weeklyPlan as unknown as Json,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,start_date' }
        );
        if (error) {
            console.error('Failed to save weekly plan to Supabase:', error);
        }
    } catch (err) {
        console.error('Supabase exception (weekly_plans):', err);
    }
}

// --- Store Interface ---

interface UserState {
    profile: Partial<UserProfile> | null;
    profileLoaded: boolean;
    session: any | null;
    onboardingStep: number;
    weeklyPlan: WeeklyPlan | null;
    dailyWorkouts: Record<string, DailyWorkout>;
    weightHistory: WeightLog[];
    updateProfile: (data: Partial<UserProfile>) => void;
    setSession: (session: any | null) => void;
    nextStep: () => void;
    prevStep: () => void;
    generateWeeklyPlan: (selectedDays: string[]) => Promise<void>;
    swapMeal: (day: string, mealType: string) => Promise<void>;
    swapIngredient: (day: string, mealType: string, oldIngredient: string, newIngredient: string) => Promise<{ success: boolean; requiresOverride: boolean; warningMessage?: string }>;
    forceSwapIngredient: (day: string, mealType: string, oldIngredient: string, newIngredient: string) => void;
    duplicateMeal: (day: string, mealType: string) => void;
    generateSOSSnack: (day: string) => void;
    applyCheatMealTolerance: (day: string, mealType: string, estimatedCalories: number) => void;
    logWorkout: (day: string, burnedCalories: number, durationMinutes?: number) => void;
    logWeight: (weight: number, date: string, mood?: WeightLog['mood'], notes?: string) => void;
    finalizeProfile: () => Promise<void>;
    fetchProfile: () => Promise<void>;
    fetchWeightHistory: () => Promise<void>;
    fetchWorkoutLogs: () => Promise<void>;
    fetchWeeklyPlan: () => Promise<void>;
}

// --- Store ---

export const useUserStore = create<UserState>((set, get) => ({
    profile: {
        name: '',
        gender: 'male',
        age: 30,
        height: 175,
        weight: 80,
        goalWeight: 70,
        activityLevel: 'light',
        dietaryPreferences: [],
        allergies: [],
        dislikedFoods: []
    },
    profileLoaded: false,
    session: null,
    onboardingStep: 1,
    weeklyPlan: null,
    dailyWorkouts: {},
    weightHistory: [],

    updateProfile: (data) =>
        set((state) => ({
            profile: { ...state.profile, ...data }
        })),

    setSession: (session) => set({ session, ...(session ? {} : { profileLoaded: false }) }),

    nextStep: () => set((state) => ({ onboardingStep: state.onboardingStep + 1 })),

    prevStep: () => set((state) => ({ onboardingStep: Math.max(1, state.onboardingStep - 1) })),

    // --- Fetch Functions ---

    fetchProfile: async () => {
        const state = get();
        if (!state.session?.user) {
            console.log("fetchProfile: No user in session");
            return;
        }

        const userId = state.session.user.id;
        console.log("fetchProfile: Starting fetch for user ID:", userId);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    console.log("fetchProfile: No profile found (PGRST116), user needs onboarding");
                    // Successfully checked DB - user genuinely has no profile yet
                    set({ profileLoaded: true });
                } else {
                    console.error('fetchProfile: Error fetching profile:', error);
                    // DB error - don't set profileLoaded so we don't redirect to onboarding
                }
                return;
            }

            if (data) {
                console.log("fetchProfile: Data found, updating state");
                set({
                    profileLoaded: true,
                    profile: {
                        name: data.name || '',
                        gender: data.gender || 'male',
                        age: data.age || 30,
                        height: data.height || 175,
                        weight: data.weight || 80,
                        goalWeight: data.goal_weight || 70,
                        activityLevel: data.activity_level || 'light',
                        dietaryPreferences: data.dietary_preferences || [],
                        allergies: data.allergies || [],
                        dislikedFoods: data.disliked_foods || [],
                        targetDailyCalories: data.target_daily_calories ?? undefined,
                        targetMacros: data.target_macros as { protein: number; carbs: number; fat: number } | undefined ?? undefined
                    }
                });
            }
        } catch (err: any) {
            console.error('fetchProfile: Exception:', err?.message || err);
            // Don't set profileLoaded on error - prevents false redirect to onboarding
        }
    },

    fetchWeightHistory: async () => {
        const state = get();
        if (!state.session?.user?.id) return;

        try {
            const { data, error } = await supabase
                .from('weight_logs')
                .select('*')
                .eq('user_id', state.session.user.id)
                .order('date', { ascending: true });

            if (error) {
                console.error('Failed to fetch weight history:', error);
                return;
            }

            if (data) {
                const mapped: WeightLog[] = data.map((row) => ({
                    date: row.date,
                    weight: row.weight,
                    mood: row.mood as WeightLog['mood'],
                    notes: row.notes || undefined,
                }));
                set({ weightHistory: mapped });
            }
        } catch (err) {
            console.error('Unexpected error fetching weight history:', err);
        }
    },

    fetchWorkoutLogs: async () => {
        const state = get();
        if (!state.session?.user?.id) return;

        try {
            const startOfWeek = getStartOfWeekSunday();
            const { data, error } = await supabase
                .from('workout_logs')
                .select('*')
                .eq('user_id', state.session.user.id)
                .gte('date', startOfWeek)
                .order('date', { ascending: true });

            if (error) {
                console.error('Failed to fetch workout logs:', error);
                return;
            }

            if (data) {
                const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                const workouts: Record<string, DailyWorkout> = {};

                for (const row of data) {
                    const dateObj = new Date(row.date + 'T00:00:00');
                    const dayKey = dayNames[dateObj.getDay()];
                    workouts[dayKey] = {
                        date: row.date,
                        burnedCalories: row.burned_calories,
                        durationMinutes: row.duration_minutes,
                        type: row.type || 'Seven App',
                    };
                }
                set({ dailyWorkouts: workouts });
            }
        } catch (err) {
            console.error('Unexpected error fetching workout logs:', err);
        }
    },

    fetchWeeklyPlan: async () => {
        const state = get();
        if (!state.session?.user?.id) return;

        try {
            const { data, error } = await supabase
                .from('weekly_plans')
                .select('*')
                .eq('user_id', state.session.user.id)
                .eq('start_date', getStartOfWeekSunday())
                .maybeSingle();

            if (error) {
                console.error('Failed to fetch weekly plan:', error);
                return;
            }

            if (data?.plan_data) {
                set({ weeklyPlan: data.plan_data as unknown as WeeklyPlan });
            } else {
                set({ weeklyPlan: null }); // Ensure it's clear if no data
            }
        } catch (err) {
            console.error('Unexpected error fetching weekly plan:', err);
        }
    },

    // --- Mutating Functions ---

    generateWeeklyPlan: async (selectedDays: string[]) => {
        const state = get();
        if (!state.session?.user || !state.profile) return;

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is missing');

            const systemPrompt = `You are an elite AI nutritionist. ALL output text (meal names, descriptions, ingredients) MUST be in Hebrew.
Generate a structured JSON weekly diet plan for ${selectedDays.length} days (${selectedDays.join(', ')}).
User Profile:
- Calories Goal: ${state.profile.targetDailyCalories}
- Macros Goal: ${JSON.stringify(state.profile.targetMacros)}
- Allergies: ${state.profile.allergies?.join(', ') || 'None'}
- Dietary Preferences: ${state.profile.dietaryPreferences?.join(', ') || 'None'}

You MUST return a JSON object with this exact structure (no markdown blocks, pure JSON).
IMPORTANT: All values for "name", "description", and "ingredients" must be written in Hebrew.
{
  "plannedMeals": {
    "dayName (e.g., tuesday)": {
      "breakfast": { "id": "uuid", "name": "שם המנה בעברית", "description": "תיאור קצר בעברית", "calories": int, "macros": { "protein": int, "carbs": int, "fat": int }, "ingredients": ["רכיב1", "רכיב2"], "prepTimeMinutes": int, "satietyScore": int (1-10) },
      "lunch": { ... },
      "dinner": { ... },
      "snack": { ... }
    }
  }
}
It is critical that you respect the calorie budget for EACH DAY.`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const aiData = await response.json();
            const textOutput = aiData.candidates[0].content.parts[0].text;
            const data = JSON.parse(textOutput);

            if (data?.plannedMeals) {
                const merged = {
                    ...(state.weeklyPlan || {}),
                    ...data.plannedMeals
                };
                set({ weeklyPlan: merged });

                // Persist to DB
                const userId = state.session?.user?.id;
                if (userId) {
                    persistWeeklyPlan(userId, merged);
                }
            }
        } catch (err) {
            console.error('Error generating weekly plan:', err);
            alert('אירעה שגיאה בייצור התפריט הקסום שלנו. נסה שוב מאוחר יותר.');
        }
    },

    swapMeal: async (day: string, mealType: string) => {
        const state = get();
        if (!state.session?.user || !state.profile || !state.weeklyPlan || !state.weeklyPlan[day]) return;

        const existingMeal = state.weeklyPlan[day][mealType];
        if (!existingMeal) return;

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is missing');

            const systemPrompt = `You are an elite AI nutritionist. ALL output text (meal names, descriptions, ingredients) MUST be in Hebrew.
The user wants to swap their planned ${mealType}.

Current Meal: ${JSON.stringify(existingMeal)}

User Constraints:
- Calorie target per day: ${state.profile.targetDailyCalories}
- Target macros per day: ${JSON.stringify(state.profile.targetMacros)}
- Allergies: ${state.profile.allergies?.join(', ') || 'None'}
- Preferences: ${state.profile.dietaryPreferences?.join(', ') || 'None'}
- Dislikes: ${state.profile.dislikedFoods?.join(', ') || 'None'}

Generate a REPLACEMENT meal that fits the same macro/calorie profile roughly (+/- 50 calories).
IMPORTANT: All values for "name", "description", and "ingredients" must be written in Hebrew.
Return a JSON object EXACTLY matching this structure:
{
  "id": "uuid", "name": "שם המנה בעברית", "description": "תיאור קצר בעברית", "calories": int, "macros": { "protein": int, "carbs": int, "fat": int }, "ingredients": ["רכיב1", "רכיב2"], "prepTimeMinutes": int, "satietyScore": int (1-10)
}
Do not use markdown blocks, just raw JSON.`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const aiData = await response.json();
            const textOutput = aiData.candidates[0].content.parts[0].text;
            const data = JSON.parse(textOutput);

            data.id = existingMeal.id + '-swapped-' + Date.now();

            if (data) {
                set((s) => ({
                    weeklyPlan: {
                        ...s.weeklyPlan,
                        [day]: {
                            ...(s.weeklyPlan?.[day] || {}),
                            [mealType]: data
                        }
                    }
                }));

                // Persist to DB
                const updatedState = get();
                const userId = state.session?.user?.id;
                if (userId && updatedState.weeklyPlan) {
                    persistWeeklyPlan(userId, updatedState.weeklyPlan);
                }
            }
        } catch (err) {
            console.error('Error swapping meal:', err);
            alert('לא הצלחנו להחליף את המנה כרגע.');
        }
    },

    swapIngredient: async (day: string, mealType: string, oldIngredient: string, newIngredient: string) => {
        const state = get();
        if (!state.session?.user || !state.profile || !state.weeklyPlan || !state.weeklyPlan[day]) {
            return { success: false, requiresOverride: false, warningMessage: 'Meal not found' };
        }

        const existingMeal = state.weeklyPlan[day][mealType];

        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error('VITE_GEMINI_API_KEY is missing');

            const systemPrompt = `You are an elite AI nutritionist validating an ingredient swap for a user's meal. ALL output text MUST be in Hebrew.
Meal: ${JSON.stringify(existingMeal)}
User Profile: Calories Goal ${state.profile.targetDailyCalories}, Macros ${JSON.stringify(state.profile.targetMacros)}
Requested Swap: Replace "${oldIngredient}" with "${newIngredient}".

Analyze the nutritional impact.
IMPORTANT: All text values ("warningMessage", "name", "description", "ingredients") must be written in Hebrew.
Return a JSON object EXACTLY matching this structure:
{
  "success": boolean,
  "requiresOverride": boolean,
  "warningMessage": "הודעת אזהרה בעברית אם הקלוריות עולות ב-150+ או פוגעות במאקרו, אחרת null",
  "updatedMeal": { "id": "...", "name": "שם בעברית", "description": "תיאור בעברית", "calories": int, "macros": { "protein": int, "carbs": int, "fat": int }, "ingredients": ["רכיב1", "רכיב2"], "prepTimeMinutes": int, "satietyScore": int }
}
If 'requiresOverride' is true, do NOT change success to true. If the swap is perfectly fine, success=true and requiresOverride=false.`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
                    generationConfig: { responseMimeType: "application/json" }
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const aiData = await response.json();
            const textOutput = aiData.candidates[0].content.parts[0].text;
            const data = JSON.parse(textOutput);

            if (data?.success && !data?.requiresOverride && data?.updatedMeal) {
                set((s) => ({
                    weeklyPlan: {
                        ...s.weeklyPlan,
                        [day]: {
                            ...(s.weeklyPlan?.[day] || {}),
                            [mealType]: data.updatedMeal
                        }
                    }
                }));

                // Persist to DB
                const updatedState = get();
                const userId = state.session?.user?.id;
                if (userId && updatedState.weeklyPlan) {
                    persistWeeklyPlan(userId, updatedState.weeklyPlan);
                }

                return { success: true, requiresOverride: false };
            } else if (data?.requiresOverride) {
                return {
                    success: false,
                    requiresOverride: true,
                    warningMessage: data.warningMessage || 'ההחלפה הזו עלולה לחרוג מהיעדים שלך.'
                };
            }

            return { success: false, requiresOverride: false, warningMessage: 'Unexpected AI response.' };

        } catch (err) {
            console.error('Error validating ingredient swap:', err);
            return { success: false, requiresOverride: false, warningMessage: 'Server error parsing the swap.' };
        }
    },

    forceSwapIngredient: (day: string, mealType: string, oldIngredient: string, newIngredient: string) => {
        set((state) => {
            if (!state.weeklyPlan || !state.weeklyPlan[day]) return state;

            const existingMeal = state.weeklyPlan[day][mealType];
            const updatedIngredients = existingMeal.ingredients.map(ing => ing === oldIngredient ? newIngredient : ing);

            const fakeCalorieBump = (newIngredient.includes('אורז') || newIngredient.includes('פסטה') || newIngredient.includes('לחם')) ? 250 : 50;

            return {
                weeklyPlan: {
                    ...state.weeklyPlan,
                    [day]: {
                        ...state.weeklyPlan[day],
                        [mealType]: {
                            ...existingMeal,
                            ingredients: updatedIngredients,
                            name: `${existingMeal.name} (שודרג עם ${newIngredient})`,
                            calories: existingMeal.calories + fakeCalorieBump
                        }
                    }
                }
            };
        });

        // Persist to DB
        const state = get();
        const userId = state.session?.user?.id;
        if (userId && state.weeklyPlan) {
            persistWeeklyPlan(userId, state.weeklyPlan);
        }
    },

    duplicateMeal: (day: string, mealType: string) => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentIndex = days.indexOf(day);
        if (currentIndex === -1) return;

        const nextDay = days[(currentIndex + 1) % 7];

        set((state) => {
            if (!state.weeklyPlan || !state.weeklyPlan[day] || !state.weeklyPlan[nextDay]) return state;

            const existingMeal = state.weeklyPlan[day][mealType];

            return {
                weeklyPlan: {
                    ...state.weeklyPlan,
                    [nextDay]: {
                        ...state.weeklyPlan[nextDay],
                        [mealType]: {
                            ...existingMeal,
                            id: `${nextDay}-${mealType}-duplicated`,
                            name: `${existingMeal.name} (שאריות מאתמול)`
                        }
                    }
                }
            };
        });

        // Persist to DB
        const state = get();
        const userId = state.session?.user?.id;
        if (userId && state.weeklyPlan) {
            persistWeeklyPlan(userId, state.weeklyPlan);
        }
    },

    generateSOSSnack: (day: string) => {
        set((state) => {
            if (!state.profile || !state.profile.targetDailyCalories || !state.weeklyPlan || !state.weeklyPlan[day]) return state;

            const todayPlan = state.weeklyPlan[day];
            const consumed =
                (todayPlan.breakfast?.calories || 0) +
                (todayPlan.lunch?.calories || 0) +
                (todayPlan.dinner?.calories || 0) +
                (todayPlan.snack?.calories || 0);

            const leftover = Math.max(0, state.profile.targetDailyCalories - consumed);
            const snackCalories = Math.min(leftover, 250);
            const finalCalories = Math.max(snackCalories, 50);

            // Allergy-aware ingredient selection
            const userAllergies = (state.profile.allergies || []).map(a => a.toLowerCase());
            const allSnackOptions = [
                { name: 'פרי קטן', allergens: [] as string[] },
                { name: 'שקדים / אגוזים', allergens: ['אגוזים', 'בוטנים'] },
                { name: 'יוגורט / מעדן', allergens: ['חלב'] },
                { name: 'ירקות חתוכים עם חומוס', allergens: ['שומשום'] },
                { name: 'חטיף אורז אפוי', allergens: [] as string[] },
                { name: 'גבינת קוטג׳', allergens: ['חלב'] },
                { name: 'ביצה קשה', allergens: ['ביצים'] },
                { name: 'אדממה', allergens: ['סויה'] },
                { name: 'קרקרים מאורז', allergens: [] as string[] },
            ];

            const safeIngredients = allSnackOptions
                .filter(opt => !opt.allergens.some(a => userAllergies.includes(a.toLowerCase())))
                .map(opt => opt.name)
                .slice(0, 3);

            const finalIngredients = safeIngredients.length > 0
                ? safeIngredients
                : ['פרי קטן', 'ירקות חתוכים'];

            return {
                weeklyPlan: {
                    ...state.weeklyPlan,
                    [day]: {
                        ...todayPlan,
                        sosSnack: {
                            id: `${day}-sos`,
                            name: 'נשנוש SOS (הצלה)',
                            description: `הותאם במיוחד עבורך עם כ-${finalCalories} קלוריות כדי לאזן את הרעב מבלי להרוס את התפריט שיצרת. מבוסס על יתרת הקלוריות היומית שלך.`,
                            ingredients: finalIngredients,
                            calories: finalCalories,
                            macros: { protein: Math.floor(finalCalories * 0.3 / 4), carbs: Math.floor(finalCalories * 0.4 / 4), fat: Math.floor(finalCalories * 0.3 / 9) },
                            prepTimeMinutes: 2,
                            satietyScore: 7
                        }
                    }
                }
            };
        });

        // Persist to DB
        const state = get();
        const userId = state.session?.user?.id;
        if (userId && state.weeklyPlan) {
            persistWeeklyPlan(userId, state.weeklyPlan);
        }
    },

    applyCheatMealTolerance: (day: string, mealType: string, estimatedCalories: number) => {
        set((state) => {
            if (!state.weeklyPlan || !state.weeklyPlan[day]) return state;

            const dayPlan = state.weeklyPlan[day];
            const originalMeal = dayPlan[mealType];

            if (!originalMeal) return state;

            const diff = estimatedCalories - originalMeal.calories;

            const updatedMeals: Record<string, Meal> = {
                ...dayPlan,
                [mealType]: {
                    ...originalMeal,
                    name: '🍔 אכילה בחוץ (Cheat Meal)',
                    description: `הערכה: ${estimatedCalories} קק"ל. שאר היום עבר אופטימיזציה לאיזון החריגה.`,
                    calories: estimatedCalories,
                    ingredients: ['אוכל ממסעדה', 'הנאה'],
                    satietyScore: 9
                }
            };

            if (diff > 0) {
                let remainingDiff = diff;
                const otherMeals = ['dinner', 'snack', 'lunch', 'breakfast'].filter(m => m !== mealType && updatedMeals[m]);

                for (const m of otherMeals) {
                    const meal = updatedMeals[m];
                    const maxCut = Math.floor(meal.calories * 0.4);
                    if (maxCut > 0) {
                        const cutAmount = Math.min(remainingDiff, maxCut);
                        updatedMeals[m] = {
                            ...meal,
                            calories: meal.calories - cutAmount,
                            description: meal.description.includes('[קוצץ')
                                ? meal.description
                                : `${meal.description} [קוצץ ב-${cutAmount} קק"ל לאיזון המסעדה]`
                        };
                        remainingDiff -= cutAmount;
                    }
                    if (remainingDiff <= 0) break;
                }
            }

            return {
                weeklyPlan: {
                    ...state.weeklyPlan,
                    [day]: updatedMeals as Record<string, Meal>
                }
            };
        });

        // Persist to DB
        const state = get();
        const userId = state.session?.user?.id;
        if (userId && state.weeklyPlan) {
            persistWeeklyPlan(userId, state.weeklyPlan);
        }
    },

    logWorkout: (day: string, burnedCalories: number, durationMinutes?: number) => {
        const resolvedDuration = durationMinutes ?? 7;

        // Optimistic Zustand update
        set((state) => ({
            dailyWorkouts: {
                ...state.dailyWorkouts,
                [day]: { date: day, burnedCalories, durationMinutes: resolvedDuration, type: 'Seven App' }
            }
        }));

        // Background DB sync
        const state = get();
        const userId = state.session?.user?.id;
        if (userId) {
            const todayDate = new Date().toISOString().split('T')[0];
            (async () => {
                try {
                    await supabase.from('workout_logs')
                        .delete()
                        .eq('user_id', userId)
                        .eq('date', todayDate);

                    const { error } = await supabase.from('workout_logs').insert({
                        user_id: userId,
                        date: todayDate,
                        burned_calories: burnedCalories,
                        duration_minutes: resolvedDuration,
                        type: 'Seven App',
                    });
                    if (error) console.error('Failed to save workout log:', error);
                } catch (err) {
                    console.error('Supabase exception (workout_logs):', err);
                }
            })();
        }
    },

    logWeight: (weight: number, date: string, mood?: WeightLog['mood'], notes?: string) => {
        // Optimistic Zustand update
        set((state) => {
            const updatedHistory = [...state.weightHistory.filter(w => w.date !== date), { date, weight, mood, notes }];
            return {
                weightHistory: updatedHistory,
                profile: state.profile ? { ...state.profile, weight } : state.profile
            };
        });

        // Background DB sync - weight log
        const state = get();
        const userId = state.session?.user?.id;
        if (userId) {
            supabase.from('weight_logs').upsert(
                {
                    user_id: userId,
                    date: date,
                    weight: weight,
                    mood: mood || null,
                    notes: notes || null,
                },
                { onConflict: 'user_id,date' }
            ).then(({ error }) => {
                if (error) console.error('Failed to save weight log:', error);
            });

            // Also update profile weight in DB
            supabase.from('profiles')
                .update({ weight: weight })
                .eq('id', userId)
                .then(({ error }) => {
                    if (error) console.error('Failed to update profile weight:', error);
                });
        }
    },

    finalizeProfile: async () => {
        const state = get();
        const profile = state.profile;
        const session = state.session;

        if (profile && session?.user?.id) {
            const targetDailyCalories = calculateCaloricGoal(profile);
            const targetMacros = calculateMacros(targetDailyCalories);

            const finalProfile = {
                ...profile,
                targetDailyCalories,
                targetMacros
            };

            set({ profile: finalProfile });

            try {
                const payload: any = {
                    id: session.user.id,
                    name: finalProfile.name,
                    gender: finalProfile.gender,
                    age: finalProfile.age,
                    height: finalProfile.height,
                    weight: finalProfile.weight,
                    goal_weight: finalProfile.goalWeight,
                    activity_level: finalProfile.activityLevel,
                    dietary_preferences: finalProfile.dietaryPreferences,
                    allergies: finalProfile.allergies,
                    disliked_foods: finalProfile.dislikedFoods,
                    target_daily_calories: finalProfile.targetDailyCalories,
                    target_macros: finalProfile.targetMacros
                };

                const { error } = await supabase.from('profiles').upsert(payload);

                if (error) {
                    console.error('Failed to save profile to Supabase:', error);
                    alert(`שגיאה בשמירת פרופיל: ${error.message}`);
                } else {
                    console.log('Profile saved successfully!');
                }
            } catch (err: any) {
                console.error('Supabase exception:', err);
                alert(`שגיאת רשת כללית: ${err.message}`);
            }
        }
    }
}));
