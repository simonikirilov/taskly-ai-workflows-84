import { useState, useCallback } from 'react';
import { AnimatedRobot } from './AnimatedRobot';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { toast } from '@/hooks/use-toast';
import { Mic, MicOff } from 'lucide-react';
import { Button } from './ui/button';

interface RobotTapToSpeakProps {
  onTranscript: (transcript: string) => void;
  className?: string;
}

export function RobotTapToSpeak({ onTranscript, className }: RobotTapToSpeakProps) {
  const [transcript, setTranscript] = useState('');

  const handleResult = useCallback((result: string) => {
    console.log('Voice result:', result);
    setTranscript(result);
    onTranscript(result);
  }, [onTranscript]);

  const handleError = useCallback((error: string) => {
    console.error('Voice error:', error);
    toast({
      title: "Voice recognition error",
      description: error,
      variant: "destructive",
    });
  }, []);

  const { isListening, startListening, stopListening, audioLevel } = useVoiceRecognition({
    onResult: handleResult,
    onError: handleError,
    onVolumeChange: (volume) => {
      // Could use this for visual feedback
      console.log('Audio level:', volume);
    }
  });

  const handleRobotTap = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      setTranscript('');
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return (
    <div className={className}>
      <AnimatedRobot 
        isListening={isListening}
        onClick={handleRobotTap}
        className="cursor-pointer"
      >
        {isListening && (
          <div className="flex flex-col items-center gap-2 mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                stopListening();
              }}
              className="gap-2"
            >
              <MicOff className="h-4 w-4" />
              Stop
            </Button>
            {transcript && (
              <p className="text-xs text-muted-foreground max-w-xs text-center">
                {transcript}
              </p>
            )}
          </div>
        )}
      </AnimatedRobot>
      
      {!isListening && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          Tap to speak
        </p>
      )}
    </div>
  );
}
