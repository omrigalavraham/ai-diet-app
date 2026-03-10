import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';

const FinalizeStep: React.FC = () => {
    const { profile, finalizeProfile, prevStep } = useUserStore();
    const navigate = useNavigate();
    const [isCalculating, setIsCalculating] = useState(true);

    useEffect(() => {
        let mounted = true;
        // Simulate AI / Math calculating feeling for premium UX
        const timer = setTimeout(async () => {
            await finalizeProfile(); // Computes goals behind the scenes and saves to Supabase
            if (mounted) setIsCalculating(false);
        }, 1500);
        return () => {
            mounted = false;
            clearTimeout(timer);
        };
    }, [finalizeProfile]);

    const handleFinish = () => {
        // User is automatically forwarded by the ProtectedRoute in App.tsx now
        // if they have both a session and targetDailyCalories
        navigate('/');
    };

    if (isCalculating) {
        return (
            <div className="onboarding-step flex flex-col items-center justify-center min-h-[400px]">
                <div className="loader spin mb-6"></div>
                <h2 className="title-gradient text-center">מחשב את הנתונים שלך...</h2>
                <p className="text-muted mt-2 text-center">ה-AI מרכיב לך את המספרים המושלמים לירידה במשקל.</p>
            </div>
        );
    }

    return (
        <div className="onboarding-step fade-in">
            <h2 className="mb-2 text-center text-success">התוכנית מוכנה! ✨</h2>
            <p className="text-center text-muted mb-8">אלו המטרות שנקבעו לפי הנתונים שלך</p>

            <div className="card-glass text-center mb-8">
                <div className="text-sm text-muted mb-1">תקציב קלוריות יומי (מומלץ)</div>
                <div className="text-4xl font-bold title-gradient mb-6">
                    {profile?.targetDailyCalories} <span className="text-lg font-normal text-muted">קק"ל</span>
                </div>

                <div className="flex gap-4 justify-between border-t border-slate-700 pt-4">
                    <div className="flex-1">
                        <div className="text-xs text-muted">חלבון</div>
                        <div className="font-bold text-lg">{profile?.targetMacros?.protein}g</div>
                    </div>
                    <div className="flex-1 border-r border-slate-700">
                        <div className="text-xs text-muted">פחמימה</div>
                        <div className="font-bold text-lg">{profile?.targetMacros?.carbs}g</div>
                    </div>
                    <div className="flex-1 border-r border-slate-700">
                        <div className="text-xs text-muted">שומן</div>
                        <div className="font-bold text-lg">{profile?.targetMacros?.fat}g</div>
                    </div>
                </div>
            </div>

            <p className="text-center text-sm mb-8 px-4 text-slate-300">
                יעד המשקל שלך הוא <strong className="text-white">{profile?.goalWeight} ק"ג</strong>.
                אנחנו נעדכן את התפריט ככל שתשקול את עצמך ותתקדם!
            </p>

            <div className="flex gap-4">
                <button className="btn-secondary flex-1" onClick={prevStep}>רגע, טעיתי בנתון</button>
                <button className="btn-primary flex-1" onClick={handleFinish}>כניסה לדאשבורד</button>
            </div>
        </div>
    );
};

export default FinalizeStep;
