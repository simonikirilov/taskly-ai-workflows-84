import { useState, useRef, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseVoiceRecognitionOptions {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
}

export function useVoiceRecognition({ onResult, onError }: UseVoiceRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setIsSupported(false);
      toast({
        title: "Voice recognition not supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
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
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onResult, onError]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
  };
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}