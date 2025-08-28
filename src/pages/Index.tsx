import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MonitorPlay } from "lucide-react";
import { RobotAvatar } from "@/components/RobotAvatar";
import { BottomNavigation } from "@/components/BottomNavigation";
import { AppMenu } from "@/components/AppMenu";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { useScreenRecording } from "@/hooks/useScreenRecording";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [lastTranscript, setLastTranscript] = useState('');
  
  const userName = localStorage.getItem('taskly_user_name') || 'User';

  const voiceRecognition = useVoiceRecognition({
    onResult: (transcript: string) => {
      setLastTranscript(transcript);
      setIsListening(false);
      toast({
        title: "Voice command processed",
        description: `Heard: "${transcript}"`,
      });
    },
    onError: (error: string) => {
      setIsListening(false);
      console.error('Voice recognition error:', error);
    }
  });

  const screenRecording = useScreenRecording({
    onRecordingStart: () => {
      setIsRecording(true);
      toast({
        title: "Recording workflow...",
        description: "Perform your tasks, I'm learning!",
      });
    },
    onRecordingStop: (blob: Blob) => {
      setIsRecording(false);
      toast({
        title: "Workflow recorded",
        description: "Analyzing your process...",
      });
    },
    onError: (error: string) => {
      setIsRecording(false);
      console.error('Screen recording error:', error);
    }
  });

  const handleVoiceStart = () => {
    setIsListening(true);
    voiceRecognition.startListening();
    toast({
      title: "Listening...",
      description: "I'm ready to hear your tasks and ideas",
    });
  };

  const handleVoiceStop = () => {
    setIsListening(false);
    voiceRecognition.stopListening();
  };

  const handleRecordStart = () => {
    screenRecording.startRecording();
  };

  const handleRecordStop = () => {
    screenRecording.stopRecording();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/d9e422aa-ea2c-4619-8ac2-3818edd8bcb3.png"
              alt="Taskly"
              className="w-8 h-8"
            />
          </div>
          
          <div className="text-center flex-1">
            <h1 className="text-lg font-semibold">Welcome, {userName}</h1>
          </div>
          
          <AppMenu />
        </div>
        
        {/* Tagline */}
        <div className="text-center pb-4">
          <p className="text-sm text-muted-foreground">Report • Label • Automate</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 space-y-8">
        {/* Robot Avatar */}
        <RobotAvatar 
          className="mb-6" 
          isListening={voiceRecognition.isListening}
          isRecording={screenRecording.isRecording}
        />

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            size="lg"
            className="rounded-full px-8 py-6 text-lg"
            onClick={voiceRecognition.isListening ? handleVoiceStop : handleVoiceStart}
            variant={voiceRecognition.isListening ? "destructive" : "default"}
            disabled={!voiceRecognition.isSupported}
          >
            <Mic className="w-6 h-6 mr-2" />
            {voiceRecognition.isListening ? "Stop" : "Speak"}
          </Button>
          
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-8 py-6 text-lg"
            onClick={screenRecording.isRecording ? handleRecordStop : handleRecordStart}
            disabled={!screenRecording.isSupported}
          >
            <MonitorPlay className="w-6 h-6 mr-2" />
            {screenRecording.isRecording ? "Stop" : "Record"}
          </Button>
        </div>

        {/* Task Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
          <Card className="p-6 rounded-xl text-center hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold mb-2">Today's Tasks</h3>
            <p className="text-2xl font-bold text-primary">5</p>
            <p className="text-sm text-muted-foreground">3 completed</p>
          </Card>
          
          <Card className="p-6 rounded-xl text-center hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="font-semibold mb-2">Repeating Tasks</h3>
            <p className="text-2xl font-bold text-primary">12</p>
            <p className="text-sm text-muted-foreground">2 due today</p>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Index;