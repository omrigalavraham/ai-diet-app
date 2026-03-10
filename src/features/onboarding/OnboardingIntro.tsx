import React from 'react';
import { useUserStore } from '../../store/userStore';

const OnboardingIntro: React.FC = () => {
    const nextStep = useUserStore(state => state.nextStep);

    return (
        <div className="onboarding-step">
            <div className="step-content text-center">
                <h1 className="title-gradient mb-4">ברוך הבא ל-NutriGenius</h1>
                <p className="text-muted mb-8 text-lg">
                    האפליקציה החכמה שתבנה לך תפריט ותוכנית אימונים בהתאמה אישית, ותשתנה יחד איתך.
                </p>

                <div className="card-glass mb-8">
                    <h3 className="mb-2">איך זה עובד?</h3>
                    <ul className="text-right list-inside text-muted">
                        <li className="mb-2">1. ספר לנו קצת על עצמך (גיל, משקל, העדפות)</li>
                        <li className="mb-2">2. ה-AI יחשב בדיוק כמה קלוריות אתה צריך כדי לרדת במשקל</li>
                        <li className="mb-2">3. תקבל תפריט מותאם אישית שניתן לשנות בכל רגע בלחיצת כפתור!</li>
                    </ul>
                </div>

                <button className="btn-primary w-full text-lg py-4 mt-4" onClick={nextStep}>
                    בוא נתחיל!
                </button>
            </div>
        </div>
    );
};

export default OnboardingIntro;
