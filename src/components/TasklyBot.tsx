import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Video, MessageCircle, Type } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useScreenRecording } from '@/hooks/useScreenRecording';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { RecordingIndicator } from '@/components/RecordingIndicator';
import { CopilotChat } from './CopilotChat';
import { RobotFeedback } from '@/components/RobotFeedback';

import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AnimatedRobot } from './AnimatedRobot';

interface TasklyBotProps {
  onVoiceCommand: (command: string) => void;
  onRecordFlow?: (recordingBlob?: Blob, duration?: string) => void;
  voiceHistory?: string[];
}

export function TasklyBot({ onVoiceCommand, onRecordFlow, voiceHistory = [] }: TasklyBotProps) {
  const [lastCommand, setLastCommand] = useState<string>('');
  const [robotImageUrl, setRobotImageUrl] = useState<string>('/public/assets/robot.png'); // Will be updated when user uploads
  const [showSpeakButton, setShowSpeakButton] = useState(false);
  const [showCopilotChat, setShowCopilotChat] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'thinking' | 'listening'; visible: boolean }>({
    message: '',
    type: 'listening',
    visible: false
  });

  // Load speak button preference
  useEffect(() => {
    const preferences = localStorage.getItem('taskly-user-preferences');
    if (preferences) {
      const parsed = JSON.parse(preferences);
      setShowSpeakButton(parsed.showSpeakButton ?? false);
    }
  }, []);

  const { speak } = useTextToSpeech();

  const { isListening, isSupported: voiceSupported, startListening, stopListening } = useVoiceRecognition({
    onResult: (transcript) => {
      setLastCommand(transcript);
      setFeedback({ message: 'Processing command...', type: 'thinking', visible: true });
      
      // Create task directly from voice command
      onVoiceCommand(transcript);
      
      // Give natural TTS confirmation with task details
      const taskTitle = transcript.length > 30 ? transcript.substring(0, 30) + "..." : transcript;
      speak(`Task added: ${taskTitle}`);
      setFeedback({ message: '✅ Task added', type: 'success', visible: true });
      
      toast({
        title: "Voice command received",
        description: `"${transcript}"`,
      });
    },
    onError: (error) => {
      console.error('Voice recognition error:', error);
      setFeedback({ message: "Sorry, didn't catch that", type: 'error', visible: true });
      speak("Sorry, I didn't catch that. Try again.");
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
    if (!voiceSupported) {
      setFeedback({ message: 'Voice not supported', type: 'error', visible: true });
      speak("Voice recognition not supported in this browser.");
      return;
    }

    if (isListening) {
      stopListening();
      setFeedback({ message: '', type: 'listening', visible: false });
    } else {
      startListening();
      setFeedback({ message: 'Listening...', type: 'listening', visible: true });
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
        <div className="relative">
          <AnimatedRobot 
            isListening={isListening}
            onClick={handleBotClick}
            className="mb-6"
          />
          <RobotFeedback
            message={feedback.message}
            type={feedback.type}
            isVisible={feedback.visible}
            onHide={() => setFeedback(prev => ({ ...prev, visible: false }))}
          />
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

        <Button
          onClick={() => setShowCopilotChat(true)}
          size="default"
          variant="default"
          className="h-12 px-6 text-sm font-medium transition-all duration-300 rounded-xl bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-lg"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          AI Copilot
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
            {voiceSupported ? (
              <>
                <Mic className={cn("h-4 w-4 mr-2", isListening && "text-primary animate-pulse")} />
                {isListening ? "Listening..." : "Speak"}
              </>
            ) : (
              <>
                <Type className="h-4 w-4 mr-2" />
                Voice Not Supported
              </>
            )}
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

      <CopilotChat 
        isOpen={showCopilotChat}
        onClose={() => setShowCopilotChat(false)}
      />
      </div>
    </>
  );
}
