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

        {/* Taskly Robot - Enhanced with glow and animation */}
        <div className="relative flex items-center justify-center">
          {/* Soft background glow using robot's eye color */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[750px] h-[750px] bg-gradient-radial from-blue-400/20 via-blue-400/10 to-transparent rounded-full blur-3xl opacity-60" />
          </div>
          
          {/* Robot container with enhanced design and animation */}
          <div className={cn(
            "relative transition-all duration-500 cursor-pointer animate-float",
            isListening 
              ? "scale-105" 
              : "hover:scale-[1.02]"
          )}
          onClick={handleBotClick}
          >
            <img 
              src="/lovable-uploads/38D37F6B-FF0F-4149-B8B2-C3681A0FF7B6.jpeg"
              alt="Taskly AI Assistant"
              className="w-[1200px] h-[1200px] object-contain animate-float-slow"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            
            {/* Fallback Bot icon in rounded container */}
            <div className="hidden w-[900px] h-[900px] bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
              <Bot className="h-48 w-48 text-white" />
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

      {/* Action Buttons - Littlebird.ai style */}
      <div className="flex gap-6 relative z-10 w-full max-w-md justify-center -mt-16">
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

      {/* Instructions and Voice History */}
      <div className="relative z-10 max-w-2xl text-center space-y-6">
        {/* Ready for First Task Section */}
        <div className="flex items-center justify-center gap-4 p-6 rounded-2xl bg-card/50 border border-border/50">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-medium text-foreground">Ready for Your First Task</h3>
            <p className="text-sm text-muted-foreground">Use voice commands or workflow recording to get started</p>
          </div>
        </div>

        {/* Voice History */}
        {voiceHistory.length > 0 && (
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
        )}
      </div>

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