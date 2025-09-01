import { useState, useRef, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UseVoiceRecognitionOptions {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
}

interface BrowserSupportCheck {
  isSupported: boolean;
  reason?: string;
  canUseServerFallback: boolean;
}

export function useVoiceRecognition({ onResult, onError }: UseVoiceRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [supportStatus, setSupportStatus] = useState<BrowserSupportCheck | null>(null);
  const [useServerFallback, setUseServerFallback] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const checkBrowserSupport = useCallback((): BrowserSupportCheck => {
    // Check HTTPS requirement
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      return {
        isSupported: false,
        reason: 'Voice recognition requires HTTPS or localhost',
        canUseServerFallback: true
      };
    }

    // Check for Speech Recognition API
    const hasSpeechRecognition = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
    if (!hasSpeechRecognition) {
      return {
        isSupported: false,
        reason: 'Speech Recognition API not supported in this browser',
        canUseServerFallback: true
      };
    }

    // Check for MediaDevices API (required for microphone access)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        isSupported: false,
        reason: 'Microphone access not supported',
        canUseServerFallback: false
      };
    }

    return {
      isSupported: true,
      canUseServerFallback: true
    };
  }, []);

  const startServerVoiceRecognition = useCallback(async () => {
    try {
      setIsListening(true);
      audioChunksRef.current = [];

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          
          // Convert to base64
          const reader = new FileReader();
          reader.onloadend = async () => {
            try {
              const base64Audio = (reader.result as string).split(',')[1];
              
              const { data, error } = await supabase.functions.invoke('voice-to-text', {
                body: { audio: base64Audio }
              });

              if (error) throw error;

              if (data.text) {
                // Store in localStorage
                const voiceHistory = JSON.parse(localStorage.getItem('taskly-voice-history') || '[]');
                voiceHistory.push({ text: data.text, timestamp: new Date().toISOString() });
                localStorage.setItem('taskly-voice-history', JSON.stringify(voiceHistory.slice(-10)));
                
                onResult(data.text);
              } else {
                throw new Error('No transcription received');
              }
            } catch (error) {
              const errorMessage = `Server transcription error: ${error.message}`;
              onError?.(errorMessage);
              toast({
                title: "Voice recognition error",
                description: errorMessage,
                variant: "destructive",
              });
            }
          };
          reader.readAsDataURL(audioBlob);
        } catch (error) {
          const errorMessage = `Audio processing error: ${error.message}`;
          onError?.(errorMessage);
          toast({
            title: "Voice recognition error",
            description: errorMessage,
            variant: "destructive",
          });
        }

        // Clean up
        stream.getTracks().forEach(track => track.stop());
        setIsListening(false);
      };

      // Auto-stop after 10 seconds
      timeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, 10000);

      mediaRecorder.start();
    } catch (error) {
      const errorMessage = `Microphone access denied: ${error.message}`;
      onError?.(errorMessage);
      setIsListening(false);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice features",
        variant: "destructive",
      });
    }
  }, [onResult, onError]);

  const startListening = useCallback(async () => {
    // Check browser support when user actually tries to use voice
    const support = checkBrowserSupport();
    setSupportStatus(support);

    if (!support.isSupported) {
      if (support.canUseServerFallback) {
        setUseServerFallback(true);
        toast({
          title: "Using server voice recognition",
          description: support.reason + ". Falling back to server transcription.",
        });
        await startServerVoiceRecognition();
        return;
      } else {
        onError?.(support.reason || "Voice recognition not supported");
        toast({
          title: "Voice not supported",
          description: support.reason + ". Please use the type option instead.",
          variant: "destructive",
        });
        return;
      }
    }

    // Try native Speech Recognition first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      if (support.canUseServerFallback) {
        setUseServerFallback(true);
        toast({
          title: "Using server voice recognition",
          description: "Microphone permission required for native voice recognition. Using server fallback.",
        });
        await startServerVoiceRecognition();
        return;
      } else {
        onError?.("Microphone access denied");
        return;
      }
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setUseServerFallback(false);
      // Auto-stop after 5 seconds of no speech
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }, 5000);
    };

    recognition.onresult = (event) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      const transcript = event.results[0][0].transcript;
      // Store in localStorage
      const voiceHistory = JSON.parse(localStorage.getItem('taskly-voice-history') || '[]');
      voiceHistory.push({ text: transcript, timestamp: new Date().toISOString() });
      localStorage.setItem('taskly-voice-history', JSON.stringify(voiceHistory.slice(-10))); // Keep last 10
      
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // If native recognition fails and server fallback is possible, use it
      if (support.canUseServerFallback && event.error !== 'aborted') {
        setUseServerFallback(true);
        toast({
          title: "Switching to server voice recognition",
          description: "Native voice recognition failed. Using server fallback.",
        });
        startServerVoiceRecognition();
        return;
      }

      const errorMessage = `Speech recognition error: ${event.error}`;
      onError?.(errorMessage);
      setIsListening(false);
      toast({
        title: "Voice recognition error",
        description: errorMessage,
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsSupported(true);
    recognition.start();
  }, [onResult, onError, checkBrowserSupport, startServerVoiceRecognition]);

  const stopListening = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    supportStatus,
    useServerFallback,
    checkBrowserSupport,
  };
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}