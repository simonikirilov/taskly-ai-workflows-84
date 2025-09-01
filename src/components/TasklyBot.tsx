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
  onRecordFlow?: (recordingBlob?: Blob, duration?: string) => void;
  voiceHistory?: string[];
}

export function TasklyBot({ onVoiceCommand, onRecordFlow, voiceHistory = [] }: TasklyBotProps) {
  const [lastCommand, setLastCommand] = useState<string>('');
  const [robotImageUrl, setRobotImageUrl] = useState<string>('/public/assets/robot.png'); // Will be updated when user uploads
  const [showSpeakButton, setShowSpeakButton] = useState(false);
  const [showCopilotChat, setShowCopilotChat] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [pendingCommand, setPendingCommand] = useState<{ text: string; task: string } | null>(null);
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

  // Helper function to parse multiple tasks from a single command
  const parseMultipleTasks = (command: string): string[] => {
    // Split by common delimiters for multiple tasks
    const delimiters = [' and ', ' then ', ' also ', ' plus ', ', '];
    let tasks = [command];
    
    for (const delimiter of delimiters) {
      const newTasks: string[] = [];
      for (const task of tasks) {
        if (task.toLowerCase().includes(delimiter)) {
          newTasks.push(...task.split(new RegExp(delimiter, 'i')));
        } else {
          newTasks.push(task);
        }
      }
      tasks = newTasks;
    }
    
    // Clean up and filter out empty or very short tasks
    return tasks
      .map(task => task.trim())
      .filter(task => task.length > 2)
      .map(task => {
        // Add task prefix if not already present
        if (!task.toLowerCase().startsWith('remind') && 
            !task.toLowerCase().startsWith('create') && 
            !task.toLowerCase().startsWith('schedule') &&
            !task.toLowerCase().startsWith('add')) {
          return task;
        }
        return task;
      });
  };

  const { isListening, isSupported: voiceSupported, startListening, stopListening } = useVoiceRecognition({
    onResult: (transcript) => {
      setLastCommand(transcript);
      setFeedback({ message: 'Processing command...', type: 'thinking', visible: true });
      
      // Parse for multiple tasks
      const tasks = parseMultipleTasks(transcript);
      
      if (tasks.length > 1) {
        // Multiple tasks detected
        setFeedback({ message: `Creating ${tasks.length} tasks...`, type: 'thinking', visible: true });
        
        // Process each task
        tasks.forEach((task, index) => {
          setTimeout(() => {
            onVoiceCommand(task);
            if (index === tasks.length - 1) {
              // Last task
              setFeedback({ message: `✅ Added ${tasks.length} tasks!`, type: 'success', visible: true });
              speak(`Created ${tasks.length} tasks successfully`);
            }
          }, index * 200); // Small delay between tasks
        });
        
        toast({
          title: `${tasks.length} tasks created`,
          description: tasks.map(t => `• ${t}`).join('\n'),
        });
      } else {
        // Single task
        onVoiceCommand(transcript);
        setFeedback({ message: '✅ Added to Today\'s Tasks!', type: 'success', visible: true });
        speak('Task created successfully');
        
        toast({
          title: "Task created",
          description: `"${transcript}"`,
        });
      }
    },
    onError: (error) => {
      console.error('Voice recognition error:', error);
      setFeedback({ message: "Voice recognition failed", type: 'error', visible: true });
      
      toast({
        title: "Voice recognition error",
        description: error.includes('denied') ? "Microphone access denied" : "Please try again",
        variant: "destructive",
      });
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
      toast({
        title: "Voice recognition not available",
        description: "Please try using a supported browser (Chrome, Safari, Edge)",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      stopListening();
      setFeedback({ message: '', type: 'listening', visible: false });
    } else {
      startListening();
      setFeedback({ message: 'Listening... Tap again to stop', type: 'listening', visible: true });
    }
  };

  const handleTextCommand = (command: string) => {
    setFeedback({ message: 'Processing command...', type: 'thinking', visible: true });
    
    // Same logic as voice commands
    if (command.length < 5) {
      setPendingCommand({ text: command, task: `Create task: "${command}"` });
      setShowConfirmation(true);
      setFeedback({ message: 'Please confirm...', type: 'error', visible: true });
    } else {
      onVoiceCommand(command);
      setFeedback({ message: 'Task created!', type: 'success', visible: true });
      speak('Task created successfully');
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
      speak('Task created successfully');
      setShowConfirmation(false);
      setPendingCommand(null);
    }
  };

  const handleCancelTask = () => {
    setShowConfirmation(false);
    setPendingCommand(null);
    setFeedback({ message: 'Cancelled', type: 'error', visible: true });
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
            onClick={() => setShowTextInput(true)}
            size="default"
            variant="outline"
            className="h-12 px-6 text-sm font-medium transition-all duration-300 rounded-xl border border-border/30 backdrop-blur-sm bg-card/30 hover:bg-card/50 hover:border-border/50"
          >
            <Type className="h-4 w-4 mr-2" />
            Type Command
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
