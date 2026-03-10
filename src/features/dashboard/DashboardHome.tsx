import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import WorkoutLogModal from './WorkoutLogModal';
import DailyWeighInModal from './DailyWeighInModal';

const DashboardHome: React.FC = () => {
    const { profile, weeklyPlan, dailyWorkouts, logWorkout, weightHistory, logWeight } = useUserStore();
    const [showWorkoutModal, setShowWorkoutModal] = useState(false);
    const [showWeighInModal, setShowWeighInModal] = useState(false);

    const jsDayToKey: Record<number, string> = { 0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday' };
    const todayKey = jsDayToKey[new Date().getDay()];

    // If there's no data yet (e.g. testing directly on '/'), show a fallback
    if (!profile?.targetDailyCalories) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">No data found</h2>
                <p className="text-muted">Please complete the onboarding first.</p>
            </div>
        );
    }

    // Calculate today's caloric bonus from workouts
    const todaysWorkout = dailyWorkouts[todayKey];
    const burnedCalories = todaysWorkout ? todaysWorkout.burnedCalories : 0;
    const adjustedDailyCalories = (profile?.targetDailyCalories || 0) + burnedCalories;

    // Check if user weighed in today
    const todaysDateString = new Date().toISOString().split('T')[0];
    const todaysWeighIn = weightHistory.find(w => w.date === todaysDateString);

    return (
        <div className="fade-in">
            <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                    <h1 className="title-gradient text-3xl mb-2">שלום, {profile?.name || 'אלוף'}! 🚀</h1>
                    <p className="text-muted">איזה כיף לראות אותך. זה הלו"ז והיעדים שלך להיום.</p>
                </div>
            </header>

            {/* Main Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Calories Card */}
                <div className="card-glass relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary opacity-20 blur-2xl rounded-full translate-x-12 -translate-y-12"></div>
                    <h3 className="text-lg font-semibold mb-4 text-white">תקציב קלוריות יומי</h3>
                    <div className="flex items-end gap-2 mb-2">
                        <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">
                            {adjustedDailyCalories}
                        </span>
                        <span className="text-muted mb-1">קק"ל נותרו</span>
                        {burnedCalories > 0 && (
                            <span className="text-xs text-orange-400 font-bold mb-2 mr-2 bg-orange-500/10 px-2 py-0.5 rounded-full">
                                +{burnedCalories} מאימון
                            </span>
                        )}
                    </div>

                    <div className="progress-bar mt-4 bg-slate-800 h-2">
                        <div className="progress-fill bg-gradient-to-r from-emerald-500 to-green-400 w-0 h-full rounded-full" style={{ width: '0%' }}></div>
                    </div>
                </div>

                {/* Macros Card */}
                <div className="card-glass">
                    <h3 className="text-lg font-semibold mb-4 text-white">מקרו-נוטריאנטים</h3>
                    <div className="flex justify-between items-center h-full pb-4">

                        <div className="flex flex-col items-center">
                            <span className="text-sm text-muted mb-1">חלבון</span>
                            <span className="font-bold text-xl">{profile.targetMacros?.protein}g</span>
                        </div>

                        <div className="h-12 w-px bg-slate-700"></div>

                        <div className="flex flex-col items-center">
                            <span className="text-sm text-muted mb-1">פחמימה</span>
                            <span className="font-bold text-xl">{profile.targetMacros?.carbs}g</span>
                        </div>

                        <div className="h-12 w-px bg-slate-700"></div>

                        <div className="flex flex-col items-center">
                            <span className="text-sm text-muted mb-1">שומן</span>
                            <span className="font-bold text-xl">{profile.targetMacros?.fat}g</span>
                        </div>

                    </div>
                </div>
            </section>

            {/* Quick Action Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/meals" className="card-glass flex flex-col items-start hover:border-emerald-500/30 transition-colors cursor-pointer group text-right">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 text-emerald-500 group-hover:scale-110 transition-transform">
                        🍲
                    </div>
                    <h4 className="font-bold text-lg mb-1 relative z-10 w-full">התפריט להיום</h4>
                    <p className="text-sm text-muted mb-4 w-full">
                        {(() => {
                            if (weeklyPlan && weeklyPlan[todayKey]) {
                                const mealCount = Object.keys(weeklyPlan[todayKey]).length;
                                return `${mealCount} ארוחות ממתינות לך היום.`;
                            }
                            return 'טרם תכננת ארוחות להיום.';
                        })()}
                    </p>
                    <span className="text-emerald-400 font-medium text-sm mt-auto inline-flex items-center gap-1 w-full flex-row-reverse justify-end">
                        {weeklyPlan ? 'צפה בתפריט' : 'תכנן עכשיו'} &larr;
                    </span>
                </Link>

                <div onClick={() => !todaysWorkout && setShowWorkoutModal(true)} className={`card-glass flex flex-col items-start transition-colors group text-right ${!todaysWorkout ? 'cursor-pointer hover:border-orange-500/30' : 'opacity-90'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 transition-transform ${todaysWorkout ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-500 group-hover:scale-110'}`}>
                        {todaysWorkout ? '🔥' : '🏋️'}
                    </div>
                    <h4 className="font-bold text-lg mb-1 relative z-10 w-full">אימון Seven</h4>
                    <p className="text-sm text-muted mb-4 w-full">
                        {todaysWorkout
                            ? `כל הכבוד! שרפת ${todaysWorkout.burnedCalories} קלוריות להיום.`
                            : 'האם סיימת את 7 הדקות היומיות שלך?'
                        }
                    </p>
                    <span className={`font-medium text-sm mt-auto inline-flex items-center gap-1 w-full flex-row-reverse justify-end ${todaysWorkout ? 'text-orange-400' : 'text-blue-400'}`}>
                        {todaysWorkout ? 'הושלם ✔️' : 'הזן נתוני אימון ➕'}
                    </span>
                </div>

                <div onClick={() => !todaysWeighIn && setShowWeighInModal(true)} className={`card-glass flex flex-col items-start transition-colors md:col-span-2 lg:col-span-1 group text-right ${!todaysWeighIn ? 'cursor-pointer hover:border-purple-500/30' : 'opacity-90'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 transition-transform ${todaysWeighIn ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-500/20 text-purple-500 group-hover:scale-110'}`}>
                        {todaysWeighIn ? '📊' : '⚖️'}
                    </div>
                    <h4 className="font-bold text-lg mb-1 relative z-10 w-full">שקילה יומית</h4>
                    <p className="text-sm text-muted mb-4 w-full">
                        {todaysWeighIn
                            ? `משקל נוכחי: ${todaysWeighIn.weight} ק"ג. ${todaysWeighIn.mood === 'great' ? 'מעולה!' : ''}`
                            : 'עדיין לא הוספת שקילה להיום.'
                        }
                    </p>
                    <span className={`font-medium text-sm mt-auto inline-flex items-center gap-1 w-full flex-row-reverse justify-end ${todaysWeighIn ? 'text-purple-400' : 'text-purple-400 hover:text-purple-300'}`}>
                        {todaysWeighIn ? 'הושלם להיום ✔️' : 'עדכן משקל עכשיו ➕'}
                    </span>
                </div>
            </section>

            {showWorkoutModal && (
                <WorkoutLogModal
                    onClose={() => setShowWorkoutModal(false)}
                    onSubmit={(calories) => logWorkout(todayKey, calories)}
                />
            )}

            {showWeighInModal && (
                <DailyWeighInModal
                    currentWeight={profile?.weight || 80}
                    onClose={() => setShowWeighInModal(false)}
                    onSubmit={(weight, mood, notes) => logWeight(weight, todaysDateString, mood, notes)}
                />
            )}
        </div>
    );
};

export default DashboardHome;
