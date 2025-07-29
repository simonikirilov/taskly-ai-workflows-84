import { Circle } from 'lucide-react';

interface RecordingIndicatorProps {
  isRecording: boolean;
  recordingTime: string;
  onStop?: () => void;
}

export function RecordingIndicator({ isRecording, recordingTime, onStop }: RecordingIndicatorProps) {
  if (!isRecording) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="glass px-4 py-2 rounded-full flex items-center gap-3 border border-destructive/20">
        {/* Recording Dot */}
        <div className="flex items-center gap-2">
          <Circle className="h-3 w-3 fill-destructive text-destructive animate-pulse" />
          <span className="text-sm font-medium text-destructive">REC</span>
        </div>
        
        {/* Timer */}
        <div className="text-sm font-mono text-foreground">
          {recordingTime}
        </div>
        
        {/* Stop Button */}
        {onStop && (
          <button
            onClick={onStop}
            className="text-xs px-2 py-1 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 transition-colors"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}