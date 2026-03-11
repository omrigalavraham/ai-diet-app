import React, { useState } from 'react';

interface DaySelectionModalProps {
    onClose: () => void;
    onGenerate: (selectedDays: string[]) => void;
}

const dayNamesHebrew: Record<string, string> = {
    sunday: 'ראשון',
    monday: 'שני',
    tuesday: 'שלישי',
    wednesday: 'רביעי',
    thursday: 'חמישי',
    friday: 'שישי',
    saturday: 'שבת',
};

// Map JS getDay() (0=Sun) to our string keys
const jsDayToKey: Record<number, string> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
};

const DaySelectionModal: React.FC<DaySelectionModalProps> = ({ onClose, onGenerate }) => {
    // 1. Time-Aware Logic: Determine what days are left in the week
    const getInitialDaysAndLateStatus = () => {
        const today = new Date();
        const currentDayNum = today.getDay(); // 0 is Sunday, 4 is Thursday
        const currentHour = today.getHours();

        // If it's past the last day of the week, offer the whole next week
        let startDayIndex = currentDayNum;
        if (currentDayNum > 6) {
            startDayIndex = 0;
        }

        const daysLeft: string[] = [];
        for (let i = startDayIndex; i <= 6; i++) {
            daysLeft.push(jsDayToKey[i]);
        }

        const lateFlag = currentHour >= 16;
        return { daysLeft, lateFlag };
    };

    const initialData = getInitialDaysAndLateStatus();

    const [availableDays] = useState<string[]>(initialData.daysLeft);
    const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set(initialData.daysLeft));
    const [isLate] = useState(initialData.lateFlag);

    const toggleDay = (day: string) => {
        const newSelection = new Set(selectedDays);
        if (newSelection.has(day)) {
            newSelection.delete(day);
        } else {
            newSelection.add(day);
        }
        setSelectedDays(newSelection);
    };

    const handleGenerate = () => {
        if (selectedDays.size === 0) return;
        onGenerate(Array.from(selectedDays));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 backdrop-blur-sm p-4 fade-in">
            <div className="w-full max-w-md bg-surface border border-surface-hover rounded-2xl shadow-2xl p-6 relative overflow-hidden">

                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-10 blur-2xl rounded-full translate-x-12 -translate-y-12"></div>

                <h2 className="title-gradient text-2xl mb-2 relative z-10">תכנון ארוחות קדימה</h2>
                <p className="text-muted text-sm mb-6 relative z-10">
                    בחר לאילו ימים תרצה עד יום חמישי.
                </p>

                {isLate && availableDays.length > 0 && availableDays[0] === jsDayToKey[new Date().getDay()] && (
                    <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-200">
                        <span className="font-bold">שים לב:</span> השעה כבר מאוחרת. אם תבחר להפיק תפריט ל"היום", ה-AI יספק לך רק הצעות לארוחת ערב ונשנוש לילה.
                    </div>
                )}

                <div className="space-y-3 mb-8">
                    {availableDays.map((day) => {
                        const isSelected = selectedDays.has(day);
                        return (
                            <label
                                key={day}
                                className={`flex items-center p-4 rounded-xl cursor-pointer border transition-all ${isSelected ? 'bg-primary/10 border-primary' : 'bg-bg border-surface-hover hover:border-text-muted'
                                    }`}
                                onClick={() => toggleDay(day)}
                            >
                                <div className={`w-6 h-6 rounded-md flex items-center justify-center ml-3 transition-colors ${isSelected ? 'bg-primary text-white' : 'border-2 border-surface-hover'
                                    }`}>
                                    {isSelected && <span className="text-sm">✓</span>}
                                </div>
                                <span className={`font-medium ${isSelected ? 'text-white' : 'text-muted'}`}>
                                    יום {dayNamesHebrew[day]}
                                </span>

                                {/* Indicate if it's "Today" */}
                                {day === jsDayToKey[new Date().getDay()] && (
                                    <span className="mr-auto text-xs bg-surface px-2 py-1 rounded text-muted">היום</span>
                                )}
                            </label>
                        );
                    })}

                    {availableDays.length === 0 && (
                        <div className="text-center p-6 text-muted border border-surface-hover border-dashed rounded-xl">
                         אין ימים נוספים לתכנן השבוע. אפשר להתחיל לתכנן את השבוע הבא.
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        className="btn-secondary flex-1"
                        onClick={onClose}
                    >
                        ביטול
                    </button>
                    <button
                        className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={selectedDays.size === 0}
                        onClick={handleGenerate}
                    >
                        בנה תפריט ✨
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DaySelectionModal;
