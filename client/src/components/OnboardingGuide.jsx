import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Onboarding.css';

const OnboardingGuide = ({ onComplete }) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const steps = [
        {
            title: 'Welcome to HealthSync! 👋',
            description: 'Your trusted platform for secure video consultations with top doctors.',
            icon: '🏥',
            highlight: null
        },
        {
            title: 'Find the Right Doctor',
            description: 'Use our AI-powered matching to find specialists based on your symptoms.',
            icon: '🔍',
            highlight: 'doctors'
        },
        {
            title: 'Book an Appointment',
            description: 'Choose a convenient time slot and complete secure payment.',
            icon: '📅',
            highlight: 'booking'
        },
        {
            title: 'Join Your Consultation',
            description: 'Enter the waiting room and connect with your doctor via HD video.',
            icon: '🎥',
            highlight: 'video'
        },
        {
            title: 'Get Your Prescription',
            description: 'Receive digital prescriptions and visit summaries instantly.',
            icon: '💊',
            highlight: 'prescription'
        },
        {
            title: 'You\'re All Set!',
            description: 'Start your health journey with HealthSync today.',
            icon: '🎉',
            highlight: null
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        localStorage.setItem('onboardingComplete', 'true');
        setIsVisible(false);
        if (onComplete) onComplete();
    };

    const handleSkip = () => {
        handleComplete();
    };

    if (!isVisible) return null;

    const step = steps[currentStep];

    return (
        <div className="onboarding-overlay">
            <div className="onboarding-modal">
                {/* Skip Button */}
                <button className="skip-btn" onClick={handleSkip}>
                    Skip Tour
                </button>

                {/* Progress Dots */}
                <div className="progress-dots">
                    {steps.map((_, index) => (
                        <span
                            key={index}
                            className={`dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
                            onClick={() => setCurrentStep(index)}
                        />
                    ))}
                </div>

                {/* Step Content */}
                <div className="step-content">
                    <div className="step-icon">{step.icon}</div>
                    <h2>{step.title}</h2>
                    <p>{step.description}</p>
                </div>

                {/* Navigation */}
                <div className="step-navigation">
                    {currentStep > 0 && (
                        <button className="btn btn-secondary" onClick={handlePrevious}>
                            ← Previous
                        </button>
                    )}
                    <button className="btn btn-primary" onClick={handleNext}>
                        {currentStep === steps.length - 1 ? 'Get Started' : 'Next →'}
                    </button>
                </div>

                {/* Help Link */}
                <div className="help-link">
                    <a href="#" onClick={(e) => { e.preventDefault(); alert('Help center coming soon!'); }}>
                        Need help? Visit our Help Center
                    </a>
                </div>
            </div>
        </div>
    );
};

// Hook to check if user needs onboarding
export const useOnboarding = () => {
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        const completed = localStorage.getItem('onboardingComplete');
        if (!completed) {
            // Delay to let page load first
            setTimeout(() => setShowOnboarding(true), 500);
        }
    }, []);

    return { showOnboarding, setShowOnboarding };
};

export default OnboardingGuide;
