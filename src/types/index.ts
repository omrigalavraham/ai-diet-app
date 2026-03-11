export interface UserProfile {
    id?: string;
    name: string;
    gender: 'male' | 'female' | 'other';
    age: number;
    height: number; // in cm
    weight: number; // in kg
    goalWeight: number; // in kg
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    dietaryPreferences: string[]; // e.g. 'vegetarian', 'vegan', 'gluten-free'
    allergies: string[];
    dislikedFoods: string[];
    targetDailyCalories?: number; // Calculated by mathEngine
    targetMacros?: {
        protein: number; // in grams
        carbs: number; // in grams
        fat: number; // in grams
    };
}

export interface Meal {
    id?: string;
    name: string;
    description: string;
    ingredients: string[];
    calories: number;
    macros: {
        protein: number;
        carbs: number;
        fat: number;
    };
    prepTimeMinutes: number;
    satietyScore?: number; // 1 to 10
    instructions?: string[]; // Step-by-step preparation instructions from AI
}

export interface DailyPlan {
    id?: string;
    userId: string;
    date: string; // YYYY-MM-DD
    meals: {
        breakfast: Meal;
        lunch: Meal;
        dinner: Meal;
        snacks: Meal[];
    };
    workout: {
        title: string;
        description: string;
        durationMinutes: number;
        type: string;
    };
    isCompleted: boolean;
}

export type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export type WeeklyPlan = Record<string, Record<string, Meal>>;

export interface DailyWorkout {
    date: string; // YYYY-MM-DD or DayKey
    burnedCalories: number;
    durationMinutes?: number;
    type?: string;
}

export interface WeightLog {
    date: string; // YYYY-MM-DD
    weight: number;
    mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
    notes?: string;
}
