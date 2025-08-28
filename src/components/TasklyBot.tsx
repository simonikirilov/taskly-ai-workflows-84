import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bot, Mic, MicOff, Video, Sparkles } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useScreenRecording } from '@/hooks/useScreenRecording';
import { RecordingIndicator } from '@/components/RecordingIndicator';
import { WorkflowAnalysis } from '@/components/WorkflowAnalysis';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  const [showWorkflowAnalysis, setShowWorkflowAnalysis] = useState(false);
  const [recordingBlob, setRecordingBlob] = useState<Blob | undefined>();
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
      setRecordingBlob(blob);
      setShowWorkflowAnalysis(true);
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
      
      <WorkflowAnalysis 
        isVisible={showWorkflowAnalysis}
        onClose={() => setShowWorkflowAnalysis(false)}
        recordingData={recordingBlob}
      />
      
      <div className="flex flex-col items-center relative -mt-8 md:-mt-12">
        {/* Littlebird.ai inspired layout - no greeting, focus on interaction */}

        {/* Taskly Robot - Mobile Optimized and Moved Up */}
        <div className="relative flex items-center justify-center">
          {/* Subtle background glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full max-w-[400px] aspect-square bg-gradient-radial from-blue-400/15 via-blue-400/8 to-transparent rounded-full blur-3xl opacity-50" />
          </div>
          
          {/* Robot container with enhanced prominence */}
          <div className={cn(
            "relative transition-all duration-500 cursor-pointer animate-float-slow w-full max-w-[420px] mx-auto",
            isListening 
              ? "scale-110" 
              : "hover:scale-[1.05]"
          )}
          onClick={handleBotClick}
          >
            <img 
              src="/lovable-uploads/d9e422aa-ea2c-4619-8ac2-3818edd8bcb3.png"
              alt="Taskly AI Assistant"
              className="w-full h-auto object-contain animate-float-slow p-0 m-0 max-w-full"
              style={{ filter: 'drop-shadow(0 0 25px rgba(59, 130, 246, 0.4))' }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            
            {/* Fallback Bot icon */}
            <div className="hidden w-full aspect-square bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center max-w-[350px]">
              <Bot className="h-28 w-28 text-white" />
            </div>
            
            {/* Listening indicator - enhanced visibility */}
            {isListening && (
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                <div className="flex gap-1 px-5 py-3 bg-primary/25 rounded-full backdrop-blur-sm border border-primary/20">
                  <div className="w-2 h-7 bg-primary animate-pulse rounded-full" />
                  <div className="w-2 h-7 bg-primary animate-pulse rounded-full" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-7 bg-primary animate-pulse rounded-full" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
          </div>
        </div>

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

      {/* Floating AI Assistant with Taskly Robot - Larger & Closer */}
      <button
        onClick={onShowSuggestions}
        className="fixed bottom-6 right-6 z-50 transition-all duration-300 hover:scale-105"
      >
        <div className="relative">
          <img 
            src="/lovable-uploads/d9e422aa-ea2c-4619-8ac2-3818edd8bcb3.png"
            alt="AI Assistant"
            className="w-28 h-28 object-contain filter drop-shadow-lg"
          />
          {suggestionCount > 0 && (
            <span className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-primary to-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
              {suggestionCount}
            </span>
          )}
        </div>
      </button>
      </div>
    </>
  );
}
