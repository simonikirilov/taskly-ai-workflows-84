import { useState } from 'react';
import { LaunchAnimation } from './LaunchAnimation';
import { SetupFlow } from './SetupFlow';
import { TutorialFlow } from './TutorialFlow';

type OnboardingStep = 'launch' | 'setup' | 'tutorial' | 'complete';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('launch');

  const handleStepComplete = (nextStep: OnboardingStep) => {
    if (nextStep === 'complete') {
      onComplete();
    } else {
      setCurrentStep(nextStep);
    }
  };

  switch (currentStep) {
    case 'launch':
      return <LaunchAnimation onComplete={() => handleStepComplete('setup')} />;
    case 'setup':
      return <SetupFlow onComplete={() => handleStepComplete('tutorial')} />;
    case 'tutorial':
      return <TutorialFlow onComplete={() => handleStepComplete('complete')} />;
    default:
      return null;
  }
}