import React, { useState } from 'react';
import { useUserStore } from '../../store/userStore';

const WorkoutsHome: React.FC = () => {
    const { dailyWorkouts, logWorkout } = useUserStore();

    const jsDayToKey: Record<number, string> = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };
    const todayKey = jsDayToKey[new Date().getDay()];

    const todaysWorkout = dailyWorkouts[todayKey];
    const [calories, setCalories] = useState<number | ''>(75);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        logWorkout(todayKey, Number(calories) || 0);
    };

    return (
        <div className="fade-in max-w-2xl mx-auto pb-20">
            <header className="mb-8 text-center pt-8">
                <h1 className="title-gradient text-4xl mb-3">Seven App Tracker 🏃‍♂️</h1>
                <p className="text-muted text-lg">
                    סיימת את שבע הדקות היומיות שלך? הזן לכאן נתונים וה-AI ישקלל אותם.
                </p>
            </header>

            {/* Main Action Card */}
            <div className={`card-glass relative overflow-hidden mb-8 transition-all duration-500 ${todaysWorkout ? 'border-orange-500/50 shadow-[0_0_30px_rgba(249,115,22,0.15)] bg-orange-500/5' : ''}`}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500 opacity-20 blur-[50px] rounded-full translate-x-12 -translate-y-12 pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center text-center p-4">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6 shadow-xl ${todaysWorkout ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white' : 'bg-surface-hover text-orange-400'}`}>
                        {todaysWorkout ? '🔥' : '⏳'}
                    </div>

                    {!todaysWorkout ? (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-2">הזנת אימון להיום</h2>
                            <p className="text-muted mb-8 max-w-sm mx-auto">
                                כמה קלוריות שרפת בערך באימון ה-Seven שלך היום? קלוריות אלו יתווספו ליעד היומי שלך לאכילה!
                            </p>

                            <form onSubmit={handleSubmit} className="w-full max-w-xs mx-auto">
                                <div className="mb-6">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min={10}
                                            max={1000}
                                            step={5}
                                            value={calories}
                                            onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
                                            className="w-full bg-bg/50 border-2 border-surface-hover rounded-2xl py-4 text-center text-4xl font-black text-orange-400 focus:outline-none focus:border-orange-500/50 transition-colors"
                                            required
                                        />
                                        <span className="absolute top-1/2 -translate-y-12 left-0 right-0 text-center text-xs text-muted pointer-events-none">
                                            קק"ל
                                        </span>
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-4 rounded-xl font-bold text-white text-lg transition-transform hover:scale-[1.02] shadow-lg" style={{ background: 'linear-gradient(to right, #f97316, #ef4444)' }}>
                                    שמור וסנכרן ל-AI
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="fade-in pb-4">
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 mb-2">
                                אלופה! 🎉
                            </h2>
                            <p className="text-lg text-white mb-6">
                                שרפת היום <strong className="text-orange-400">{todaysWorkout.burnedCalories}</strong> קלוריות באימון.
                            </p>

                            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-xl text-orange-300">
                                <p className="text-sm font-medium mb-1">⚡ בונוס קלורי הופעל</p>
                                <p className="text-xs opacity-80">
                                    התקציב היומי שלך גדל בהתאם. אתה רשאי לאכול יותר היום (או לשמור את היתרה לחיטוב מהיר יותר).
                                </p>
                            </div>

                            <button onClick={() => logWorkout(todayKey, 0)} className="mt-8 text-xs text-muted hover:text-white underline decoration-surface-hover underline-offset-4 transition-colors">
                                בטל הזנה מחודשת
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Weekly Summary (Mocked UI for now) */}
            <div className="mt-12">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span>📊</span> היסטוריית אימונים (השבוע)
                </h3>

                <div className="space-y-3">
                    {['sunday', 'monday', 'tuesday', 'wednesday', 'thursday'].map((day) => {
                        const isToday = day === todayKey;
                        const workout = dailyWorkouts[day];
                        const dayNames: Record<string, string> = { sunday: 'ראשון', monday: 'שני', tuesday: 'שלישי', wednesday: 'רביעי', thursday: 'חמישי', friday: 'שישי', saturday: 'שבת' };

                        return (
                            <div key={day} className={`flex items-center justify-between p-4 rounded-xl border ${isToday ? 'border-orange-500/30 bg-orange-500/5' : 'border-surface-hover bg-surface/50'} transition-colors`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${workout ? 'bg-orange-500/20 text-orange-400' : 'bg-surface text-muted'}`}>
                                        {workout ? '🔥' : '—'}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-white">יום {dayNames[day]}</div>
                                        {isToday && <div className="text-xs text-orange-400">היום</div>}
                                    </div>
                                </div>

                                <div className="text-left font-mono">
                                    {workout ? (
                                        <span className="text-emerald-400 font-bold">+{workout.burnedCalories} <span className="text-xs font-sans text-muted">קק"ל</span></span>
                                    ) : (
                                        <span className="text-muted text-sm">לא הוזן</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default WorkoutsHome;
