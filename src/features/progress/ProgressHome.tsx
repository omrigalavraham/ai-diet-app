import React, { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DailyWeighInModal from '../dashboard/DailyWeighInModal';

const ProgressHome: React.FC = () => {
    const { profile, weightHistory, logWeight } = useUserStore();
    const [showWeighInModal, setShowWeighInModal] = useState(false);

    // Prepare data for chart
    const chartData = weightHistory
        .slice()
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(log => {
            const dateObj = new Date(log.date);
            return {
                ...log,
                displayDate: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`,
                rawWeight: log.weight
            };
        });

    // Check if user weighed in today
    const todaysDateString = new Date().toISOString().split('T')[0];
    const todaysWeighIn = weightHistory.find(w => w.date === todaysDateString);

    const getMoodWarning = () => {
        if (!todaysWeighIn) return null;
        if (todaysWeighIn.mood === 'bad' || todaysWeighIn.mood === 'terrible') {
            return (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-8 text-orange-200 fade-in">
                    <h4 className="font-bold flex items-center gap-2 mb-1">
                        <span className="text-xl">⚠️</span> ה-AI מזהה קושי
                    </h4>
                    <p className="text-sm opacity-90">
                        שמנו לב שציינת תחושת עייפות או רעב היום. יכול להיות שהתפריט הנוכחי במחזור דל מדי.
                        אם התחושה ממשיכה מחר, ה-AI יסדר מחדש את יחס הפחמימות כדי לעזור לך להרגיש טוב יותר.
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="fade-in max-w-4xl mx-auto pb-20">
            <header className="mb-8 text-center pt-8">
                <h1 className="title-gradient text-4xl mb-3">מעקב והתקדמות 📈</h1>
                <p className="text-muted text-lg">
                    גרף המשקל שלך והמגמות שה-AI מנתח.
                </p>
            </header>

            {getMoodWarning()}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Current Status Card */}
                <div className="card-glass relative overflow-hidden flex flex-col items-center justify-center text-center p-6 md:col-span-1">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 opacity-10 blur-3xl rounded-full"></div>
                    <span className="text-muted text-sm mb-2">משקל נוכחי</span>
                    <div className="text-5xl font-black text-white mb-2 relative z-10 flex items-baseline gap-1">
                        {profile?.weight} <span className="text-xl text-purple-400">ק"ג</span>
                    </div>
                    {profile?.goalWeight && (
                        <div className="text-sm text-purple-300 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 mt-2">
                            יעד: {profile.goalWeight} ק"ג
                        </div>
                    )}
                </div>

                {/* Weigh-in Action Card */}
                <div
                    onClick={() => !todaysWeighIn && setShowWeighInModal(true)}
                    className={`card-glass flex flex-col items-center justify-center text-center p-6 md:col-span-2 transition-all duration-300 ${!todaysWeighIn ? 'cursor-pointer hover:border-purple-500/50 hover:bg-surface-hover/50 group' : 'border-purple-500/20 bg-purple-500/5'}`}
                >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 transition-transform ${todaysWeighIn ? 'bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-surface-hover text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20'}`}>
                        {todaysWeighIn ? '✔️' : '⚖️'}
                    </div>

                    {!todaysWeighIn ? (
                        <>
                            <h3 className="text-xl font-bold text-white mb-2">שקילה יומית</h3>
                            <p className="text-muted max-w-sm">לחץ כאן כדי להזין את המשקל של היום ולשמור על רצף חיובי.</p>
                            <span className="mt-4 text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">הוסף נתונים &larr;</span>
                        </>
                    ) : (
                        <>
                            <h3 className="text-xl font-bold text-white mb-1">מעולה! עדכנת היום.</h3>
                            <p className="text-purple-300 text-sm">המשקל שלך נשמר. השקילה הבאה — מחר בבוקר.</p>
                            {todaysWeighIn.notes && (
                                <div className="mt-4 bg-black/20 p-3 rounded-lg text-xs italic text-muted max-w-xs border border-white/5">
                                    "{todaysWeighIn.notes}"
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Chart Section */}
            <div className="card-glass p-1 sm:p-6 mb-8">
                <div className="p-4 sm:p-0 mb-6 flex justify-between items-center border-b border-surface-hover/50 sm:border-0 pb-4 sm:pb-0">
                    <h3 className="text-xl font-bold text-white">מגמת ירידה (כל הזמן)</h3>
                    {weightHistory.length > 2 && (() => {
                        const sorted = [...weightHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                        const firstWeight = sorted[0].weight;
                        const lastWeight = sorted[sorted.length - 1].weight;
                        const isFlat = Math.abs(lastWeight - firstWeight) < 0.3;
                        const isLosing = lastWeight < firstWeight;

                        if (isFlat) {
                            return (
                                <span className="bg-yellow-500/10 text-yellow-400 text-xs px-2 py-1 rounded-full border border-yellow-500/20">
                                    מגמה יציבה
                                </span>
                            );
                        }
                        return isLosing ? (
                            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded-full border border-emerald-500/20">
                                מגמה חיובית
                            </span>
                        ) : (
                            <span className="bg-red-500/10 text-red-400 text-xs px-2 py-1 rounded-full border border-red-500/20">
                                מגמה שלילית
                            </span>
                        );
                    })()}
                </div>

                {weightHistory.length < 2 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-center opacity-50 bg-black/10 rounded-xl border border-dashed border-surface-hover m-4 sm:m-0">
                        <span className="text-4xl mb-3 grayscale">📉</span>
                        <p className="text-muted max-w-xs">עדיין אין מספיק נתונים לגרף. המשך להישקל כל בוקר!</p>
                    </div>
                ) : (
                    <div className="h-72 w-full mt-4 pr-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="displayDate"
                                    stroke="rgba(255,255,255,0.3)"
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <YAxis
                                    domain={['dataMin - 1', 'dataMax + 1']}
                                    stroke="rgba(255,255,255,0.3)"
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                    axisLine={false}
                                    tickLine={false}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: 'rgba(168, 85, 247, 0.3)', borderRadius: '12px', color: 'white' }}
                                    itemStyle={{ color: '#c084fc', fontWeight: 'bold' }}
                                    labelStyle={{ color: 'rgba(255,255,255,0.6)', marginBottom: '5px' }}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    formatter={(value: any) => [`${value} ק"ג`, 'משקל']}
                                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                    labelFormatter={(label: any) => `תאריך: ${label}`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="rawWeight"
                                    stroke="#a855f7"
                                    strokeWidth={4}
                                    dot={{ fill: '#c084fc', r: 5, strokeWidth: 2, stroke: '#1e293b' }}
                                    activeDot={{ r: 8, fill: '#fff', stroke: '#a855f7', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            {/* History List */}
            {weightHistory.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-white mb-4">היסטוריית שקילות</h3>
                    <div className="space-y-3">
                        {weightHistory.slice().reverse().map((log) => {
                            const dateObj = new Date(log.date);
                            const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

                            // Mood Emoji Map
                            const moodMap: Record<string, string> = {
                                'great': '🔥', 'good': '😄', 'neutral': '😐', 'bad': '🥱', 'terrible': '😫'
                            };

                            return (
                                <div key={log.date} className="bg-surface/30 border border-surface-hover rounded-xl p-4 flex justify-between items-center transition-colors hover:bg-surface/50">
                                    <div>
                                        <div className="font-semibold text-white mb-1">{log.weight} ק"ג</div>
                                        <div className="text-xs text-muted font-mono">{formattedDate}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {log.notes && (
                                            <span className="text-xs bg-black/20 px-2 py-1 rounded text-muted hidden sm:inline-block border border-white/5">
                                                יש הערה ל-AI
                                            </span>
                                        )}
                                        {log.mood && (
                                            <div className="bg-surface p-2 rounded-lg text-lg border border-surface-hover" title="הרגשה באותו יום">
                                                {moodMap[log.mood] || '😐'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
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

export default ProgressHome;
