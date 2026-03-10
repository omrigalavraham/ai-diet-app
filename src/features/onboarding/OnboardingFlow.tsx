import React from 'react';
import { useUserStore } from '../../store/userStore';
import OnboardingIntro from './OnboardingIntro';
import PersonalDetailsStep from './PersonalDetailsStep';
import PreferencesStep from './PreferencesStep';
import FinalizeStep from './FinalizeStep';
import './Onboarding.css';

const OnboardingFlow: React.FC = () => {
    const step = useUserStore(state => state.onboardingStep);

    const renderStep = () => {
        switch (step) {
            case 1:
                return <OnboardingIntro />;
            case 2:
                return <PersonalDetailsStep />;
            case 3:
                return <PreferencesStep />;
            case 4:
                return <FinalizeStep />;
            default:
                return <OnboardingIntro />;
        }
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-wrapper fade-in">
                {step > 1 && step < 4 && (
                    <div className="progress-bar mb-6">
                        <div
                            className="progress-fill"
                            style={{ width: `${((step - 1) / 3) * 100}%` }}
                        ></div>
                    </div>
                )}
                {renderStep()}
            </div>
        </div>
    );
};

export default OnboardingFlow;
