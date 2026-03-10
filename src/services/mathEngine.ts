import type { UserProfile } from '../types';

/**
 * Calculates Total Daily Energy Expenditure (TDEE) and macronutrient targets
 * based on the Mifflin-St Jeor equation.
 */

// Activity multipliers
const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise/sports 1-3 days/week
    moderate: 1.55, // Moderate exercise/sports 3-5 days/week
    active: 1.725, // Hard exercise/sports 6-7 days a week
    very_active: 1.9, // Very hard exercise/sports & physical job or 2x training
};

export const calculateTDEE = (profile: Partial<UserProfile>): number => {
    if (!profile.weight || !profile.height || !profile.age || !profile.gender || !profile.activityLevel) {
        return 0; // Guard clause
    }

    // Mifflin-St Jeor Equation
    // Men: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
    // Women: (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161

    let bmr = (10 * profile.weight) + (6.25 * profile.height) - (5 * profile.age);

    if (profile.gender === 'male') {
        bmr += 5;
    } else {
        bmr -= 161;
    }

    // Multiply by activity factor to get TDEE
    const multiplier = ACTIVITY_MULTIPLIERS[profile.activityLevel];
    const tdee = Math.round(bmr * multiplier);

    return tdee;
};

export const calculateCaloricGoal = (profile: Partial<UserProfile>): number => {
    const tdee = calculateTDEE(profile);

    if (tdee === 0) return 0;

    // Assuming goal is weight loss. A safe deficit is 500 calories/day (approx 0.5kg/week loss).
    // We can adjust this based on how aggressive the goal is, but 500 is a standard safe limit.
    // Never go below 1200 for women or 1500 for men without medical supervision.

    let targetCalories = tdee - 500;

    const minimumSafeCalories = profile.gender === 'female' ? 1200 : 1500;

    if (targetCalories < minimumSafeCalories) {
        targetCalories = minimumSafeCalories;
    }

    return targetCalories;
};

export const calculateMacros = (targetCalories: number) => {
    if (targetCalories === 0) return { protein: 0, carbs: 0, fat: 0 };

    // High protein approach for weight loss/muscle retention
    // Protein: 30% of calories (4 calories per gram)
    // Fat: 30% of calories (9 calories per gram)
    // Carbs: 40% of calories (4 calories per gram)

    const proteinGrams = Math.round((targetCalories * 0.3) / 4);
    const fatGrams = Math.round((targetCalories * 0.3) / 9);
    const carbsGrams = Math.round((targetCalories * 0.4) / 4);

    return {
        protein: proteinGrams,
        carbs: carbsGrams,
        fat: fatGrams
    };
};
