import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Video, Brain, Zap } from 'lucide-react';

interface TutorialFlowProps {
  onComplete: () => void;
}

const tutorialSteps = [
  {
    icon: Video,
    title: "Record Your Flow",
    description: "Capture any workflow on your screen - from simple tasks to complex processes. Taskly watches and learns.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Brain,
    title: "Let Taskly Analyze",
    description: "Our AI breaks down your recording into smart, actionable steps that can be automated or improved.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Zap,
    title: "Trigger Your Agent",
    description: "Voice-activate your new automated workflows anytime. Just say 'Taskly, run my morning routine' and watch the magic.",
    color: "from-orange-500 to-red-500"
  }
];

export function TutorialFlow({ onComplete }: TutorialFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentTutorial = tutorialSteps[currentStep];
  const Icon = currentTutorial.icon;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-lg glass space-y-8 p-8 text-center">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-center space-x-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {tutorialSteps.length}
          </p>
        </div>

        {/* Icon */}
        <div className="relative">
          <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-r ${currentTutorial.color} p-1`}>
            <div className="w-full h-full bg-background rounded-full flex items-center justify-center">
              <Icon className="h-8 w-8 text-foreground" />
            </div>
          </div>
          <div className={`absolute inset-0 mx-auto w-20 h-20 rounded-full bg-gradient-to-r ${currentTutorial.color} opacity-20 animate-pulse`} />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">{currentTutorial.title}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {currentTutorial.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          <Button
            variant="ghost"
            onClick={onComplete}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip
          </Button>

          <Button
            onClick={handleNext}
            className="flex items-center gap-2"
          >
            {isLastStep ? "Let's Go!" : 'Next'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}