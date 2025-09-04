import { useState, useCallback, useRef, useEffect } from 'react';
import { whisperTranscriber, WhisperTranscriptionResult, WhisperStatus, AudioInput } from '@/lib/whisper';
import { AudioProcessor } from '@/lib/whisper/utils/audio';

interface UseWhisperTranscriptionOptions {
  onResult?: (result: WhisperTranscriptionResult) => void;
  onError?: (error: string) => void;
  onStatusChange?: (status: WhisperStatus) => void;
  autoStart?: boolean;
  continuous?: boolean;
}

export function useWhisperTranscription(options: UseWhisperTranscriptionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [status, setStatus] = useState<WhisperStatus | null>(null);
  const [lastResult, setLastResult] = useState<WhisperTranscriptionResult | null>(null);

  const audioProcessor = useRef<AudioProcessor>(new AudioProcessor());
  const currentStream = useRef<MediaStream | null>(null);

  const updateStatus = useCallback(() => {
    const currentStatus = whisperTranscriber.getStatus();
    console.log('🎤 useWhisperTranscription updating status:', currentStatus);
    setStatus(currentStatus);
    setIsInitialized(currentStatus.isInitialized);
    options.onStatusChange?.(currentStatus);
  }, [options]);

  useEffect(() => {
    // Initialize whisper on mount
    const initializeWhisper = async () => {
      console.log('🎤 useWhisperTranscription starting initialization...');
      try {
        await whisperTranscriber.initialize();
        console.log('🎤 useWhisperTranscription initialization complete');
        updateStatus();
      } catch (error) {
        console.error('🎤 useWhisperTranscription initialization failed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to initialize Whisper';
        setStatus(prev => ({ ...prev!, error: errorMessage, isLoading: false }));
        options.onError?.(errorMessage);
      }
    };

    initializeWhisper();

    // Set up interval to check status periodically (in case of missed updates)
    const statusInterval = setInterval(updateStatus, 2000);

    // Cleanup on unmount
    return () => {
      clearInterval(statusInterval);
      audioProcessor.current.cleanup();
    };
  }, [updateStatus]);

  const startListening = useCallback(async () => {
    if (isListening || !isInitialized) return;

    try {
      const stream = await audioProcessor.current.startRecording();
      currentStream.current = stream;
      setIsListening(true);
      
      if (!options.continuous) {
        // For single-shot transcription, set a timeout
        setTimeout(() => {
          if (isListening) {
            stopListening();
          }
        }, 10000); // 10 second timeout
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording';
      options.onError?.(errorMessage);
    }
  }, [isListening, isInitialized, options]);

  const stopListening = useCallback(async () => {
    if (!isListening) return;

    try {
      setIsListening(false);
      
      const audioBlob = await audioProcessor.current.stopRecording();
      
      if (currentStream.current) {
        currentStream.current.getTracks().forEach(track => track.stop());
        currentStream.current = null;
      }

      // Transcribe the recorded audio
      const audioInput: AudioInput = {
        type: 'file',
        data: audioBlob
      };

      const result = await whisperTranscriber.transcribe(audioInput, {
        returnTimestamps: true,
        returnWordTimestamps: false,
        language: 'en'
      });

      setLastResult(result);
      options.onResult?.(result);
      updateStatus();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process audio';
      options.onError?.(errorMessage);
    }
  }, [isListening, options, updateStatus]);

  const transcribeFile = useCallback(async (file: File): Promise<WhisperTranscriptionResult> => {
    if (!isInitialized) {
      throw new Error('Whisper not initialized');
    }

    const audioInput: AudioInput = {
      type: 'file',
      data: file
    };

    const result = await whisperTranscriber.transcribe(audioInput, {
      returnTimestamps: true,
      returnWordTimestamps: true,
      language: 'en'
    });

    setLastResult(result);
    updateStatus();
    return result;
  }, [isInitialized, updateStatus]);

  const reset = useCallback(() => {
    if (isListening) {
      stopListening();
    }
    setLastResult(null);
  }, [isListening, stopListening]);

  return {
    isListening,
    isInitialized,
    status,
    lastResult,
    startListening,
    stopListening,
    transcribeFile,
    reset,
    // Computed properties for convenience
    isLoading: status?.isLoading ?? false,
    isTranscribing: status?.isTranscribing ?? false,
    platform: status?.platform ?? 'web',
    error: status?.error
  };
}