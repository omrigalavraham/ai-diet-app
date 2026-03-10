import React, { useState } from 'react';
import { useUserStore } from '../../store/userStore';
import { supabase } from '../../lib/supabase';
import type { UserProfile } from '../../types';

const SettingsPage: React.FC = () => {
    const { profile, updateProfile, finalizeProfile } = useUserStore();
    const [isSaved, setIsSaved] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? Number(value) : value;
        updateProfile({ [name]: parsedValue } as unknown as Partial<UserProfile>);
        setIsSaved(false);
    };

    const handleAllergyToggle = (allergy: string) => {
        const current = profile?.allergies || [];
        const updated = current.includes(allergy)
            ? current.filter(a => a !== allergy)
            : [...current, allergy];
        updateProfile({ allergies: updated });
        setIsSaved(false);
    };

    const handleSave = async () => {
        await finalizeProfile();
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    if (!profile) return null;

    return (
        <div className="fade-in max-w-2xl mx-auto pb-12">
            <header className="mb-8">
                <h1 className="title-gradient text-3xl mb-2">הגדרות פרופיל</h1>
                <p className="text-muted">ערוך את הנתונים האישיים שלך כדי לדייק את התוכנית.</p>
            </header>

            <div className="card-glass p-6 md:p-8 space-y-8">
                {/* Personal Details Section */}
                <section>
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-surface-hover pb-2">פרטים אישיים</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label>שם מלא או כינוי</label>
                            <input type="text" name="name" value={profile.name || ''} onChange={handleChange} className="input-field" placeholder="איך תרצה שנקרא לך?" />
                        </div>

                        <div className="form-group">
                            <label>מין</label>
                            <select name="gender" value={profile.gender} onChange={handleChange} className="input-field">
                                <option value="male">זכר</option>
                                <option value="female">נקבה</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>גיל</label>
                            <input type="number" name="age" value={profile.age || ''} onChange={handleChange} className="input-field" min="16" max="100" />
                        </div>

                        <div className="form-group">
                            <label>גובה (בס"מ)</label>
                            <input type="number" name="height" value={profile.height || ''} onChange={handleChange} className="input-field" min="100" max="250" />
                        </div>

                        <div className="form-group">
                            <label>משקל נוכחי (ק"ג)</label>
                            <input type="number" name="weight" value={profile.weight || ''} onChange={handleChange} className="input-field" min="30" max="300" />
                        </div>

                        <div className="form-group">
                            <label>משקל יעד (ק"ג)</label>
                            <input type="number" name="goalWeight" value={profile.goalWeight || ''} onChange={handleChange} className="input-field" min="30" max="300" />
                        </div>
                    </div>
                </section>

                {/* Dietary Preferences Section */}
                <section>
                    <h3 className="text-xl font-bold text-white mb-4 border-b border-surface-hover pb-2">העדפות תזונה</h3>

                    <div className="form-group mb-4">
                        <label>סגנון תזונה עיקרי</label>
                        <select name="dietaryPreferences" value={profile.dietaryPreferences?.[0] || 'none'} onChange={(e) => updateProfile({ dietaryPreferences: [e.target.value] })} className="input-field">
                            <option value="none">ללא העדפה מיוחדת (הכל הולך)</option>
                            <option value="vegetarian">צמחוני</option>
                            <option value="vegan">טבעוני</option>
                            <option value="pescatarian">פסקטריאני (דגים וצמחוני)</option>
                            <option value="keto">קיטו (דל פחמימה)</option>
                            <option value="paleo">פליאו</option>
                        </select>
                    </div>

                    <div className="form-group mb-4">
                        <label className="mb-2 block">אלרגיות ורגישויות נפוצות</label>
                        <div className="flex flex-wrap gap-2">
                            {['בוטנים', 'אגוזים', 'חלב', 'ביצים', 'סויה', 'גלוטן', 'דגים', 'שומשום'].map(allergy => {
                                const isActive = profile.allergies?.includes(allergy);
                                return (
                                    <button
                                        key={allergy}
                                        className={`chip ${isActive ? 'chip-active' : 'chip-inactive'}`}
                                        onClick={() => handleAllergyToggle(allergy)}
                                    >
                                        {allergy}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>יש מאכלים שממש לא בא לך לראות בתפריט?</label>
                        <input
                            type="text"
                            name="dislikedFoods"
                            value={profile.dislikedFoods?.join(', ') || ''}
                            onChange={(e) => updateProfile({ dislikedFoods: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                            className="input-field"
                            placeholder="לדוגמה: כוסברה, פטריות, רסק עגבניות..."
                        />
                        <span className="text-xs text-muted mt-1">הפרד בפסיקים</span>
                    </div>
                </section>

                {/* Save Button */}
                <div className="pt-4 flex flex-col items-center">
                    <button
                        onClick={handleSave}
                        className={`btn-primary w-full md:w-auto px-12 py-3 transition-all ${isSaved ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                    >
                        {isSaved ? '✅ הנתונים נשמרו בהצלחה' : 'שמור שינויים'}
                    </button>
                    {isSaved && (
                        <p className="text-emerald-400 text-sm mt-3 fade-in">
                            היעד הקלורי שלך חושב מחדש בהתאם לנתונים החדשים.
                        </p>
                    )}
                </div>

                {/* Logout */}
                <div className="pt-4 border-t border-surface-hover text-center">
                    <button
                        onClick={async () => {
                            await supabase.auth.signOut();
                        }}
                        className="text-red-400 hover:text-red-300 text-sm underline underline-offset-4 transition-colors"
                    >
                        התנתק מהחשבון
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
