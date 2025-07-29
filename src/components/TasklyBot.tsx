import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Mic, MicOff, Video, Sparkles } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useScreenRecording } from '@/hooks/useScreenRecording';
import { RecordingIndicator } from '@/components/RecordingIndicator';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TasklyBotProps {
  onVoiceCommand: (command: string) => void;
  onRecordFlow?: (recordingBlob?: Blob) => void;
  suggestionCount?: number;
  onShowSuggestions?: () => void;
}

export function TasklyBot({ onVoiceCommand, onRecordFlow, suggestionCount = 0, onShowSuggestions }: TasklyBotProps) {
  const [lastCommand, setLastCommand] = useState<string>('');
  const [robotImageUrl, setRobotImageUrl] = useState<string>('/public/assets/robot.png'); // Will be updated when user uploads

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

  const { isRecording, formattedTime, startRecording, stopRecording } = useScreenRecording({
    onRecordingStart: () => {
      toast({
        title: "Recording started",
        description: "Capturing your workflow. Stop screen sharing to end recording.",
      });
    },
    onRecordingStop: (blob) => {
      onRecordFlow?.(blob);
      toast({
        title: "Recording saved",
        description: "Your workflow has been captured and saved locally.",
      });
    },
    onError: (error) => {
      toast({
        title: "Recording failed",
        description: error,
        variant: "destructive",
      });
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
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <>
      <RecordingIndicator 
        isRecording={isRecording} 
        recordingTime={formattedTime}
        onStop={stopRecording}
      />
      
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

        {/* Robot Assistant */}
        <div className="relative flex items-center justify-center">
          {/* Glow effect for robot */}
          <div className={cn(
            "absolute inset-0 w-40 h-40 rounded-full transition-all duration-500",
            isListening 
              ? "bg-gradient-to-r from-destructive to-orange-500 animate-pulse glow scale-110" 
              : "bg-[var(--gradient-primary)] opacity-20 animate-pulse"
          )} />
          
          {/* Robot Image */}
          <div className={cn(
            "relative w-32 h-32 rounded-full overflow-hidden border-4 transition-all duration-500 cursor-pointer",
            isListening 
              ? "border-destructive shadow-2xl scale-110" 
              : "border-primary/20 shadow-xl hover:scale-105 float"
          )}
          onClick={handleBotClick}
          >
            {/* Fallback to Bot icon if image doesn't load */}
            <div className="w-full h-full bg-[var(--gradient-primary)] flex items-center justify-center">
              <Bot className="h-16 w-16 text-white" />
            </div>
            
            {/* Wave animation when listening */}
            {isListening && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex gap-1">
                  <div className="w-1 h-8 bg-white/80 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-12 bg-white/80 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-8 bg-white/80 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>
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
          className={cn(
            "glass transition-all duration-300",
            isRecording 
              ? "bg-destructive/10 border-destructive/50 hover:bg-destructive/20" 
              : "hover:bg-accent/10"
          )}
        >
          <Video className={cn("h-4 w-4 mr-2", isRecording && "text-destructive")} />
          {isRecording ? "Stop Recording" : "📹 Record My Flow"}
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
    </>
  );
}