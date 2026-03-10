import React, { useState } from 'react';
import type { Meal } from '../../types';
import { useUserStore } from '../../store/userStore';

interface CookFromHomeModalProps {
    currentDay: string;
    dayHebrew: string;
    existingMealTypes: string[];
    onClose: () => void;
    onMealSet: () => void;
}

interface StructuredIngredient {
    name: string;
    amount: string;
}

const mealTypeLabels: Record<string, string> = {
    breakfast: 'ארוחת בוקר',
    lunch: 'ארוחת צהריים',
    dinner: 'ארוחת ערב',
    snack: 'נשנוש',
};

const allMealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

type Step = 'input' | 'loading' | 'result';

const CookFromHomeModal: React.FC<CookFromHomeModalProps> = ({
    currentDay,
    dayHebrew,
    existingMealTypes,
    onClose,
    onMealSet,
}) => {
    const { generateRecipeFromIngredients, setMealForDay } = useUserStore();

    const [step, setStep] = useState<Step>('input');
    const [ingredientsText, setIngredientsText] = useState('');
    const [generatedMeal, setGeneratedMeal] = useState<Meal | null>(null);
    const [error, setError] = useState('');

    // Structured editable ingredients
    const [editIngredients, setEditIngredients] = useState<StructuredIngredient[]>([]);
    const [newIngredientName, setNewIngredientName] = useState('');
    const [newIngredientAmount, setNewIngredientAmount] = useState('');
    const [isRegenerating, setIsRegenerating] = useState(false);

    // Meal selection
    const [showMealPicker, setShowMealPicker] = useState(false);

    // Parse structured ingredients from AI response
    const parseStructuredIngredients = (meal: any): StructuredIngredient[] => {
        if (meal.structuredIngredients && Array.isArray(meal.structuredIngredients)) {
            return meal.structuredIngredients.map((si: any) => ({
                name: si.name || '',
                amount: si.amount || '',
            }));
        }
        // Fallback: parse from string array
        if (meal.ingredients && Array.isArray(meal.ingredients)) {
            return meal.ingredients.map((ing: string) => {
                const match = ing.match(/^([\d.,/½¼¾⅓⅔]+\s*(?:גרם|גר׳|מ"ל|כוס|כוסות|כף|כפות|יח׳|יחידות|קילו|ליטר)?)\s+(.+)/);
                if (match) {
                    return { amount: match[1].trim(), name: match[2].trim() };
                }
                return { name: ing, amount: '' };
            });
        }
        return [];
    };

    const handleGenerate = async () => {
        if (!ingredientsText.trim()) return;
        setStep('loading');
        setError('');

        const meal = await generateRecipeFromIngredients(ingredientsText.trim());

        if (meal) {
            setGeneratedMeal(meal);
            setEditIngredients(parseStructuredIngredients(meal));
            setStep('result');
        } else {
            setError('לא הצליח לייצר מתכון. נסה שוב.');
            setStep('input');
        }
    };

    const handleRegenerate = async () => {
        const updatedText = editIngredients
            .map(ing => ing.amount ? `${ing.amount} ${ing.name}` : ing.name)
            .join(', ');
        if (!updatedText.trim()) return;

        setIsRegenerating(true);
        setError('');

        const meal = await generateRecipeFromIngredients(updatedText);

        if (meal) {
            setGeneratedMeal(meal);
            setEditIngredients(parseStructuredIngredients(meal));
        } else {
            setError('לא הצליח לעדכן מתכון. נסה שוב.');
        }
        setIsRegenerating(false);
    };

    const handleRemoveIngredient = (index: number) => {
        setEditIngredients(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpdateAmount = (index: number, newAmount: string) => {
        setEditIngredients(prev => prev.map((ing, i) => i === index ? { ...ing, amount: newAmount } : ing));
    };

    const handleAddIngredient = () => {
        if (newIngredientName.trim()) {
            setEditIngredients(prev => [...prev, { name: newIngredientName.trim(), amount: newIngredientAmount.trim() }]);
            setNewIngredientName('');
            setNewIngredientAmount('');
        }
    };

    const handleSelectMealType = (mealType: string) => {
        if (!generatedMeal) return;
        const finalIngredients = editIngredients.map(ing =>
            ing.amount ? `${ing.amount} ${ing.name}` : ing.name
        );
        const finalMeal: Meal = {
            ...generatedMeal,
            ingredients: finalIngredients,
            id: `home-${currentDay}-${mealType}-${Date.now()}`
        };
        setMealForDay(currentDay, mealType, finalMeal);
        onMealSet();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm fade-in" onClick={onClose}>
            <div
                className="bg-surface border border-surface-hover rounded-2xl w-full max-w-lg overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 border-b border-surface-hover flex justify-between items-center bg-surface-hover/30 shrink-0">
                    <div>
                        <h3 className="font-bold text-lg text-white flex items-center gap-2">
                            <span>🏠</span> בישול ממה שיש בבית
                        </h3>
                        <p className="text-xs text-muted mt-1">
                            יום {dayHebrew} • רשום מה יש לך ונכין לך מתכון
                        </p>
                    </div>
                    <button onClick={onClose} className="text-muted hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">

                    {/* STEP 1: Input */}
                    {step === 'input' && (
                        <div className="fade-in">
                            <p className="text-sm text-muted mb-4">
                                רשום בחופשיות מה יש לך במקרר / במזווה, ואנחנו ניצור לך מתכון בריא ומותאם.
                            </p>
                            <textarea
                                className="w-full bg-bg/50 border border-surface-hover rounded-xl p-4 text-white placeholder:text-muted/50 focus:border-emerald-500/50 focus:outline-none transition-colors resize-none text-sm leading-relaxed"
                                rows={5}
                                placeholder={"למשל: 500 גרם חזה עוף, אורז, ברוקולי, שמן זית, שום, לימון...\n\nטיפ: ציין כמויות אם אתה יודע (500 גרם, 2 כוסות) והמתכון יותאם!"}
                                value={ingredientsText}
                                onChange={(e) => setIngredientsText(e.target.value)}
                                dir="rtl"
                                autoFocus
                            />
                            {error && (
                                <p className="text-red-400 text-sm mt-2">{error}</p>
                            )}
                            <button
                                className="btn-primary w-full mt-4 py-3 text-base flex items-center justify-center gap-2"
                                onClick={handleGenerate}
                                disabled={!ingredientsText.trim()}
                            >
                                <span>✨</span> צור לי מתכון
                            </button>
                        </div>
                    )}

                    {/* STEP 2: Loading */}
                    {step === 'loading' && (
                        <div className="flex flex-col items-center justify-center py-12 fade-in">
                            <div className="loader spin mb-6 border-emerald-500 border-t-emerald-200"></div>
                            <h3 className="font-bold text-lg mb-2 text-white">המטבח הקסום עובד... 🧑‍🍳</h3>
                            <p className="text-muted text-sm text-center">מחפש את הקומבינציה הטובה ביותר מהמצרכים שלך</p>
                        </div>
                    )}

                    {/* STEP 3: Result with editing */}
                    {step === 'result' && generatedMeal && (
                        <div className="fade-in space-y-5">

                            {/* Recipe Header */}
                            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-4">
                                <h4 className="font-bold text-xl text-white mb-1">{generatedMeal.name}</h4>
                                <p className="text-sm text-muted leading-relaxed">{generatedMeal.description}</p>
                            </div>

                            {/* Stats row */}
                            <div className="flex justify-between items-center bg-bg/40 rounded-xl p-3 border border-surface-hover/50">
                                <div className="flex flex-col items-center px-3">
                                    <span className="text-[11px] text-muted">קלוריות</span>
                                    <span className="font-bold text-white">{generatedMeal.calories}</span>
                                </div>
                                <div className="w-px h-8 bg-surface-hover"></div>
                                <div className="flex flex-col items-center px-3">
                                    <span className="text-[11px] text-muted">חלבון</span>
                                    <span className="font-bold text-emerald-400">{generatedMeal.macros?.protein}g</span>
                                </div>
                                <div className="w-px h-8 bg-surface-hover"></div>
                                <div className="flex flex-col items-center px-3">
                                    <span className="text-[11px] text-muted">פחמימה</span>
                                    <span className="font-bold text-blue-400">{generatedMeal.macros?.carbs}g</span>
                                </div>
                                <div className="w-px h-8 bg-surface-hover"></div>
                                <div className="flex flex-col items-center px-3">
                                    <span className="text-[11px] text-muted">שומן</span>
                                    <span className="font-bold text-orange-400">{generatedMeal.macros?.fat}g</span>
                                </div>
                                <div className="w-px h-8 bg-surface-hover"></div>
                                <div className="flex flex-col items-center px-3">
                                    <span className="text-[11px] text-muted">זמן</span>
                                    <span className="font-bold text-white">{generatedMeal.prepTimeMinutes}'</span>
                                </div>
                            </div>

                            {/* Editable Ingredients with separate name + amount */}
                            <div className="bg-bg/30 p-4 rounded-xl border border-surface-hover/50">
                                <div className="flex justify-between items-center mb-3">
                                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                                        <span>📝</span> מצרכים
                                    </h5>
                                    <button
                                        onClick={handleRegenerate}
                                        disabled={isRegenerating}
                                        className="text-[11px] bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 disabled:opacity-50"
                                    >
                                        {isRegenerating ? (
                                            <>
                                                <span className="inline-block w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin"></span>
                                                מעדכן...
                                            </>
                                        ) : (
                                            <>
                                                <span>🔄</span> עדכן מתכון
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="space-y-2 mb-3">
                                    {editIngredients.map((ing, idx) => (
                                        <div key={idx} className="flex items-center gap-2 bg-surface/40 rounded-lg overflow-hidden">
                                            {/* Editable amount box */}
                                            <input
                                                type="text"
                                                value={ing.amount}
                                                onChange={(e) => handleUpdateAmount(idx, e.target.value)}
                                                className="w-24 shrink-0 bg-emerald-500/10 border-l border-surface-hover text-center px-2 py-2.5 text-sm text-emerald-300 font-medium focus:outline-none focus:bg-emerald-500/20 transition-colors"
                                                placeholder="כמות"
                                                dir="rtl"
                                            />
                                            {/* Ingredient name (read-only label) */}
                                            <span className="text-sm text-white/90 flex-1 px-2 py-2.5">{ing.name}</span>
                                            {/* Remove button */}
                                            <button
                                                onClick={() => handleRemoveIngredient(idx)}
                                                className="text-red-400/70 hover:text-red-400 text-xs shrink-0 w-8 h-8 flex items-center justify-center hover:bg-red-500/10 transition-colors"
                                                title="הסר מצרך"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {/* Add new ingredient */}
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="w-24 shrink-0 bg-bg/50 border border-surface-hover rounded-lg px-2 py-2 text-sm text-white placeholder:text-muted/50 focus:border-emerald-500/50 focus:outline-none transition-colors text-center"
                                        placeholder="כמות"
                                        value={newIngredientAmount}
                                        onChange={(e) => setNewIngredientAmount(e.target.value)}
                                        dir="rtl"
                                    />
                                    <input
                                        type="text"
                                        className="flex-1 bg-bg/50 border border-surface-hover rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted/50 focus:border-emerald-500/50 focus:outline-none transition-colors"
                                        placeholder="שם המצרך..."
                                        value={newIngredientName}
                                        onChange={(e) => setNewIngredientName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                                        dir="rtl"
                                    />
                                    <button
                                        onClick={handleAddIngredient}
                                        disabled={!newIngredientName.trim()}
                                        className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-3 py-2 rounded-lg transition-colors text-sm disabled:opacity-30"
                                    >
                                        ➕
                                    </button>
                                </div>

                                <p className="text-[11px] text-muted/70 mt-3 text-center">
                                    שנה כמויות ← לחץ "🔄 עדכן מתכון" כדי להתאים קלוריות ומאקרו
                                </p>
                            </div>

                            {error && (
                                <p className="text-red-400 text-sm">{error}</p>
                            )}

                            {/* Meal picker or save button */}
                            {!showMealPicker ? (
                                <div className="flex gap-3">
                                    <button
                                        className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                                        onClick={() => setShowMealPicker(true)}
                                    >
                                        <span>💾</span> שמור בתפריט
                                    </button>
                                    <button
                                        className="btn-secondary flex-1 py-3"
                                        onClick={onClose}
                                    >
                                        סגור
                                    </button>
                                </div>
                            ) : (
                                <div className="bg-bg/30 p-4 rounded-xl border border-emerald-500/20 fade-in">
                                    <h5 className="text-sm font-bold text-white mb-3 text-center">
                                        {existingMealTypes.length > 0
                                            ? 'באיזו ארוחה להחליף?'
                                            : 'כאיזו ארוחה לשמור?'
                                        }
                                    </h5>
                                    <div className="grid grid-cols-2 gap-2">
                                        {allMealTypes.map(type => {
                                            const isExisting = existingMealTypes.includes(type);
                                            return (
                                                <button
                                                    key={type}
                                                    onClick={() => handleSelectMealType(type)}
                                                    className={`p-3 rounded-xl text-sm font-medium transition-all border ${isExisting
                                                        ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                                                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                                        }`}
                                                >
                                                    {mealTypeLabels[type]}
                                                    <span className="block text-[10px] mt-1 opacity-60">
                                                        {isExisting ? '(החלפה)' : '(חדש)'}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <button
                                        className="w-full mt-3 text-sm text-muted hover:text-white transition-colors py-2"
                                        onClick={() => setShowMealPicker(false)}
                                    >
                                        ← חזרה
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
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
};

export default CookFromHomeModal;
