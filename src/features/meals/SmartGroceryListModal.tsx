import React, { useState, useMemo } from 'react';
import type { WeeklyPlan } from '../../types';

interface SmartGroceryListModalProps {
    weeklyPlan: WeeklyPlan;
    onClose: () => void;
}

const SmartGroceryListModal: React.FC<SmartGroceryListModalProps> = ({ weeklyPlan, onClose }) => {
    const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

    // Basic logic to group ingredients from the whole week
    const groupedList = useMemo(() => {
        const categories: Record<string, string[]> = {
            'חלבונים': [],
            'פחמימות': [],
            'ירקות ופירות': [],
            'שונות': []
        };

        const allIngredients = new Set<string>();

        // Extract all unique ingredients
        Object.values(weeklyPlan).forEach(dayObj => {
            Object.values(dayObj).forEach(meal => {
                if (meal && meal.ingredients) {
                    meal.ingredients.forEach(ing => allIngredients.add(ing));
                }
            });
        });

        // Basic classification (Mock AI categorization)
        allIngredients.forEach(ing => {
            const lower = ing.toLowerCase();
            if (lower.includes('עוף') || lower.includes('דג') || lower.includes('בקר') || lower.includes('טופו') || lower.includes('ביצ') || lower.includes('חלבון') || lower.includes('גבינ')) {
                categories['חלבונים'].push(ing);
            } else if (lower.includes('אורז') || lower.includes('פחמימה') || lower.includes('פסטה') || lower.includes('לחם') || lower.includes('תפוח אדמה') || lower.includes('שיבולת')) {
                categories['פחמימות'].push(ing);
            } else if (lower.includes('ירק') || lower.includes('עגבני') || lower.includes('מלפפון') || lower.includes('חס') || lower.includes('תפוח') || lower.includes('בננה') || lower.includes('תרד') || lower.includes('פלפל') || lower.includes('בצל')) {
                categories['ירקות ופירות'].push(ing);
            } else {
                categories['שונות'].push(ing);
            }
        });

        return Object.entries(categories).map(([name, items]) => ({ name, items })).filter(cat => cat.items.length > 0);
    }, [weeklyPlan]);

    const toggleItem = (item: string) => {
        const newSet = new Set(checkedItems);
        if (newSet.has(item)) {
            newSet.delete(item);
        } else {
            newSet.add(item);
        }
        setCheckedItems(newSet);
    };

    const totalItems = useMemo(() => groupedList.reduce((acc, cat) => acc + cat.items.length, 0), [groupedList]);
    const progress = totalItems > 0 ? (checkedItems.size / totalItems) * 100 : 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm fade-in">
            <div className="bg-surface border border-surface-hover rounded-2xl w-full max-w-lg overflow-hidden relative shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-surface-hover flex justify-between items-center bg-surface-hover/30">
                    <div>
                        <h3 className="font-bold text-lg text-white flex items-center gap-2">
                            <span>🛒</span> רשימת קניות קסומה
                        </h3>
                        <p className="text-xs text-muted flex items-center gap-1 mt-1">
                            <span>מופקת אוטומטית מהתפריט השבועי</span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full">AI</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="text-muted hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover">
                        ✕
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 w-full bg-surface-hover shrink-0">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-grow custom-scrollbar">
                    {groupedList.length === 0 ? (
                        <div className="text-center py-8 text-muted">
                            <span className="text-4xl block mb-2 opacity-50">🛒</span>
                            אין מצרכים ברשימה. הכן קודם תפריט!
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {groupedList.map(category => (
                                <div key={category.name} className="animate-slide-up" style={{ animationFillMode: 'both' }}>
                                    <h4 className="font-bold text-emerald-400 mb-3 ml-2 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        {category.name} ({category.items.length})
                                    </h4>
                                    <div className="space-y-2 bg-bg/30 p-3 rounded-xl border border-surface/50">
                                        {category.items.map((item, idx) => {
                                            const isChecked = checkedItems.has(item);
                                            return (
                                                <label
                                                    key={idx}
                                                    onClick={(e) => { e.preventDefault(); toggleItem(item); }}
                                                    className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-all ${isChecked ? 'opacity-50 grayscale bg-surface/30' : 'hover:bg-surface-hover'}`}
                                                >
                                                    <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isChecked ? 'bg-emerald-500 border-emerald-500 text-bg' : 'border-muted'}`}>
                                                        {isChecked && <span className="text-xs font-bold">✓</span>}
                                                    </div>
                                                    <span className={`text-sm ${isChecked ? 'line-through text-muted' : 'text-white'}`}>
                                                        {item}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-surface-hover bg-bg/50 shrink-0 flex justify-between items-center">
                    <span className="text-sm text-muted">
                        נאספו {checkedItems.size} מתוך {totalItems} פריטים
                    </span>
                    <button
                        onClick={onClose}
                        className="btn-primary py-2 px-6"
                    >
                        סגור רשימה
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
                .animate-slide-up {
                    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default SmartGroceryListModal;
