import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Video, MessageCircle, Type } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { useScreenRecording } from '@/hooks/useScreenRecording';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { RecordingIndicator } from '@/components/RecordingIndicator';
import { CopilotChat } from './CopilotChat';
import { ConfirmationDialog } from '@/components/ConfirmationDialog';
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


  const { speak } = useTextToSpeech();

  const { isListening, isSupported: voiceSupported, startListening, stopListening } = useVoiceRecognition({
    onResult: (transcript) => {
      setLastCommand(transcript);
      
      // Simple confidence check - if transcript is very short or unclear, ask for confirmation
      if (transcript.length < 5 || transcript.toLowerCase().includes('uh') || transcript.toLowerCase().includes('um')) {
        setPendingCommand({ text: transcript, task: `Create task: "${transcript}"` });
        setShowConfirmation(true);
        speak('I\'m not sure about that. Please confirm.');
      } else {
        onVoiceCommand(transcript);
        speak('Task added to today\'s tasks');
      }
      
      toast({
        title: "Voice command received",
        description: `"${transcript}"`,
      });
    },
    onError: (error) => {
      console.error('Voice recognition error:', error);
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
    }
  };

  const handleSpeakCommand = async () => {
    if (!voiceSupported) {
      speak('Voice not supported on this device');
      // Fallback to text input
      setShowTextInput(true);
      return;
    }
    
    // Check permission status first
    try {
      const permissionStatus = await navigator.permissions?.query({ name: 'microphone' as PermissionName });
      console.log('🎤 Current permission status:', permissionStatus?.state);
      
      if (permissionStatus?.state === 'denied') {
        toast({
          title: "Microphone Access Blocked",
          description: "Microphone is blocked. Please click the 🔒 lock icon next to the URL, then click 'Site Settings' and allow microphone access.",
          variant: "destructive",
          duration: 8000,
        });
        speak('Microphone access is blocked. Please check your browser settings and try again, or use text input instead.');
        // Show text input as fallback
        setShowTextInput(true);
        return;
      }
      
      // Try to request permission
      console.log('🎤 Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Stop the stream immediately as we only wanted to check permission
      stream.getTracks().forEach(track => track.stop());
      
      // If we get here, permission was granted
      startListening();
      
    } catch (error) {
      console.error('🚫 Permission request failed:', error);
      
      if (error.name === 'NotAllowedError') {
        toast({
          title: "Microphone Permission Needed",
          description: "Click 'Allow' when your browser asks for microphone access, or use text input below.",
          variant: "destructive",
          duration: 6000,
        });
        speak('Please allow microphone access when prompted, or use the text input option');
        // Show text input as immediate fallback
        setShowTextInput(true);
      } else {
        toast({
          title: "Microphone Error", 
          description: "Unable to access microphone. Using text input instead.",
          variant: "destructive",
        });
        speak('Unable to access microphone. Please use text input.');
        setShowTextInput(true);
      }
    }
  };


  const handleTextCommand = (command: string) => {
    // Same logic as voice commands
    if (command.length < 5) {
      setPendingCommand({ text: command, task: `Create task: "${command}"` });
      setShowConfirmation(true);
      speak('Please confirm this task.');
    } else {
      onVoiceCommand(command);
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
      speak('Task added to today\'s tasks');
      setShowConfirmation(false);
      setPendingCommand(null);
    }
  };

  const handleCancelTask = () => {
    setShowConfirmation(false);
    setPendingCommand(null);
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
