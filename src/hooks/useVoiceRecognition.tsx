import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useWhisperTranscription } from './useWhisperTranscription';

interface UseVoiceRecognitionOptions {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  onVolumeChange?: (volume: number) => void;
  useWhisper?: boolean;
}

interface BrowserSupportCheck {
  isSupported: boolean;
  reason?: string;
  canUseServerFallback: boolean;
  hasNativeSupport: boolean;
  hasMediaRecorder: boolean;
  whisperSupported: boolean;
  permissionStatus: 'unknown' | 'granted' | 'denied' | 'prompt';
}

export function useVoiceRecognition({ 
  onResult, 
  onError, 
  onVolumeChange, 
  useWhisper = false 
}: UseVoiceRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [supportStatus, setSupportStatus] = useState<BrowserSupportCheck | null>(null);
  const [useServerFallback, setUseServerFallback] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize Whisper transcription hook
  const whisperTranscription = useWhisperTranscription({
    onResult: (result) => {
      onResult(result.text);
    },
    onError: (error) => {
      console.error('Whisper transcription error:', error);
      onError?.(error);
    }
  });

  const checkBrowserSupport = useCallback(async (): Promise<BrowserSupportCheck> => {
    console.log('🔍 Checking browser support for voice recognition...');
    
    const isHttps = location.protocol === 'https:' || location.hostname === 'localhost';
    const hasNativeSupport = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
    console.log('🔍 Speech Recognition APIs available:', {
      webkitSpeechRecognition: 'webkitSpeechRecognition' in window,
      SpeechRecognition: 'SpeechRecognition' in window,
      hasNativeSupport
    });
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
    const whisperSupported = whisperTranscription.isInitialized || 
                             (typeof window !== 'undefined' && 'WebAssembly' in window);
    
    let permissionStatus: 'unknown' | 'granted' | 'denied' | 'prompt' = 'unknown';
    
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        permissionStatus = permission.state;
        console.log('🎤 Microphone permission status:', permission.state);
      } catch (error) {
        console.log('⚠️ Could not check microphone permissions:', error);
      }
    }

    console.log('📊 Browser capabilities:', {
      isHttps,
      hasNativeSupport,
      hasMediaDevices,
      hasMediaRecorder,
      whisperSupported,
      permissionStatus
    });

    if (!isHttps) {
      return {
        isSupported: false,
        reason: 'Voice recognition requires HTTPS or localhost',
        canUseServerFallback: hasMediaDevices && hasMediaRecorder,
        hasNativeSupport: false,
        hasMediaRecorder,
        whisperSupported,
        permissionStatus
      };
    }

    if (!hasMediaDevices) {
      return {
        isSupported: false,
        reason: 'Microphone access not supported in this browser',
        canUseServerFallback: false,
        hasNativeSupport: false,
        hasMediaRecorder,
        whisperSupported,
        permissionStatus
      };
    }

    return {
      isSupported: hasNativeSupport || hasMediaRecorder || whisperSupported,
      reason: hasNativeSupport ? undefined : whisperSupported ? 'Using Whisper AI transcription' : 'Limited speech recognition available',
      canUseServerFallback: hasMediaRecorder,
      hasNativeSupport,
      hasMediaRecorder,
      whisperSupported,
      permissionStatus
    };
  }, [whisperTranscription.isInitialized]);

  const setupVoiceActivityDetection = useCallback((stream: MediaStream) => {
    if (!window.AudioContext && !(window as any).webkitAudioContext) {
      console.log('⚠️ Web Audio API not supported');
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      const analyser = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = analyser;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const detectVoiceActivity = () => {
        if (!analyserRef.current || !isListening) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        const volume = Math.min(100, Math.max(0, (average / 128) * 100));
        
        setAudioLevel(volume);
        onVolumeChange?.(volume);

        const SILENCE_THRESHOLD = 5;
        const SILENCE_DURATION = 2000;

        if (volume < SILENCE_THRESHOLD) {
          if (!silenceTimeoutRef.current) {
            silenceTimeoutRef.current = setTimeout(() => {
              console.log('🔇 Silence detected, auto-stopping recording');
              if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.stop();
              }
            }, SILENCE_DURATION);
          }
        } else {
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
            silenceTimeoutRef.current = null;
          }
        }

        animationFrameRef.current = requestAnimationFrame(detectVoiceActivity);
      };

      detectVoiceActivity();
    } catch (error) {
      console.log('⚠️ Error setting up voice activity detection:', error);
    }
  }, [isListening, onVolumeChange]);

  const cleanupAudioResources = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  useEffect(() => {
    const initializeSupportCheck = async () => {
      console.log('🚀 Initializing voice recognition support check...');
      try {
        const support = await checkBrowserSupport();
        setSupportStatus(support);
        setIsSupported(support.isSupported);
        console.log('✅ Initial support check complete:', support);
      } catch (error) {
        console.error('❌ Error checking browser support:', error);
        setIsSupported(false);
        setSupportStatus({
          isSupported: false,
          reason: 'Error checking browser capabilities',
          canUseServerFallback: false,
          hasNativeSupport: false,
          hasMediaRecorder: false,
          whisperSupported: false,
          permissionStatus: 'unknown'
        });
      }
    };

    initializeSupportCheck();
  }, [checkBrowserSupport]);

  const startNativeSpeechRecognition = useCallback(async () => {
    console.log('🚀 Starting native speech recognition...');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('🎙️ Native speech recognition started');
      setIsListening(true);
      setUseServerFallback(false);
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          console.log('⏰ Auto-stopping due to timeout');
          recognitionRef.current.stop();
        }
      }, 4000);
    };

    recognition.onresult = (event) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      const transcript = event.results[0][0].transcript;
      console.log('✅ Speech recognition result:', transcript);
      
      const voiceHistory = JSON.parse(localStorage.getItem('taskly-voice-history') || '[]');
      voiceHistory.push({ text: transcript, timestamp: new Date().toISOString() });
      localStorage.setItem('taskly-voice-history', JSON.stringify(voiceHistory.slice(-10)));
      
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      console.log('❌ Native speech recognition error:', event.error);
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
      console.log('🔚 Native speech recognition ended');
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    setIsSupported(true);
    recognition.start();
  }, [onResult, onError]);

  const startListening = useCallback(async () => {
    console.log('🎙️ Starting voice recognition...');
    
    const support = await checkBrowserSupport();
    setSupportStatus(support);
    console.log('🔍 Current support status:', support);

    // Use Whisper if preferred and available
    if (useWhisper && support.whisperSupported && whisperTranscription.isInitialized) {
      console.log('🚀 Using Whisper AI transcription');
      setIsListening(true);
      await whisperTranscription.startListening();
      return;
    }

    // Use native browser speech recognition
    if (support.hasNativeSupport) {
      console.log('🚀 Using native browser speech recognition');
      setUseServerFallback(false);
      await startNativeSpeechRecognition();
      return;
    }

    // Fallback to Whisper if native not available
    if (support.whisperSupported && whisperTranscription.isInitialized) {
      console.log('🚀 Falling back to Whisper AI transcription');
      setIsListening(true);
      await whisperTranscription.startListening();
      return;
    }

    // Show error if no speech recognition is available
    console.log('❌ No speech recognition available');
    onError?.("Speech recognition not available. Please use text input instead.");
    toast({
      title: "Voice Recognition Unavailable",
      description: "Your browser doesn't support speech recognition. Please use the text input option instead.",
      variant: "destructive",
    });
  }, [useWhisper, whisperTranscription, onResult, onError, checkBrowserSupport, startNativeSpeechRecognition]);

  const stopListening = useCallback(() => {
    console.log('🛑 Manually stopping voice recognition');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    // Stop Whisper if it's being used
    if (useWhisper && whisperTranscription.isListening) {
      whisperTranscription.stopListening();
    }
    
    cleanupAudioResources();
    setIsListening(false);
  }, [useWhisper, whisperTranscription, cleanupAudioResources]);

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    supportStatus,
    useServerFallback,
    checkBrowserSupport,
    audioLevel,
    // Whisper-related state
    whisperStatus: whisperTranscription.status,
    isWhisperInitialized: whisperTranscription.isInitialized,
    whisperError: whisperTranscription.error,
  };
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}