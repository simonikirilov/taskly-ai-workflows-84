import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Mic, MicOff } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TasklyBotProps {
  onVoiceCommand: (command: string) => void;
}

export function TasklyBot({ onVoiceCommand }: TasklyBotProps) {
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

  return (
    <div className="flex flex-col items-center space-y-6">
      <Button
        onClick={handleBotClick}
        size="lg"
        className={cn(
          "h-32 w-32 rounded-full transition-all duration-300 hover:scale-105",
          isListening 
            ? "bg-red-500 hover:bg-red-600 animate-pulse" 
            : "bg-primary hover:bg-primary/90"
        )}
      >
        {isListening ? (
          <MicOff className="h-12 w-12" />
        ) : (
          <Bot className="h-12 w-12" />
        )}
      </Button>
      
      <div className="text-center space-y-2">
        <p className="text-lg font-medium">
          {isListening ? "Listening..." : "Tap to Speak to Taskly"}
        </p>
        {lastCommand && (
          <p className="text-sm text-muted-foreground max-w-xs">
            Last command: "{lastCommand}"
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Mic className="h-4 w-4" />
        <span>Voice commands enabled</span>
      </div>
    </div>
  );
}