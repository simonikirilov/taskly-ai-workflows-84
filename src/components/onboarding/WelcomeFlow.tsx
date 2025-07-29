import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeFlowProps {
  onComplete: (userData: { name: string; purpose: string[]; details?: string }) => void;
}

export function WelcomeFlow({ onComplete }: WelcomeFlowProps) {
  const [currentStep, setCurrentStep] = useState<'loading' | 'name' | 'purpose' | 'complete'>('loading');
  const [name, setName] = useState('');
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  const [details, setDetails] = useState('');

  // Show loading screen for 2 seconds
  useState(() => {
    const timer = setTimeout(() => {
      setCurrentStep('name');
    }, 2000);
    return () => clearTimeout(timer);
  });

  const purposes = [
    { id: 'job', label: 'Job Tasks', icon: '💼' },
    { id: 'projects', label: 'Projects', icon: '📋' },
    { id: 'clients', label: 'Client Work', icon: '🤝' },
    { id: 'daily', label: 'Daily Life', icon: '🏠' },
    { id: 'custom', label: 'Custom', icon: '⚙️' }
  ];

  const handlePurposeToggle = (purposeId: string) => {
    setSelectedPurposes(prev => 
      prev.includes(purposeId) 
        ? prev.filter(id => id !== purposeId)
        : [...prev, purposeId]
    );
  };

  const handleComplete = () => {
    onComplete({
      name,
      purpose: selectedPurposes,
      details
    });
  };

  if (currentStep === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <img 
            src="/lovable-uploads/0439ea59-9c9e-46ac-9527-cf18c3162602.png"
            alt="Taskly AI"
            className="w-32 h-32 mx-auto object-contain"
          />
          <div className="flex items-center gap-3 text-xl font-medium text-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            Loading Taskly...
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'name') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md p-8 space-y-6 glass">
          <div className="text-center space-y-4">
            <img 
              src="/lovable-uploads/0439ea59-9c9e-46ac-9527-cf18c3162602.png"
              alt="Taskly AI"
              className="w-24 h-24 mx-auto object-contain"
            />
            <h1 className="text-2xl font-semibold text-foreground">
              What's your name?
            </h1>
          </div>

          <div className="space-y-4">
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 text-lg"
              autoFocus
            />
            
            <Button 
              onClick={() => setCurrentStep('purpose')}
              disabled={!name.trim()}
              className="w-full h-12 text-lg"
            >
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (currentStep === 'purpose') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <Card className="w-full max-w-md p-8 space-y-6 glass">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold text-foreground">
              What will you use Taskly for?
            </h1>
            <p className="text-muted-foreground">
              Select all that apply
            </p>
          </div>

          <div className="space-y-3">
            {purposes.map((purpose) => (
              <button
                key={purpose.id}
                onClick={() => handlePurposeToggle(purpose.id)}
                className={cn(
                  "w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3",
                  selectedPurposes.includes(purpose.id)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50 text-foreground"
                )}
              >
                <span className="text-2xl">{purpose.icon}</span>
                <span className="font-medium">{purpose.label}</span>
                {selectedPurposes.includes(purpose.id) && (
                  <CheckCircle className="ml-auto h-5 w-5" />
                )}
              </button>
            ))}
          </div>

          {selectedPurposes.includes('custom') && (
            <Input
              placeholder="Tell us more..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="h-12"
            />
          )}

          <Button 
            onClick={handleComplete}
            disabled={selectedPurposes.length === 0}
            className="w-full h-12 text-lg"
          >
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Card>
      </div>
    );
  }

  return null;
}