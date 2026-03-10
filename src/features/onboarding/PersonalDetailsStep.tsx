import React from 'react';
import { useUserStore } from '../../store/userStore';
import type { UserProfile } from '../../types';

const PersonalDetailsStep: React.FC = () => {
    const { profile, updateProfile, nextStep, prevStep } = useUserStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? Number(value) : value;
        updateProfile({ [name]: parsedValue } as unknown as Partial<UserProfile>);
    };

    const handleNext = () => {
        if (!profile?.name || !profile?.age || !profile?.height || !profile?.weight || !profile?.goalWeight) {
            alert("אנא מלא את כל השדות במספרים תקינים כדי להמשיך.");
            return;
        }

        // Ensure dropdown defaults are in state if user never touched them
        if (!profile.activityLevel) updateProfile({ activityLevel: 'sedentary' });
        if (!profile.gender) updateProfile({ gender: 'male' });

        nextStep();
    };

    return (
        <div className="onboarding-step">
            <h2 className="mb-6 text-center">בוא נכיר קצת יותר</h2>

            <div className="form-group mb-4">
                <label>שם מלא או כינוי</label>
                <input
                    type="text"
                    name="name"
                    value={profile?.name || ''}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="איך תרצה שנקרא לך?"
                />
            </div>

            <div className="form-group mb-4">
                <label>גיל</label>
                <input
                    type="number"
                    name="age"
                    value={profile?.age || ''}
                    onChange={handleChange}
                    className="input-field"
                    min="16" max="100"
                />
            </div>

            <div className="form-group mb-4">
                <label>מין</label>
                <select name="gender" value={profile?.gender || 'male'} onChange={handleChange} className="input-field">
                    <option value="male">זכר</option>
                    <option value="female">נקבה</option>
                </select>
            </div>

            <div className="form-group mb-4">
                <label>גובה (בס"מ)</label>
                <input
                    type="number"
                    name="height"
                    value={profile?.height || ''}
                    onChange={handleChange}
                    className="input-field"
                    min="100" max="250"
                />
            </div>

            <div className="form-group mb-4">
                <label>רמת פעילות גופנית</label>
                <select name="activityLevel" value={profile?.activityLevel || 'sedentary'} onChange={handleChange} className="input-field">
                    <option value="sedentary">יושב רוב היום (מעט פעילות)</option>
                    <option value="light">פעילות קלה (1-3 פעמים בשבוע)</option>
                    <option value="moderate">גרוס בינוני (3-5 פעמים בשבוע)</option>
                    <option value="active">פעיל מאוד (6-7 פעמים בשבוע)</option>
                    <option value="very_active">ספורטאי / עבודה פיזית</option>
                </select>
            </div>

            <div className="form-group mb-4">
                <label>משקל נוכחי (ק"ג)</label>
                <input
                    type="number"
                    name="weight"
                    value={profile?.weight || ''}
                    onChange={handleChange}
                    className="input-field"
                    min="30" max="300"
                />
            </div>

            <div className="form-group mb-6">
                <label>משקל יעד (ק"ג)</label>
                <input
                    type="number"
                    name="goalWeight"
                    value={profile?.goalWeight || ''}
                    onChange={handleChange}
                    className="input-field"
                    min="30" max="300"
                />
            </div>

            <div className="flex gap-4">
                <button className="btn-secondary flex-1" onClick={prevStep}>חזור</button>
                <button className="btn-primary flex-1" onClick={handleNext}>המשך</button>
            </div>
        </div>
    );
};

export default PersonalDetailsStep;
