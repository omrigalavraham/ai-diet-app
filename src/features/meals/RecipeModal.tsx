import React from 'react';
import { createPortal } from 'react-dom';
import type { Meal } from '../../types';

interface RecipeModalProps {
    mealData: Meal;
    onClose: () => void;
}

const RecipeModal: React.FC<RecipeModalProps> = ({ mealData, onClose }) => {
    // Use real instructions from AI if available, otherwise fallback for old data
    const hasRealInstructions = mealData.instructions && mealData.instructions.length > 0;
    const instructions = hasRealInstructions
        ? mealData.instructions!
        : [
            `חתוך את המרכיבים העיקריים (${mealData.ingredients.slice(0, 2).join(', ')}) לחתיכות שוות.`,
            'חמם מחבת על אש בינונית עם כפית שמן זית.',
            'הוסף את המרכיבים למחבת וטגן עד להזהבה קלה.',
            'תבל במלח, פלפל, הוסף את שאר המרכיבים ובשל עוד כ-5 דקות.',
            'הגש חם ובתאבון!'
        ];

    const modalContent = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm fade-in">
            <div className="bg-surface border border-surface-hover rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col relative shadow-2xl">

                {/* Header */}
                <div className="p-5 border-b border-surface-hover flex justify-between items-start bg-surface-hover/30 shrink-0 rounded-t-2xl">
                    <div>
                        <div className="text-xs text-emerald-400 font-medium mb-1 flex items-center gap-1.5">
                            <span>✨</span> מתכון מותאם אישית מה-AI
                        </div>
                        <h3 className="font-bold text-xl text-white leading-tight">{mealData.name}</h3>
                    </div>
                    <button type="button" onClick={onClose} className="text-muted hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover/80 shrink-0 ml-[-8px]">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-grow custom-scrollbar space-y-8">

                    {/* Nutritional Summary */}
                    <div className="flex justify-between items-center bg-bg/50 p-4 rounded-xl border border-surface-hover">
                        <div className="text-center flex-1 border-l border-surface-hover last:border-0">
                            <span className="block text-xl font-bold text-white">{mealData.calories}</span>
                            <span className="text-xs text-muted">קק"ל</span>
                        </div>
                        <div className="text-center flex-1 border-l border-surface-hover last:border-0">
                            <span className="block text-xl font-bold text-white">{mealData.macros.protein}g</span>
                            <span className="text-xs text-muted">חלבון</span>
                        </div>
                        <div className="text-center flex-1 border-l border-surface-hover last:border-0">
                            <span className="block text-xl font-bold text-white">{mealData.macros.carbs}g</span>
                            <span className="text-xs text-muted">פחמימה</span>
                        </div>
                        <div className="text-center flex-1 border-l border-surface-hover last:border-0">
                            <span className="block text-xl font-bold text-white">{mealData.macros.fat}g</span>
                            <span className="text-xs text-muted">שומן</span>
                        </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                        <h4 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
                            <span>🛒</span> מצרכים
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {mealData.ingredients.map((item, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm text-gray-300 bg-surface/50 p-2.5 rounded-lg border border-transparent hover:border-surface-hover transition-colors">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 block shrink-0"></span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Instructions */}
                    <div>
                        <h4 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
                            <span>🍳</span> הוראות הכנה ({mealData.prepTimeMinutes} דק')
                        </h4>
                        <div className="space-y-4 relative before:absolute before:inset-y-0 before:right-3.5 before:w-px before:bg-surface-hover">
                            {instructions.map((step, idx) => (
                                <div key={idx} className="flex gap-4 relative">
                                    <div className="w-7 h-7 rounded-full bg-surface border border-surface-hover flex items-center justify-center text-xs font-bold text-emerald-400 shrink-0 z-10">
                                        {idx + 1}
                                    </div>
                                    <p className="text-sm text-gray-300 pt-1 leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>
                        {!hasRealInstructions && (
                            <p className="text-xs text-muted mt-6 text-center italic">
                                * הוראות כלליות. מנות חדשות שתיצרו עם ה-AI יכללו הוראות הכנה מפורטות ומותאמות.
                            </p>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-surface-hover bg-surface-hover/20 shrink-0">
                    <button onClick={onClose} className="btn-primary w-full py-3 text-sm">
                        הבנתי, סגור מתכון
                    </button>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: var(--color-surface-hover);
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default RecipeModal;
