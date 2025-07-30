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
      
      <div className="flex flex-col items-center space-y-12 relative">
        {/* Littlebird.ai inspired layout - no greeting, focus on interaction */}

        {/* Taskly Robot - Littlebird.ai style with soft shadows */}
        <div className="relative flex items-center justify-center p-8">
          {/* Subtle glow effect - perfectly centered */}
          <div className={cn(
            "absolute w-80 h-80 transition-all duration-700 rounded-full",
            isListening 
              ? "bg-primary/15 blur-3xl scale-110" 
              : "bg-primary/8 blur-2xl"
          )} />
          
          {/* Robot container with elevated design */}
          <div className={cn(
            "relative p-6 rounded-3xl elevated-card transition-all duration-500 cursor-pointer",
            isListening 
              ? "scale-105" 
              : "hover:scale-[1.02]"
          )}
          onClick={handleBotClick}
          >
            <img 
              src="/lovable-uploads/0439ea59-9c9e-46ac-9527-cf18c3162602.png"
              alt="Taskly AI Assistant"
              className="w-64 h-64 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            
            {/* Fallback Bot icon in rounded container */}
            <div className="hidden w-64 h-64 bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
              <Bot className="h-16 w-16 text-white" />
            </div>
            
            {/* Listening indicator - minimalistic */}
            {isListening && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="flex gap-1 px-3 py-1 bg-primary/20 rounded-full backdrop-blur-sm">
                  <div className="w-1 h-3 bg-primary animate-pulse rounded-full" />
                  <div className="w-1 h-3 bg-primary animate-pulse rounded-full" style={{ animationDelay: '0.2s' }} />
                  <div className="w-1 h-3 bg-primary animate-pulse rounded-full" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Action Buttons - Littlebird.ai style */}
      <div className="flex gap-6 relative z-10 w-full max-w-md justify-center">
        <Button
          onClick={handleBotClick}
          size="lg"
          className={cn(
            "elevated-card h-16 px-8 text-lg font-medium transition-all duration-300 rounded-2xl border-0",
            isListening
              ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25"
              : "bg-gradient-to-r from-secondary to-muted text-foreground hover:from-secondary/90 hover:to-muted/90"
          )}
        >
          <Mic className="h-5 w-5 mr-3" />
          {isListening ? "Listening..." : "Speak"}
        </Button>
        
        <Button
          onClick={handleRecordFlow}
          size="lg"
          variant="outline"
          className={cn(
            "elevated-card h-16 px-8 text-lg font-medium transition-all duration-300 rounded-2xl border border-border",
            isRecording 
              ? "bg-gradient-to-r from-destructive/20 to-destructive/10 border-destructive/30 text-destructive-foreground" 
              : "bg-gradient-to-r from-card to-muted/50 hover:from-card/90 hover:to-muted/70"
          )}
        >
          <Video className={cn("h-5 w-5 mr-3", isRecording && "text-destructive")} />
          {isRecording ? "Stop" : "Record"}
        </Button>
      </div>

      {/* Last Command Display - Elegant card */}
      {lastCommand && (
        <div className="relative z-10 max-w-lg text-center">
          <div className="elevated-card p-6 rounded-2xl animate-[slide-up_0.5s_ease-out]">
            <p className="text-sm text-muted-foreground mb-2 font-light">Last command:</p>
            <p className="text-base font-medium text-foreground">"{lastCommand}"</p>
          </div>
        </div>
      )}

      {/* Floating Assistant - Littlebird.ai style */}
      <button
        onClick={onShowSuggestions}
        className="fixed bottom-8 right-8 z-50 h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 elevated-card border-0"
      >
        <div className="relative flex items-center justify-center h-full">
          <Sparkles className="h-6 w-6 text-white" />
          {suggestionCount > 0 && (
            <span className="absolute -top-2 -right-2 h-6 w-6 bg-accent text-accent-foreground text-xs font-semibold rounded-full flex items-center justify-center border-2 border-background">
              {suggestionCount}
            </span>
          )}
        </div>
      </button>
      </div>
    </>
  );
}