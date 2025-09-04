import { useState, useCallback, useRef, useEffect } from 'react';
import { whisperTranscriber, WhisperTranscriptionResult } from '@/lib/whisper';

interface StreamingTranscriptionOptions {
  onPartialResult?: (text: string, confidence: number) => void;
  onFinalResult?: (result: WhisperTranscriptionResult) => void;
  onError?: (error: string) => void;
  chunkDuration?: number; // milliseconds
  language?: string;
}

interface StreamingState {
  isStreaming: boolean;
  partialText: string;
  finalText: string;
  confidence: number;
  processingChunk: boolean;
}

export function useStreamingTranscription(options: StreamingTranscriptionOptions = {}) {
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    partialText: '',
    finalText: '',
    confidence: 0,
    processingChunk: false,
  });

  const audioChunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunkTimerRef = useRef<NodeJS.Timeout | null>(null);
  const processingQueueRef = useRef<Blob[]>([]);
  const isProcessingRef = useRef<boolean>(false);

  const { 
    chunkDuration = 1000, // 1 second chunks for real-time processing
    language = 'en',
    onPartialResult,
    onFinalResult,
    onError 
  } = options;

  // Process audio chunk for transcription
  const processAudioChunk = useCallback(async (audioBlob: Blob) => {
    if (isProcessingRef.current) {
      processingQueueRef.current.push(audioBlob);
      return;
    }

    isProcessingRef.current = true;
    setStreamingState(prev => ({ ...prev, processingChunk: true }));

    try {
      const result = await whisperTranscriber.transcribe(
        { type: 'file', data: audioBlob },
        { 
          returnTimestamps: true,
          returnWordTimestamps: false,
          language 
        }
      );

      if (result.text.trim()) {
        setStreamingState(prev => ({
          ...prev,
          partialText: result.text,
          confidence: result.confidence || 0.8,
        }));

        onPartialResult?.(result.text, result.confidence || 0.8);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transcription failed';
      onError?.(errorMessage);
    } finally {
      isProcessingRef.current = false;
      setStreamingState(prev => ({ ...prev, processingChunk: false }));

      // Process queued chunks
      if (processingQueueRef.current.length > 0) {
        const nextChunk = processingQueueRef.current.shift();
        if (nextChunk) {
          setTimeout(() => processAudioChunk(nextChunk), 50);
        }
      }
    }
  }, [language, onPartialResult, onError]);

  // Create audio chunks from stream
  const handleDataAvailable = useCallback((event: BlobEvent) => {
    if (event.data.size > 0) {
      audioChunksRef.current.push(event.data);
      
      // Process chunk immediately for streaming
      processAudioChunk(event.data);
    }
  }, [processAudioChunk]);

  // Start streaming transcription
  const startStreaming = useCallback(async (stream: MediaStream) => {
    try {
      // Clear previous state
      audioChunksRef.current = [];
      processingQueueRef.current = [];
      setStreamingState({
        isStreaming: true,
        partialText: '',
        finalText: '',
        confidence: 0,
        processingChunk: false,
      });

      // Create MediaRecorder for chunked audio
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.addEventListener('dataavailable', handleDataAvailable);
      
      // Start recording with time slicing for real-time chunks
      mediaRecorder.start(chunkDuration);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start streaming';
      onError?.(errorMessage);
      setStreamingState(prev => ({ ...prev, isStreaming: false }));
    }
  }, [chunkDuration, handleDataAvailable, onError]);

  // Stop streaming and get final result
  const stopStreaming = useCallback(async (): Promise<WhisperTranscriptionResult | null> => {
    if (!mediaRecorderRef.current) return null;

    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!;
      
      const handleStop = async () => {
        setStreamingState(prev => ({ ...prev, isStreaming: false }));
        
        // Wait for any pending processing to complete
        while (isProcessingRef.current || processingQueueRef.current.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Combine all chunks for final transcription
        if (audioChunksRef.current.length > 0) {
          try {
            const combinedBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            
            const finalResult = await whisperTranscriber.transcribe(
              { type: 'file', data: combinedBlob },
              { 
                returnTimestamps: true,
                returnWordTimestamps: true,
                language 
              }
            );

            setStreamingState(prev => ({
              ...prev,
              finalText: finalResult.text,
              confidence: finalResult.confidence || 0.8,
            }));

            onFinalResult?.(finalResult);
            resolve(finalResult);
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Final transcription failed';
            onError?.(errorMessage);
            resolve(null);
          }
        } else {
          resolve(null);
        }
      };

      mediaRecorder.addEventListener('stop', handleStop, { once: true });
      mediaRecorder.stop();
      mediaRecorderRef.current = null;
    });
  }, [language, onFinalResult, onError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (chunkTimerRef.current) {
        clearTimeout(chunkTimerRef.current);
      }
    };
  }, []);

  // Get accumulated text (partial + context)
  const getAccumulatedText = useCallback(() => {
    return streamingState.finalText + ' ' + streamingState.partialText;
  }, [streamingState.finalText, streamingState.partialText]);

  // Clear streaming state
  const clearTranscription = useCallback(() => {
    setStreamingState({
      isStreaming: false,
      partialText: '',
      finalText: '',
      confidence: 0,
      processingChunk: false,
    });
    audioChunksRef.current = [];
    processingQueueRef.current = [];
  }, []);

  return {
    streamingState,
    startStreaming,
    stopStreaming,
    clearTranscription,
    getAccumulatedText,
    // Helper getters
    isStreaming: streamingState.isStreaming,
    partialText: streamingState.partialText,
    finalText: streamingState.finalText,
    confidence: streamingState.confidence,
    isProcessing: streamingState.processingChunk,
  };
}