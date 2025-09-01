import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Video, MessageCircle, Type } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useScreenRecording } from '@/hooks/useScreenRecording';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { RecordingIndicator } from '@/components/RecordingIndicator';
import { CopilotChat } from './CopilotChat';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
import { RobotFeedback } from '@/components/RobotFeedback';
import { TextCommandInput } from '@/components/TextCommandInput';

import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { AnimatedRobot } from './AnimatedRobot';

interface TasklyBotProps {
  onVoiceCommand: (command: string) => void;
  voiceHistory?: string[];
  mode: 'speaking' | 'typing';
}

export function TasklyBot({ onVoiceCommand, voiceHistory = [], mode }: TasklyBotProps) {
  const [lastCommand, setLastCommand] = useState<string>('');
  const [showCopilotChat, setShowCopilotChat] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<{ text: string; task: string } | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'thinking' | 'listening'; visible: boolean }>({
    message: '',
    type: 'listening',
    visible: false
  });


  const { speak } = useTextToSpeech();

  const { isListening, isSupported: voiceSupported, startListening, stopListening } = useVoiceRecognition({
    onResult: (transcript) => {
      setLastCommand(transcript);
      setFeedback({ message: 'Processing command...', type: 'thinking', visible: true });
      
      // Simple confidence check - if transcript is very short or unclear, ask for confirmation
      if (transcript.length < 5 || transcript.toLowerCase().includes('uh') || transcript.toLowerCase().includes('um')) {
        setPendingCommand({ text: transcript, task: `Create task: "${transcript}"` });
        setShowConfirmation(true);
        setFeedback({ message: 'Not sure about that...', type: 'error', visible: true });
        speak('I\'m not sure about that. Please confirm.');
      } else {
        onVoiceCommand(transcript);
        setFeedback({ message: 'Task created!', type: 'success', visible: true });
        speak('Task added to today\'s tasks');
      }
      
      toast({
        title: "Voice command received",
        description: `"${transcript}"`,
      });
    },
    onError: (error) => {
      console.error('Voice recognition error:', error);
      setFeedback({ message: "Sorry, I didn't catch that. Try again.", type: 'error', visible: true });
      speak('Sorry, I didn\'t catch that. Try again.');
    }
  });


  const handleBotClick = () => {
    if (mode === 'speaking') {
      // In speaking mode, directly start voice recognition
      handleSpeakCommand();
    } else {
      // In typing mode, open AI Copilot chat
      setShowCopilotChat(true);
      setFeedback({ message: 'AI Copilot Chat opened', type: 'thinking', visible: true });
    }
  };

  const handleSpeakCommand = () => {
    if (!voiceSupported) {
      setFeedback({ message: 'Voice not supported on this device', type: 'error', visible: true });
      speak('Voice not supported on this device');
      return;
    }
    
    startListening();
    setFeedback({ message: 'Listening...', type: 'listening', visible: true });
  };


  const handleTextCommand = (command: string) => {
    setFeedback({ message: 'Processing command...', type: 'thinking', visible: true });
    
    // Same logic as voice commands
    if (command.length < 5) {
      setPendingCommand({ text: command, task: `Create task: "${command}"` });
      setShowConfirmation(true);
      setFeedback({ message: 'Please confirm...', type: 'error', visible: true });
      speak('Please confirm this task.');
    } else {
      onVoiceCommand(command);
      setFeedback({ message: 'Task created!', type: 'success', visible: true });
      speak('Task added to today\'s tasks');
    }
    
    toast({
      title: "Command received",
      description: `"${command}"`,
    });
  };

  const handleConfirmTask = () => {
    if (pendingCommand) {
      onVoiceCommand(pendingCommand.text);
      setFeedback({ message: 'Task created!', type: 'success', visible: true });
      speak('Task added to today\'s tasks');
      setShowConfirmation(false);
      setPendingCommand(null);
    }
  };

  const handleCancelTask = () => {
    setShowConfirmation(false);
    setPendingCommand(null);
    setFeedback({ message: 'Cancelled', type: 'error', visible: true });
  };


  return (
    <>
      <div className="flex flex-col items-center relative -mt-8 md:-mt-12">
        {/* Animated Robot with Alive Features */}
        <div className="relative">
          <AnimatedRobot 
            isListening={isListening}
            isExpanded={false}
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

        {/* Mode Indicator */}
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            {mode === 'speaking' ? '🎤 Click robot to speak' : '💬 Click robot to type'}
          </p>
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

      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={handleCancelTask}
        onConfirm={handleConfirmTask}
        transcribedText={pendingCommand?.text || ''}
        suggestedTask={pendingCommand?.task || ''}
      />

      <TextCommandInput
        isOpen={showTextInput}
        onClose={() => setShowTextInput(false)}
        onSubmit={handleTextCommand}
        placeholder="Type your command, e.g., 'Create a task to call John tomorrow'"
      />
      </div>
    </>
  );
}
