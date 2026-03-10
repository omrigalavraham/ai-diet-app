import React, { useState } from 'react';

interface WorkoutLogModalProps {
    onClose: () => void;
    onSubmit: (burnedCalories: number) => void;
}

const WorkoutLogModal: React.FC<WorkoutLogModalProps> = ({ onClose, onSubmit }) => {
    const [calories, setCalories] = useState<number>(75); // Default estimated for 7 min workout

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(calories);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm fade-in">
            <div className="bg-surface border border-surface-hover rounded-2xl w-full max-w-sm overflow-hidden relative shadow-2xl flex flex-col">

                {/* Header */}
                <div className="p-4 border-b border-surface-hover flex justify-between items-center bg-surface-hover/30 shrink-0">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <span>🔥</span> אימון Seven
                    </h3>
                    <button type="button" onClick={onClose} className="text-muted hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6">
                    <p className="text-sm text-muted mb-4 text-center">
                        כל הכבוד על האימון! כמה קלוריות שרפת בערך לפי אפליקציית Seven?
                    </p>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-muted mb-2 text-center">הוצאה קלורית (קק"ל)</label>
                        <input
                            type="number"
                            min={10}
                            max={1000}
                            step={5}
                            value={calories}
                            onChange={(e) => setCalories(Number(e.target.value))}
                            className="input-field text-3xl font-black text-center text-orange-400 py-4"
                            autoFocus
                        />
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl mb-6 text-sm text-blue-300/90 text-center leading-relaxed">
                        <span className="block mb-1 text-blue-400">⚡ עדכון יעד יומי</span>
                        הקלוריות ששרפת יתווספו אוטומטית כיעד קלורי נוסף שתוכל לאכול היום!
                    </div>

                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3 text-sm">
                            סגור
                        </button>
                        <button type="submit" className="btn-primary flex-1 py-3 text-sm border-none font-bold" style={{ background: 'linear-gradient(to right, #f97316, #ef4444)' }}>
                            שמור אימון
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WorkoutLogModal;
