import { useState } from 'react';
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

      {/* AI OS Action Buttons */}
      <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto mt-8">
        {/* Primary Speak Button - Glowing Circle with Robot */}
        <Button
          onClick={handleBotClick}
          size="default"
          className={cn(
            "w-20 h-20 rounded-full p-0 border-0 transition-all duration-500 relative overflow-hidden",
            isListening
              ? "bg-gradient-to-r from-primary via-blue-500 to-primary shadow-lg shadow-primary/50 scale-110"
              : "bg-gradient-to-r from-primary/80 to-primary hover:from-primary hover:to-primary/90 shadow-md hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
          )}
        >
          {isListening && (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-blue-400/30 rounded-full animate-pulse" />
          )}
          <Bot className={cn("h-8 w-8 text-white relative z-10", isListening && "animate-pulse")} />
        </Button>

        {/* Secondary Actions Row */}
        <div className="flex gap-3 w-full justify-center">
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
          
          <Button
            onClick={() => {/* Open workflows */}}
            size="default"
            variant="outline"
            className="h-12 px-6 text-sm font-medium transition-all duration-300 rounded-xl border border-border/30 bg-card/30 hover:bg-card/50 hover:border-border/50 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Automate
          </Button>
        </div>
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