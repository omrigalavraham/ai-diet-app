import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Meal } from '../../types';

interface CheatMealModalProps {
    mealData: Meal;
    onClose: () => void;
    onSubmit: (estimatedCalories: number) => void;
}

const CheatMealModal: React.FC<CheatMealModalProps> = ({ mealData, onClose, onSubmit }) => {
    const [calories, setCalories] = useState<number>(mealData.calories + 400);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(calories);
        onClose();
    };

    const modalContent = (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm fade-in">
            <div className="bg-surface border border-surface-hover rounded-2xl w-full max-w-sm max-h-[90vh] overflow-hidden relative shadow-2xl flex flex-col">

                {/* Header */}
                <div className="p-4 border-b border-surface-hover flex justify-between items-center bg-surface-hover/30 shrink-0">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <span>🍔</span> אוכלים בחוץ?
                    </h3>
                    <button type="button" onClick={onClose} className="text-muted hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow custom-scrollbar">
                    <p className="text-sm text-muted mb-4">
                        אם החלטת להתפנק במסעדה במקום <strong className="text-white">{mealData.name}</strong>, ספר/י לנו תיאורטית כמה קלוריות זה יעלה כדי שנוכל לאזן את שאר היום.
                    </p>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-muted mb-2">הערכה קלורית (קק"ל)</label>
                        <input
                            type="number"
                            min={mealData.calories}
                            max={3000}
                            step={50}
                            value={calories}
                            onChange={(e) => setCalories(Number(e.target.value))}
                            className="input-field text-xl font-bold text-center"
                            autoFocus
                        />
                        <p className="text-xs text-orange-400/80 mt-2 text-center">
                            המנה המקורית: {mealData.calories} קק"ל
                        </p>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl mb-6 text-sm text-emerald-300/90 text-center leading-relaxed">
                        <span className="block mb-1 text-emerald-400">⚡ התאמה חכמה</span>
                        אנו נחשב מחדש את שאר הארוחות שלך להיום (ואולי גם מחר) כדי למזער נזקים!
                    </div>

                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3 text-sm">
                            ביטול
                        </button>
                        <button type="submit" className="btn-primary flex-1 py-3 text-sm shadow-[0_0_15px_rgba(239,68,68,0.3)] bg-gradient-to-r from-red-500 to-orange-500 border-none font-bold">
                            עדכן תפריט
                        </button>
                    </div>
                </form>
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

export default CheatMealModal;
