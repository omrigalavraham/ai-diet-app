import React, { useState } from 'react';
import { createPortal } from 'react-dom';

interface IngredientSwapModalProps {
    ingredient: string;
    onClose: () => void;
    onSubmitSwap: (newIngredient: string) => Promise<{ success: boolean; requiresOverride: boolean; warningMessage?: string }>;
    onForceSwap: (newIngredient: string) => void;
}

const IngredientSwapModal: React.FC<IngredientSwapModalProps> = ({ ingredient, onClose, onSubmitSwap, onForceSwap }) => {
    const [replacement, setReplacement] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [warning, setWarning] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!replacement.trim()) return;

        setIsLoading(true);
        setWarning(null);

        try {
            const result = await onSubmitSwap(replacement);
            if (result.requiresOverride) {
                setWarning(result.warningMessage || 'אזהרה: השינוי עלול לחרוג מהיעדים.');
            } else if (result.success) {
                onClose();
            }
        } catch (error) {
            console.error('Error swapping ingredient:', error);
            setWarning('אירעה שגיאה בבדיקת הרכיב. נסה שוב מאוחר יותר.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForceApprove = () => {
        onForceSwap(replacement);
        onClose();
    };

    const modalContent = (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg/80 backdrop-blur-sm fade-in">
            <div className="bg-surface border border-surface-hover rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl">

                {/* Header */}
                <div className="p-4 border-b border-surface-hover flex justify-between items-center bg-surface-hover/30">
                    <h3 className="font-bold text-lg text-white">החלפת רכיב בארוחה</h3>
                    <button onClick={onClose} className="text-muted hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-sm text-muted mb-2">הרכיב הנוכחי:</p>
                        <div className="bg-surface-hover/50 p-3 rounded-xl border border-surface-hover text-white font-medium">
                            {ingredient}
                        </div>
                    </div>

                    {!warning ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-muted mb-2">במה תרצה להחליף?</label>
                                <input
                                    type="text"
                                    placeholder="לדוגמה: כוס אורז בסמטי מלא..."
                                    className="input-field w-full"
                                    value={replacement}
                                    onChange={(e) => setReplacement(e.target.value)}
                                    autoFocus
                                    disabled={isLoading}
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    className="btn-primary w-full flex justify-center items-center gap-2"
                                    disabled={!replacement.trim() || isLoading}
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="loader spin w-4 h-4 border-2 border-white/20 border-t-white"></div>
                                            <span>בודק מול ה-AI...</span>
                                        </>
                                    ) : (
                                        <span>✨ שאל את ה-AI</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6 fade-in">
                            <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/20 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
                                <h4 className="flex items-center gap-2 text-orange-400 font-bold mb-2">
                                    <span>⚠️</span> אזהרה חכמה מה-AI
                                </h4>
                                <p className="text-sm text-orange-100/90 leading-relaxed">
                                    {warning}
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setWarning(null)}
                                    className="btn-secondary flex-1"
                                >
                                    חזור ונסה משהו אחר
                                </button>
                                <button
                                    onClick={handleForceApprove}
                                    className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/30 hover:border-red-500/50 rounded-xl font-medium transition-all"
                                >
                                    החלף בכל זאת
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default IngredientSwapModal;
