import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Video } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useScreenRecording } from '@/hooks/useScreenRecording';
import { RecordingIndicator } from '@/components/RecordingIndicator';

import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AnimatedRobot } from './AnimatedRobot';

interface TasklyBotProps {
  onVoiceCommand: (command: string) => void;
  onRecordFlow?: (recordingBlob?: Blob, duration?: string) => void;
  suggestionCount?: number;
  onShowSuggestions?: () => void;
  voiceHistory?: string[];
}

export function TasklyBot({ onVoiceCommand, onRecordFlow, suggestionCount = 0, onShowSuggestions, voiceHistory = [] }: TasklyBotProps) {
  const [lastCommand, setLastCommand] = useState<string>('');
  const [robotImageUrl, setRobotImageUrl] = useState<string>('/public/assets/robot.png'); // Will be updated when user uploads
  const [showSpeakButton, setShowSpeakButton] = useState(false);

  // Load speak button preference
  useEffect(() => {
    const preferences = localStorage.getItem('taskly-user-preferences');
    if (preferences) {
      const parsed = JSON.parse(preferences);
      setShowSpeakButton(parsed.showSpeakButton ?? false);
    }
  }, []);

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
      onRecordFlow?.(blob, "2:30"); // Mock duration
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
      
      
      <div className="flex flex-col items-center relative -mt-8 md:-mt-12">
        {/* Animated Robot with Alive Features */}
        <AnimatedRobot 
          isListening={isListening}
          onClick={handleBotClick}
          className="mb-6"
        />

      {/* Action Buttons Row - Closer to robot */}
      <div className="flex gap-3 w-full justify-center max-w-md mx-auto mt-6">
        <Button
          onClick={handleRecordFlow}
          size="default"
          variant="outline"
          className={cn(
            "h-12 px-6 text-sm font-medium transition-all duration-300 rounded-xl border border-border/30 backdrop-blur-sm",
            isRecording 
              ? "bg-gradient-to-r from-red-500/20 to-red-600/20 border-red-500/40 text-red-400 shadow-lg shadow-red-500/25" 
              : "bg-card/30 hover:bg-card/50 hover:border-border/50"
          )}
        >
          <Video className={cn("h-4 w-4 mr-2", isRecording && "text-red-400")} />
          {isRecording ? "Stop Recording" : "Record"}
        </Button>
        
        {showSpeakButton && (
          <Button
            onClick={handleBotClick}
            size="default"
            variant="outline"
            className={cn(
              "h-12 px-6 text-sm font-medium transition-all duration-300 rounded-xl border border-border/30 backdrop-blur-sm",
              isListening 
                ? "bg-gradient-to-r from-primary/20 to-blue-500/20 border-primary/40 text-primary shadow-lg shadow-primary/25" 
                : "bg-card/30 hover:bg-card/50 hover:border-border/50"
            )}
          >
            <Mic className={cn("h-4 w-4 mr-2", isListening && "text-primary animate-pulse")} />
            {isListening ? "Listening..." : "Speak"}
          </Button>
        )}
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

      {/* Floating AI Suggestions Robot - Bottom Right */}
      <button
        onClick={onShowSuggestions}
        className="fixed bottom-6 right-6 z-50 transition-all duration-300 hover:scale-105 animate-float-slow"
        title="Click for AI Suggestions"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center backdrop-blur-sm border border-primary/20 shadow-lg">
            <img 
              src="/lovable-uploads/d9e422aa-ea2c-4619-8ac2-3818edd8bcb3.png"
              alt="AI Suggestions"
              className="w-12 h-12 object-contain"
            />
          </div>
          {suggestionCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-r from-primary to-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
              {suggestionCount > 9 ? '9+' : suggestionCount}
            </span>
          )}
        </div>
      </button>
      </div>
    </>
  );
}
