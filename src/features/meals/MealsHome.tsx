import React, { useState } from 'react';
import MealCard from './MealCard';
import DaySelectionModal from './DaySelectionModal';
import SmartGroceryListModal from './SmartGroceryListModal';
import CookFromHomeModal from './CookFromHomeModal';
import { useUserStore } from '../../store/userStore';

const dayNamesHebrew: Record<string, string> = {
    sunday: 'ראשון',
    monday: 'שני',
    tuesday: 'שלישי',
    wednesday: 'רביעי',
    thursday: 'חמישי',
    friday: 'שישי',
    saturday: 'שבת',
};

const jsDayToKey: Record<number, string> = {
    0: 'sunday',
    1: 'monday',
    2: 'tuesday',
    3: 'wednesday',
    4: 'thursday',
    5: 'friday',
    6: 'saturday'
};

const MealsHome: React.FC = () => {
    const { weeklyPlan, generateWeeklyPlan, swapMeal, generateSOSSnack } = useUserStore();
    const [isGenerating, setIsGenerating] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showGroceryList, setShowGroceryList] = useState(false);
    const [showCookFromHome, setShowCookFromHome] = useState(false);

    // Default selected tab based on current day if available in plan
    const todayKey = jsDayToKey[new Date().getDay()];
    const [selectedTab, setSelectedTab] = useState<string>(
        weeklyPlan && weeklyPlan[todayKey] ? todayKey :
            weeklyPlan ? Object.keys(weeklyPlan)[0] : ''
    );

    const handleGenerate = async (selectedDays: string[]) => {
        setShowModal(false);
        setIsGenerating(true);
        await generateWeeklyPlan(selectedDays);
        setSelectedTab(selectedDays[0]);
        setIsGenerating(false);
    };

    const handleSwapMeal = (mealType: string) => {
        swapMeal(selectedTab, mealType);
    };

    if (!weeklyPlan) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center fade-in px-4">
                <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center text-4xl mb-6 shadow-xl shadow-primary/10">
                    ✨
                </div>
                <h1 className="title-gradient text-3xl mb-4">התפריט שלך ממתין</h1>
                <p className="text-muted max-w-md mx-auto mb-8">
                    ה-AI שלנו מוכן להרכיב עבורך את הארוחות לאורך השבוע, כולל חישובים מדויקים והתחשבות בטעם שלך.
                </p>
                <button
                    className="btn-primary px-8 py-4 text-lg"
                    onClick={() => setShowModal(true)}
                >
                    בוא נתכנן את הארוחות
                </button>
                <button
                    className="btn-secondary px-6 py-3 text-base mt-3 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50"
                    onClick={() => setShowCookFromHome(true)}
                >
                    🏠 יש לי בבית — תכין לי מתכון
                </button>
                {showModal && <DaySelectionModal onClose={() => setShowModal(false)} onGenerate={handleGenerate} />}
                {showCookFromHome && (
                    <CookFromHomeModal
                        currentDay={todayKey}
                        dayHebrew={dayNamesHebrew[todayKey] || ''}
                        existingMealTypes={[]}
                        onClose={() => setShowCookFromHome(false)}
                        onMealSet={() => setSelectedTab(todayKey)}
                    />
                )}
            </div>
        );
    }

    // Identify if the active tab is "Today"
    const isToday = selectedTab === todayKey;

    return (
        <div className="fade-in">
            {showModal && <DaySelectionModal onClose={() => setShowModal(false)} onGenerate={handleGenerate} />}

            <header className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-4 relative z-10">
                <div>
                    <h1 className="title-gradient text-3xl mb-2">תפריט שבועי</h1>
                    <p className="text-muted">אישור תפריטים והחלפת מנות לשבוע הקרוב.</p>
                </div>
                <div className="flex items-center gap-3 self-start md:self-auto">
                    <button
                        className="btn-secondary text-sm border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50"
                        onClick={() => setShowGroceryList(true)}
                        title="הפק רשימת קניות"
                    >
                        🛒 רשימת קניות
                    </button>
                    <button
                        className="btn-secondary text-sm border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50"
                        onClick={() => setShowCookFromHome(true)}
                        title="צור מתכון ממה שיש בבית"
                    >
                        🏠 יש לי בבית
                    </button>
                    {isToday && (!weeklyPlan[todayKey]?.sosSnack) && (
                        <button
                            className="btn-secondary text-sm border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                            onClick={() => {
                                generateSOSSnack(todayKey);
                                setSelectedTab(todayKey);
                            }}
                            title="רעב פתאומי? לחץ כאן לחילוץ קלוריות"
                        >
                            🆘 נשנוש חירום
                        </button>
                    )}
                    <button
                        className="btn-secondary text-sm"
                        onClick={() => setShowModal(true)}
                    >
                        ✨ תכנן ימים נוספים
                    </button>
                </div>
            </header>

            {/* Tab Bar */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide relative z-10 w-full" style={{ scrollSnapType: 'x mandatory' }}>
                {Object.keys(weeklyPlan).map(day => (
                    <button
                        key={day}
                        onClick={() => setSelectedTab(day)}
                        style={{ scrollSnapAlign: 'start' }}
                        className={`whitespace-nowrap px-5 py-2.5 rounded-full transition-all text-sm font-medium border ${selectedTab === day
                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                            : 'bg-surface border-surface-hover text-muted hover:border-text-muted hover:text-white'
                            }`}
                    >
                        יום {dayNamesHebrew[day]}
                        {day === todayKey && <span className="mr-2 text-xs opacity-70">(היום)</span>}
                    </button>
                ))}
            </div>

            {isGenerating ? (
                <div className="flex flex-col items-center justify-center p-12 md:p-20 card-glass fade-in">
                    <div className="loader spin mb-6"></div>
                    <h3 className="font-bold text-xl mb-2 text-white">ה-AI מרכיב לך תפריט מנצח...</h3>
                    <p className="text-muted text-sm text-center">מחשב כמויות, מוודא גיוון ומתאים להעדפות.</p>
                </div>
            ) : (
                <div key={selectedTab} className="fade-in">
                    {weeklyPlan[selectedTab] ? (
                        <>
                            {isToday && new Date().getHours() >= 16 ? (
                                <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                                    <h4 className="text-orange-400 font-bold mb-1">השעה כבר מאוחרת</h4>
                                    <p className="text-sm text-orange-200 opacity-90">הצגנו עבורך הצעות רק לארוחת ערב ונשנוש להמשך היום.</p>
                                </div>
                            ) : null}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                                {/* If it's today and past 16:00, only show dinner and snack */}
                                {(!isToday || new Date().getHours() < 16) && weeklyPlan[selectedTab].breakfast && (
                                    <MealCard dayKey={selectedTab} mealType="breakfast" mealData={weeklyPlan[selectedTab].breakfast} onSwap={handleSwapMeal} />
                                )}
                                {(!isToday || new Date().getHours() < 16) && weeklyPlan[selectedTab].lunch && (
                                    <MealCard dayKey={selectedTab} mealType="lunch" mealData={weeklyPlan[selectedTab].lunch} onSwap={handleSwapMeal} />
                                )}
                                {weeklyPlan[selectedTab].dinner && (
                                    <MealCard dayKey={selectedTab} mealType="dinner" mealData={weeklyPlan[selectedTab].dinner} onSwap={handleSwapMeal} />
                                )}
                                {weeklyPlan[selectedTab].snack && (
                                    <MealCard dayKey={selectedTab} mealType="snack" mealData={weeklyPlan[selectedTab].snack} onSwap={handleSwapMeal} />
                                )}
                                {weeklyPlan[selectedTab].sosSnack && (
                                    <MealCard dayKey={selectedTab} mealType="sosSnack" mealData={weeklyPlan[selectedTab].sosSnack} onSwap={handleSwapMeal} />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-12 text-muted bg-surface/30 rounded-2xl border border-surface-hover border-dashed">
                            משום מה המערכת לא מצאה תפריט ליום זה.
                        </div>
                    )}
                </div>
            )}

            {showGroceryList && weeklyPlan && (
                <SmartGroceryListModal
                    weeklyPlan={weeklyPlan}
                    onClose={() => setShowGroceryList(false)}
                />
            )}

            {showCookFromHome && (
                <CookFromHomeModal
                    currentDay={selectedTab || todayKey}
                    dayHebrew={dayNamesHebrew[selectedTab || todayKey] || ''}
                    existingMealTypes={
                        weeklyPlan && weeklyPlan[selectedTab || todayKey]
                            ? Object.keys(weeklyPlan[selectedTab || todayKey])
                            : []
                    }
                    onClose={() => setShowCookFromHome(false)}
                    onMealSet={() => {
                        // Refresh the tab to show the new meal
                        setSelectedTab(selectedTab || todayKey);
                    }}
                />
            )}
        </div>
    );
};

export default MealsHome;
