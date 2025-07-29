import { useState, useRef, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseScreenRecordingOptions {
  onRecordingStart?: () => void;
  onRecordingStop?: (blob: Blob) => void;
  onError?: (error: string) => void;
}

export function useScreenRecording({
  onRecordingStart,
  onRecordingStop,
  onError
}: UseScreenRecordingOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    // Check if mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // For mobile, show message that screen recording isn't available
      onError?.('Screen recording not available on mobile. Please use voice to describe your workflow instead.');
      return;
    }

    try {
      // Request screen recording permission
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      streamRef.current = stream;
      chunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        onRecordingStop?.(blob);
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      // Handle stream ending (user stops sharing)
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopRecording();
      });

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      onRecordingStart?.();
      
      toast({
        title: "Recording started",
        description: "Your workflow is being captured. Stop sharing to end recording.",
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';
      onError?.(errorMessage);
      
      toast({
        title: "Recording failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [onRecordingStart, onRecordingStop, onError]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRecording(false);
    setRecordingTime(0);
  }, [isRecording]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    isRecording,
    recordingTime,
    formattedTime: formatTime(recordingTime),
    startRecording,
    stopRecording,
    isSupported: typeof navigator !== 'undefined' && 'mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices
  };
}