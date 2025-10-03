import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Briefcase, Home, Users, Calendar, Plus } from 'lucide-react';

interface SimpleOnboardingFlowProps {
  onComplete: (userData: { name: string; useCases: string[] }) => void;
}

const USE_CASES = [
  { id: 'job-tasks', label: 'Job Tasks', icon: Briefcase },
  { id: 'projects', label: 'Projects', icon: Calendar },
  { id: 'client-work', label: 'Client Work', icon: Users },
  { id: 'daily-life', label: 'Daily Life', icon: Home },
  { id: 'custom', label: 'Custom', icon: Plus },
];

export function SimpleOnboardingFlow({ onComplete }: SimpleOnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<'name' | 'purpose'>('name');
  const [name, setName] = useState('');
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);

  const handleNameSubmit = () => {
    if (name.trim()) {
      setCurrentStep('purpose');
    }
  };

  const toggleUseCase = (useCaseId: string) => {
    setSelectedUseCases(prev =>
      prev.includes(useCaseId)
        ? prev.filter(id => id !== useCaseId)
        : [...prev, useCaseId]
    );
  };

  const handleComplete = () => {
    onComplete({
      name: name.trim(),
      useCases: selectedUseCases
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
      {currentStep === 'name' && (
        <Card className="w-full max-w-md glass space-y-8 p-8">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 flex items-center justify-center mb-6">
              <img 
                src="/lovable-uploads/d9e422aa-ea2c-4619-8ac2-3818edd8bcb3.png"
                alt="Taskly Robot"
                className="w-16 h-16 object-contain"
              />
            </div>
            <h1 className="text-3xl font-bold">What's your name?</h1>
            <p className="text-muted-foreground">Let's get started with Taskly</p>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-center text-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
              autoFocus
            />
            <Button 
              onClick={handleNameSubmit}
              disabled={!name.trim()}
              className="w-full h-12 text-lg"
              size="lg"
            >
              Continue
            </Button>
          </div>
        </Card>
      )}

      {currentStep === 'purpose' && (
        <Card className="w-full max-w-lg glass space-y-8 p-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">What will you use Taskly for?</h1>
            <p className="text-muted-foreground">Select all that apply</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {USE_CASES.map((useCase) => {
              const Icon = useCase.icon;
              const isSelected = selectedUseCases.includes(useCase.id);
              
              return (
                <button
                  key={useCase.id}
                  onClick={() => toggleUseCase(useCase.id)}
                  className={`p-4 rounded-lg border transition-all duration-200 text-left hover:border-primary/50 ${
                    isSelected 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="font-medium">{useCase.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <Button 
            onClick={handleComplete}
            disabled={selectedUseCases.length === 0}
            className="w-full h-12 text-lg"
            size="lg"
          >
            Get Started
          </Button>
        </Card>
      )}
    </div>
  );
}