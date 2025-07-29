import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Mic, MicOff, Video, Sparkles } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TasklyBotProps {
  onVoiceCommand: (command: string) => void;
  onRecordFlow?: () => void;
  suggestionCount?: number;
  onShowSuggestions?: () => void;
}

export function TasklyBot({ onVoiceCommand, onRecordFlow, suggestionCount = 0, onShowSuggestions }: TasklyBotProps) {
  const [lastCommand, setLastCommand] = useState<string>('');

  const { isListening, startListening, stopListening } = useVoiceRecognition({
    onResult: (transcript) => {
      setLastCommand(transcript);
      onVoiceCommand(transcript);
      toast({
        title: "Voice command received",
        description: `"${transcript}"`,
      });
    },
    onError: (error) => {
      console.error('Voice recognition error:', error);
    }
  });

  const handleBotClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleRecordFlow = () => {
    onRecordFlow?.();
    toast({
      title: "Recording started",
      description: "Recording your workflow. Tap stop when finished.",
    });
  };

  return (
    <div className="flex flex-col items-center space-y-8 relative">
      {/* Hero Gradient Background */}
      <div className="absolute inset-0 -top-20 -bottom-20 bg-[var(--gradient-hero)] rounded-full opacity-40" />
      
      {/* Main Greeting */}
      <div className="text-center space-y-2 relative z-10">
        <h1 className="text-2xl font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Welcome to Taskly
        </h1>
        <p className="text-muted-foreground">Your AI-powered productivity companion</p>
      </div>

      {/* Hero Voice Circle */}
      <div className="relative flex items-center justify-center">
        {/* Breathing orb effect */}
        <div className={cn(
          "absolute inset-0 rounded-full transition-all duration-500",
          isListening 
            ? "bg-gradient-to-r from-destructive to-orange-500 animate-pulse glow scale-110" 
            : "bg-[var(--gradient-primary)] breathe"
        )} />
        
        <Button
          onClick={handleBotClick}
          size="lg"
          className={cn(
            "relative h-32 w-32 rounded-full border-2 border-white/20 backdrop-blur-sm transition-all duration-500 hover:scale-105",
            isListening 
              ? "bg-destructive/90 hover:bg-destructive text-white shadow-2xl" 
              : "bg-primary/90 hover:bg-primary text-primary-foreground shadow-xl glow"
          )}
        >
          {isListening ? (
            <div className="flex flex-col items-center gap-1">
              <div className="flex gap-1">
                <div className="w-1 h-6 bg-white animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1 h-8 bg-white animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1 h-6 bg-white animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs font-medium">Listening</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Mic className="h-8 w-8" />
              <span className="text-xs font-medium">Tap to Speak</span>
            </div>
          )}
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 relative z-10">
        <Button
          onClick={handleBotClick}
          variant="outline"
          className="glass hover:bg-primary/10 transition-all duration-300"
        >
          <Mic className="h-4 w-4 mr-2" />
          Voice Command
        </Button>
        
        <Button
          onClick={handleRecordFlow}
          variant="outline"
          className="glass hover:bg-accent/10 transition-all duration-300"
        >
          <Video className="h-4 w-4 mr-2" />
          Record My Flow
        </Button>
      </div>

      {/* Last Command Display */}
      {lastCommand && (
        <div className="relative z-10 max-w-sm text-center p-4 rounded-xl glass animate-[slide-up_0.5s_ease-out]">
          <p className="text-sm text-muted-foreground mb-1">Last command:</p>
          <p className="text-sm font-medium text-foreground">"{lastCommand}"</p>
        </div>
      )}

      {/* Floating Taskly Assistant */}
      <button
        onClick={onShowSuggestions}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[var(--gradient-primary)] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 float"
      >
        <div className="relative flex items-center justify-center h-full">
          <Sparkles className="h-6 w-6 text-white" />
          {suggestionCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-accent text-accent-foreground text-xs font-medium rounded-full flex items-center justify-center">
              {suggestionCount}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}