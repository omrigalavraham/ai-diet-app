import React, { useState } from 'react';
import type { Meal } from '../../types';
import IngredientSwapModal from './IngredientSwapModal';
import CheatMealModal from './CheatMealModal';
import RecipeModal from './RecipeModal';
import { useUserStore } from '../../store/userStore';

interface MealCardProps {
    dayKey: string;
    mealType: string;
    mealData: Meal | null;
    onSwap: (mealType: string) => void;
}

const MealCard: React.FC<MealCardProps> = ({ dayKey, mealType, mealData, onSwap }) => {
    const [isSwapping, setIsSwapping] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
    const [showCheatModal, setShowCheatModal] = useState(false);
    const [showRecipeModal, setShowRecipeModal] = useState(false);
    const [isDuplicated, setIsDuplicated] = useState(false);
    const { swapIngredient, forceSwapIngredient, duplicateMeal, applyCheatMealTolerance } = useUserStore();

    const handleSwapClick = () => {
        setIsSwapping(true);
        // Simulate AI delay for the animation
        setTimeout(() => {
            onSwap(mealType);
            setIsSwapping(false);
        }, 1200);
    };

    const handleDuplicateClick = () => {
        duplicateMeal(dayKey, mealType);
        setIsDuplicated(true);
        setTimeout(() => setIsDuplicated(false), 2000);
    };

    const getMealIcon = (type: string) => {
        switch (type) {
            case 'breakfast': return '🍳';
            case 'lunch': return '🥗';
            case 'dinner': return '🥩';
            case 'sosSnack': return '🆘';
            default: return '🍎';
        }
    };

    const mealNameMapping: Record<string, string> = {
        breakfast: 'ארוחת בוקר',
        lunch: 'ארוחת צהריים',
        dinner: 'ארוחת ערב',
        snack: 'נשנוש קבוע',
        sosSnack: 'נשנוש הצלה (SOS)'
    };
    const mealNameHebrew = mealNameMapping[mealType] || mealType;

    if (!mealData) {
        return (
            <div className="card-glass h-full flex flex-col justify-center items-center text-center opacity-50 p-6">
                <div className="text-3xl mb-2 grayscale">{getMealIcon(mealType)}</div>
                <h4 className="font-bold mb-1 text-white">{mealNameHebrew}</h4>
                <p className="text-sm text-muted">עדיין אין תפריט</p>
            </div>
        );
    }

    return (
        <div className={`card-glass h-full flex flex-col relative overflow-hidden transition-all duration-300 ${isSwapping ? 'opacity-50 scale-95 blur-sm' : ''}`}>

            {/* Swap Animation Overlay */}
            {isSwapping && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-surface/80">
                    <div className="loader spin border-emerald-500 border-t-emerald-200"></div>
                </div>
            )}

            <div className="flex flex-wrap justify-between items-start mb-4 relative z-10 gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-[200px]">
                    <div className="bg-surface/40 p-3 rounded-xl shrink-0 flex items-center justify-center border border-white/5 shadow-inner">
                        <span className="text-2xl drop-shadow-md">{getMealIcon(mealType)}</span>
                    </div>
                    <div className="pt-0.5">
                        <span className="text-[11px] uppercase tracking-wider text-emerald-400/90 font-bold block mb-1">{mealNameHebrew}</span>
                        <h4 className="font-bold text-lg text-white leading-snug">{mealData.name}</h4>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                        onClick={() => setShowCheatModal(true)}
                        className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 shrink-0"
                        title="הפוך לארוחת מסעדה"
                    >
                        <span>🍔</span>
                    </button>
                    {dayKey !== 'thursday' && (
                        <button
                            onClick={handleDuplicateClick}
                            disabled={isDuplicated}
                            className={`text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 shrink-0 ${isDuplicated
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300'
                                }`}
                            title="שכפל ארוחה זו לצהריים של מחר"
                        >
                            {isDuplicated ? (
                                <><span>✔️</span> הועתק למחר</>
                            ) : (
                                <><span>🥘</span> הכפל למחר</>
                            )}
                        </button>
                    )}
                    <button
                        onClick={handleSwapClick}
                        className="text-xs bg-surface-hover hover:bg-slate-700 text-muted hover:text-white px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 shrink-0"
                        title="החלף ארוחה"
                    >
                        <span>↻</span> החלף
                    </button>
                </div>
            </div>

            <p className="text-sm text-muted mb-4 line-clamp-2 flex-grow">{mealData.description}</p>

            <div className="bg-bg/50 rounded-md p-3 mb-4">
                <h5 className="text-xs font-semibold text-white mb-2 flex justify-between items-center">
                    מצרכים:
                    <span className="text-[10px] text-muted font-normal">(לחץ על רכיב כדי להחליף)</span>
                </h5>
                <ul className="text-xs text-muted space-y-2">
                    {mealData.ingredients.slice(0, 4).map((item, i) => (
                        <li
                            key={i}
                            onClick={() => setSelectedIngredient(item)}
                            className="flex items-start gap-2 p-2 rounded-lg bg-surface/30 hover:bg-surface-hover cursor-pointer transition-all duration-200 border border-transparent hover:border-emerald-500/30 group"
                        >
                            <span className="text-emerald-500/50 group-hover:text-emerald-400 text-[10px] shrink-0 mt-0.5 transition-colors">✏️</span>
                            <span className="break-words flex-1 text-white/80 group-hover:text-white leading-relaxed">{item}</span>
                        </li>
                    ))}
                    {mealData.ingredients.length > 4 && (
                        <li className="pl-6 text-muted/70 italic mt-2 text-[11px]">...ועוד {mealData.ingredients.length - 4} מצרכים</li>
                    )}
                </ul>
            </div>

            <div className="flex flex-wrap justify-between items-center mt-auto pt-4 border-t border-surface-hover gap-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                    <div className="flex flex-col">
                        <span className="text-muted">קלוריות</span>
                        <span className="font-bold text-white cursor-help" title={`חלבון: ${mealData.macros.protein}g | פחמימה: ${mealData.macros.carbs}g | שומן: ${mealData.macros.fat}g`}>
                            {mealData.calories}
                        </span>
                    </div>
                    <div className="w-px bg-surface-hover"></div>
                    <div className="flex flex-col">
                        <span className="text-muted">זמן הכנה</span>
                        <span className="font-bold text-white">{mealData.prepTimeMinutes} דק'</span>
                    </div>
                    {mealData.satietyScore && (
                        <>
                            <div className="w-px bg-surface-hover"></div>
                            <div className="flex flex-col" title="ציון משביע (1 עד 10) מבוסס על נפח, חלבון וסיבים">
                                <span className="text-muted flex items-center gap-1">משביע <span className="text-[10px]">🔋</span></span>
                                <span className="font-bold text-white flex items-center gap-1.5 mt-0.5">
                                    {mealData.satietyScore}/10
                                    <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] ${mealData.satietyScore >= 8 ? 'bg-emerald-500 shadow-emerald-500/50' : mealData.satietyScore >= 6 ? 'bg-orange-400 shadow-orange-400/50' : 'bg-red-500 shadow-red-500/50'}`}></span>
                                </span>
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={() => setShowRecipeModal(true)}
                    className="text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                >
                    מתכון מלא &larr;
                </button>
            </div>

            {/* Render Ingredient Swap Modal if selected */}
            {selectedIngredient && (
                <IngredientSwapModal
                    ingredient={selectedIngredient}
                    onClose={() => setSelectedIngredient(null)}
                    onSubmitSwap={(newIngredient) => swapIngredient(dayKey, mealType, selectedIngredient, newIngredient)}
                    onForceSwap={(newIngredient) => forceSwapIngredient(dayKey, mealType, selectedIngredient, newIngredient)}
                />
            )}

            {showCheatModal && (
                <CheatMealModal
                    mealData={mealData}
                    onClose={() => setShowCheatModal(false)}
                    onSubmit={(estimatedCalories) => {
                        applyCheatMealTolerance(dayKey, mealType, estimatedCalories);
                        setShowCheatModal(false);
                    }}
                />
            )}

            {showRecipeModal && (
                <RecipeModal
                    mealData={mealData}
                    onClose={() => setShowRecipeModal(false)}
                />
            )}
        </div>
    );
};

export default MealCard;
