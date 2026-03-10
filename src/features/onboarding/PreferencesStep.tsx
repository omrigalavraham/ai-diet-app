import React, { useState } from 'react';
import { useUserStore } from '../../store/userStore';

const commonAllergies = ['בוטנים', 'חלב', 'ביצים', 'גלוטן', 'סויה', 'אגוזים', 'דגים'];
const popularDiets = [
    { id: 'none', label: 'הכל הולך (ללא הגבלה)' },
    { id: 'vegetarian', label: 'צמחוני' },
    { id: 'vegan', label: 'טבעוני' },
    { id: 'pescatarian', label: 'פסקטריאני (דגים וצמחוני)' },
    { id: 'keto', label: 'קיטו (דל פחמימה)' },
];

const PreferencesStep: React.FC = () => {
    const { profile, updateProfile, nextStep, prevStep } = useUserStore();
    const [tempDisliked, setTempDisliked] = useState('');

    const currentPrefs = profile?.dietaryPreferences || [];
    const currentAllergies = profile?.allergies || [];
    const currentDisliked = profile?.dislikedFoods || [];

    const toggleAllergy = (allergy: string) => {
        if (currentAllergies.includes(allergy)) {
            updateProfile({ allergies: currentAllergies.filter(a => a !== allergy) });
        } else {
            updateProfile({ allergies: [...currentAllergies, allergy] });
        }
    };

    const handleDietChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        updateProfile({ dietaryPreferences: val === 'none' ? [] : [val] });
    };

    const addDislikedFood = (e: React.FormEvent) => {
        e.preventDefault();
        if (tempDisliked.trim() && !currentDisliked.includes(tempDisliked.trim())) {
            updateProfile({ dislikedFoods: [...currentDisliked, tempDisliked.trim()] });
            setTempDisliked('');
        }
    };

    const removeDisliked = (food: string) => {
        updateProfile({ dislikedFoods: currentDisliked.filter(f => f !== food) });
    };

    // Safe check for the selected diet to show in the dropdown
    const selectedDiet = currentPrefs.length > 0 ? currentPrefs[0] : 'none';

    return (
        <div className="onboarding-step">
            <h2 className="mb-6 text-center">בוא נתאים את האוכל אליך</h2>

            <div className="form-group mb-6">
                <label>סגנון תזונה</label>
                <select value={selectedDiet} onChange={handleDietChange} className="input-field">
                    {popularDiets.map(diet => (
                        <option key={diet.id} value={diet.id}>{diet.label}</option>
                    ))}
                </select>
            </div>

            <div className="form-group mb-6">
                <label className="mb-2 block">אלרגיות נפוצות</label>
                <div className="flex flex-wrap gap-2">
                    {commonAllergies.map(allergy => (
                        <button
                            key={allergy}
                            onClick={() => toggleAllergy(allergy)}
                            className={`chip ${currentAllergies.includes(allergy) ? 'chip-active' : 'chip-inactive'}`}
                            type="button"
                        >
                            {allergy}
                        </button>
                    ))}
                </div>
            </div>

            <div className="form-group mb-8">
                <label>מאכלים שאתה ממש לא אוהב (מעבר למה שסימנת למעלה)</label>
                <form onSubmit={addDislikedFood} className="flex gap-2">
                    <input
                        type="text"
                        value={tempDisliked}
                        onChange={(e) => setTempDisliked(e.target.value)}
                        placeholder="לדוגמה: כוסמת, תרד..."
                        className="input-field flex-1"
                    />
                    <button type="submit" className="btn-secondary whitespace-nowrap">הוסף</button>
                </form>

                {currentDisliked.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {currentDisliked.map(food => (
                            <span key={food} className="chip chip-active flex items-center gap-1">
                                {food}
                                <button type="button" onClick={() => removeDisliked(food)} className="text-white ml-2 text-xs opacity-75 hover:opacity-100">X</button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex gap-4 mt-auto">
                <button className="btn-secondary flex-1" onClick={prevStep}>חזור</button>
                <button className="btn-primary flex-1" onClick={nextStep}>המשך</button>
            </div>
        </div>
    );
};

export default PreferencesStep;
