import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Square, Play } from 'lucide-react';
import { useScreenRecording } from '@/hooks/useScreenRecording';
import { RecordingIndicator } from '@/components/RecordingIndicator';
import { toast } from '@/hooks/use-toast';

export default function Record() {
  const [recordings, setRecordings] = useState<{ blob: Blob; duration: string; timestamp: Date }[]>([]);

  const { isRecording, formattedTime, startRecording, stopRecording } = useScreenRecording({
    onRecordingStart: () => {
      toast({
        title: "Recording started",
        description: "Capturing your workflow. Stop screen sharing to end recording.",
      });
    },
    onRecordingStop: (blob) => {
      const newRecording = {
        blob,
        duration: formattedTime,
        timestamp: new Date()
      };
      setRecordings(prev => [newRecording, ...prev]);
      toast({
        title: "Recording saved",
        description: `Workflow recorded for ${formattedTime}`,
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

  const handleStartStop = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const downloadRecording = (blob: Blob, index: number) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-recording-${index + 1}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <RecordingIndicator 
        isRecording={isRecording} 
        recordingTime={formattedTime}
        onStop={stopRecording}
      />

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Workflow Recording</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Record your screen to capture workflows and processes for automation or documentation.
        </p>
      </div>

      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Screen Recording
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={handleStartStop}
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className="h-16 px-8 text-lg font-medium rounded-2xl shadow-lg"
            >
              {isRecording ? (
                <>
                  <Square className="h-6 w-6 mr-3" />
                  Stop Recording
                </>
              ) : (
                <>
                  <Video className="h-6 w-6 mr-3" />
                  Start Recording
                </>
              )}
            </Button>
            
            {isRecording && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Recording in progress...</p>
                <p className="text-2xl font-mono font-bold text-primary">{formattedTime}</p>
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">How to record:</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Click "Start Recording" button</li>
              <li>Select the screen, window, or tab you want to record</li>
              <li>Perform your workflow as normal</li>
              <li>Click "Stop Recording" or stop screen sharing to finish</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Recordings History */}
      {recordings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recorded Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recordings.map((recording, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Play className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Workflow Recording {index + 1}</p>
                      <p className="text-sm text-muted-foreground">
                        Duration: {recording.duration} • Recorded: {recording.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => downloadRecording(recording.blob, index)}
                    variant="outline"
                    size="sm"
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}