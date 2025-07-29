import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Briefcase, Palette, GraduationCap, Calendar, Smartphone, Monitor, Tablet } from 'lucide-react';

interface SetupFlowProps {
  onComplete: () => void;
}

const setupQuestions = [
  {
    title: "What do you want Taskly to help with?",
    subtitle: "Choose your primary focus area",
    options: [
      { id: 'work', label: 'Work & Productivity', icon: Briefcase },
      { id: 'creative', label: 'Creative Projects', icon: Palette },
      { id: 'learning', label: 'Learning & Development', icon: GraduationCap },
      { id: 'daily', label: 'Daily Routines', icon: Calendar },
    ]
  },
  {
    title: "How familiar are you with automation?",
    subtitle: "This helps us personalize your experience",
    options: [
      { id: 'beginner', label: 'Beginner', description: 'New to automation tools' },
      { id: 'intermediate', label: 'Intermediate', description: 'Some experience with workflows' },
      { id: 'expert', label: 'Expert', description: 'Advanced automation user' },
    ]
  },
  {
    title: "What's your main device?",
    subtitle: "We'll optimize recording for your setup",
    options: [
      { id: 'mobile', label: 'Mobile Phone', icon: Smartphone },
      { id: 'desktop', label: 'Desktop/Laptop', icon: Monitor },
      { id: 'tablet', label: 'Tablet', icon: Tablet },
    ]
  }
];

export function SetupFlow({ onComplete }: SetupFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleNext = () => {
    if (currentStep < setupQuestions.length - 1) {
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

  const handleSelectOption = (optionId: string) => {
    setAnswers({ ...answers, [currentStep]: optionId });
  };

  const currentQuestion = setupQuestions[currentStep];
  const isLastStep = currentStep === setupQuestions.length - 1;
  const canProceed = answers[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-lg glass space-y-8 p-8">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep + 1} of {setupQuestions.length}</span>
            <span>{Math.round(((currentStep + 1) / setupQuestions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-[var(--gradient-primary)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / setupQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-semibold">{currentQuestion.title}</h2>
          <p className="text-muted-foreground">{currentQuestion.subtitle}</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleSelectOption(option.id)}
                className={`w-full p-4 rounded-lg border transition-all duration-200 text-left hover:border-primary/50 ${
                  answers[currentStep] === option.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {Icon && <Icon className="h-5 w-5 text-primary" />}
                  <div>
                    <div className="font-medium">{option.label}</div>
                    {option.description && (
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
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
            disabled={!canProceed}
            className="flex items-center gap-2"
          >
            {isLastStep ? 'Finish' : 'Continue'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}