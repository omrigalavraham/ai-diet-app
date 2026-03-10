import React, { useState } from 'react';
import type { WeightLog } from '../../types';

interface DailyWeighInModalProps {
    currentWeight: number;
    onClose: () => void;
    onSubmit: (weight: number, mood: WeightLog['mood'], notes: string) => void;
}

const DailyWeighInModal: React.FC<DailyWeighInModalProps> = ({ currentWeight, onClose, onSubmit }) => {
    const [weight, setWeight] = useState<number>(currentWeight);
    const [mood, setMood] = useState<WeightLog['mood']>('good');
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(weight, mood, notes);
        onClose();
    };

    const moods = [
        { value: 'great', label: '🔥 מצוין' },
        { value: 'good', label: '😄 טוב' },
        { value: 'neutral', label: '😐 סביר' },
        { value: 'bad', label: '🥱 עייף/רעב' }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm fade-in">
            <div className="bg-surface border border-surface-hover rounded-2xl w-full max-w-sm max-h-[90vh] overflow-hidden relative shadow-2xl flex flex-col">

                {/* Header */}
                <div className="p-4 border-b border-surface-hover flex justify-between items-center bg-surface-hover/30 shrink-0">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <span>⚖️</span> שקילה יומית
                    </h3>
                    <button type="button" onClick={onClose} className="text-muted hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-hover">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow custom-scrollbar">
                    <p className="text-sm text-muted mb-6 text-center">
                        מעקב יומי עוזר ל-AI לדייק את התפריט שלך. איך הלך על המשקל הבוקר?
                    </p>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-muted mb-2 text-center">משקל (ק"ג)</label>
                        <input
                            type="number"
                            min={30}
                            max={250}
                            step={0.1}
                            value={weight}
                            onChange={(e) => setWeight(Number(e.target.value))}
                            className="input-field text-3xl font-black text-center text-purple-400 py-4"
                            autoFocus
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-muted mb-3 text-center">איך ההרגשה הכללית?</label>
                        <div className="grid grid-cols-2 gap-2">
                            {moods.map(m => (
                                <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => setMood(m.value as WeightLog['mood'])}
                                    className={`py-2 px-3 rounded-lg text-sm transition-colors border ${mood === m.value
                                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 font-bold'
                                            : 'bg-surface/50 border-surface-hover text-muted hover:bg-surface-hover'
                                        }`}
                                >
                                    {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-muted mb-2 text-center">הערות ל-AI (אופציונלי)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="למשל: 'הייתי ממש רעב בערב' או 'האימון אתמול הרג אותי'"
                            className="input-field min-h-[80px] text-sm resize-none"
                        ></textarea>
                    </div>

                    <div className="flex gap-3">
                        <button type="button" onClick={onClose} className="btn-secondary flex-1 py-3 text-sm">
                            סגור
                        </button>
                        <button type="submit" className="btn-primary flex-1 py-3 text-sm border-none font-bold" style={{ background: 'linear-gradient(to right, #a855f7, #6b21a8)' }}>
                            עדכן נתונים
                        </button>
                    </div>
                </form>
            </div>
            {/* Minimal Scrollbar for smaller screens */}
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

export default DailyWeighInModal;
