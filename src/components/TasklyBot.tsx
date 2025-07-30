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
  voiceHistory?: string[];
}

export function TasklyBot({ onVoiceCommand, onRecordFlow, suggestionCount = 0, onShowSuggestions, voiceHistory = [] }: TasklyBotProps) {
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
      
      <div className="flex flex-col items-center relative">
        {/* Littlebird.ai inspired layout - no greeting, focus on interaction */}

        {/* Taskly Robot - Mobile Optimized */}
        <div className="relative flex items-center justify-center">
          {/* Subtle background glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-[350px] aspect-square bg-gradient-radial from-blue-400/10 via-blue-400/5 to-transparent rounded-full blur-2xl opacity-40" />
          </div>
          
          {/* Robot container with mobile-optimized design */}
          <div className={cn(
            "relative transition-all duration-500 cursor-pointer animate-float-slow w-full max-w-[380px] mx-auto",
            isListening 
              ? "scale-105" 
              : "hover:scale-[1.02]"
          )}
          onClick={handleBotClick}
          >
            <img 
              src="/lovable-uploads/d9e422aa-ea2c-4619-8ac2-3818edd8bcb3.png"
              alt="Taskly AI Assistant"
              className="w-full h-auto object-contain animate-float-slow p-0 m-0 max-w-full"
              style={{ filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.3))' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            
            {/* Fallback Bot icon */}
            <div className="hidden w-full aspect-square bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center max-w-[300px]">
              <Bot className="h-24 w-24 text-white" />
            </div>
            
            {/* Listening indicator - minimalistic */}
            {isListening && (
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex gap-1 px-4 py-2 bg-primary/20 rounded-full backdrop-blur-sm">
                  <div className="w-2 h-6 bg-primary animate-pulse rounded-full" />
                  <div className="w-2 h-6 bg-primary animate-pulse rounded-full" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-6 bg-primary animate-pulse rounded-full" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
          </div>
        </div>

      {/* Action Buttons - Mobile Optimized */}
      <div className="flex gap-3 relative z-10 w-full max-w-sm justify-center -mt-2">
        <Button
          onClick={handleBotClick}
          size="default"
          className={cn(
            "h-12 px-6 text-sm font-medium transition-all duration-300 rounded-xl border-0 flex-1",
            isListening
              ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25"
              : "bg-gradient-to-r from-secondary to-muted text-foreground hover:from-secondary/90 hover:to-muted/90"
          )}
        >
          <Mic className="h-4 w-4 mr-2" />
          {isListening ? "Listening..." : "Speak"}
        </Button>
        
        <Button
          onClick={handleRecordFlow}
          size="default"
          variant="outline"
          className={cn(
            "h-12 px-6 text-sm font-medium transition-all duration-300 rounded-xl border border-border flex-1",
            isRecording 
              ? "bg-gradient-to-r from-destructive/20 to-destructive/10 border-destructive/30 text-destructive-foreground" 
              : "bg-gradient-to-r from-card to-muted/50 hover:from-card/90 hover:to-muted/70"
          )}
        >
          <Video className={cn("h-4 w-4 mr-2", isRecording && "text-destructive")} />
          {isRecording ? "Stop" : "Record"}
        </Button>
      </div>

      {/* Voice History - Only show if there's history */}
      {voiceHistory.length > 0 && (
        <div className="relative z-10 max-w-2xl text-center mt-4">
          <div className="bg-muted/80 rounded-2xl p-6 backdrop-blur-sm">
            <h4 className="text-sm font-medium text-muted-foreground mb-4">Voice Command History</h4>
            <div className="space-y-3 max-h-32 overflow-y-auto">
              {voiceHistory.slice(-5).map((command, index) => (
                <div key={index} className="text-left p-3 bg-background/60 rounded-lg border border-border/50">
                  <p className="text-sm text-foreground">"{command}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Assistant with Taskly Robot */}
      <button
        onClick={onShowSuggestions}
        className="fixed bottom-8 right-8 z-50 h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm border border-primary/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
      >
        <div className="relative flex items-center justify-center h-full">
          <img 
            src="/lovable-uploads/d9e422aa-ea2c-4619-8ac2-3818edd8bcb3.png"
            alt="AI Assistant"
            className="w-12 h-12 object-contain"
          />
          {suggestionCount > 0 && (
            <span className="absolute -top-1 -right-1 h-6 w-6 bg-accent text-accent-foreground text-xs font-semibold rounded-full flex items-center justify-center border-2 border-background">
              {suggestionCount}
            </span>
          )}
        </div>
      </button>
      </div>
    </>
  );
}