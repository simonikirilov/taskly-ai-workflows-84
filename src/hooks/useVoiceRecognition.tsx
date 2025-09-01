import { useState, useRef, useCallback, useEffect } from 'react';
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
  hasNativeSupport: boolean;
  hasMediaRecorder: boolean;
  permissionStatus: 'unknown' | 'granted' | 'denied' | 'prompt';
}

export function useVoiceRecognition({ onResult, onError }: UseVoiceRecognitionOptions) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null); // null = checking, true/false = result
  const [supportStatus, setSupportStatus] = useState<BrowserSupportCheck | null>(null);
  const [useServerFallback, setUseServerFallback] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const checkBrowserSupport = useCallback(async (): Promise<BrowserSupportCheck> => {
    console.log('🔍 Checking browser support for voice recognition...');
    
    const isHttps = location.protocol === 'https:' || location.hostname === 'localhost';
    const hasNativeSupport = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
    
    let permissionStatus: 'unknown' | 'granted' | 'denied' | 'prompt' = 'unknown';
    
    // Check microphone permissions if possible
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
      permissionStatus
    });

    // Check HTTPS requirement
    if (!isHttps) {
      return {
        isSupported: false,
        reason: 'Voice recognition requires HTTPS or localhost',
        canUseServerFallback: hasMediaDevices && hasMediaRecorder,
        hasNativeSupport: false,
        hasMediaRecorder,
        permissionStatus
      };
    }

    // Check for MediaDevices API (required for all voice features)
    if (!hasMediaDevices) {
      return {
        isSupported: false,
        reason: 'Microphone access not supported in this browser',
        canUseServerFallback: false,
        hasNativeSupport: false,
        hasMediaRecorder,
        permissionStatus
      };
    }

    // Check for MediaRecorder (required for server fallback)
    if (!hasMediaRecorder) {
      return {
        isSupported: hasNativeSupport,
        reason: hasNativeSupport ? undefined : 'Voice recognition not supported in this browser',
        canUseServerFallback: false,
        hasNativeSupport,
        hasMediaRecorder: false,
        permissionStatus
      };
    }

    // All capabilities available
    return {
      isSupported: hasNativeSupport || hasMediaRecorder,
      reason: hasNativeSupport ? undefined : 'Using server-based voice recognition',
      canUseServerFallback: hasMediaRecorder,
      hasNativeSupport,
      hasMediaRecorder,
      permissionStatus
    };
  }, []);

  // Check browser support on component mount
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
          permissionStatus: 'unknown'
        });
      }
    };

    initializeSupportCheck();
  }, [checkBrowserSupport]);

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
    console.log('🎙️ Starting voice recognition...');
    
    // Check browser support when user actually tries to use voice
    const support = await checkBrowserSupport();
    setSupportStatus(support);
    console.log('🔍 Current support status:', support);

    if (!support.isSupported) {
      if (support.canUseServerFallback) {
        console.log('📡 Using server fallback for voice recognition');
        setUseServerFallback(true);
        toast({
          title: "Using server voice recognition",
          description: support.reason + ". Falling back to server transcription.",
        });
        await startServerVoiceRecognition();
        return;
      } else {
        console.log('❌ Voice recognition not supported, no fallback available');
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
    console.log('🎤 Attempting to access microphone for native recognition...');
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone access granted');
    } catch (error) {
      console.log('❌ Microphone access denied:', error);
      if (support.canUseServerFallback) {
        console.log('📡 Falling back to server voice recognition');
        setUseServerFallback(true);
        toast({
          title: "Using server voice recognition",
          description: "Microphone permission required for native voice recognition. Using server fallback.",
        });
        await startServerVoiceRecognition();
        return;
      } else {
        onError?.("Microphone access denied");
        toast({
          title: "Microphone access denied",
          description: "Please allow microphone access or use the type option instead.",
          variant: "destructive",
        });
        return;
      }
    }

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
      // Auto-stop after 5 seconds of no speech
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          console.log('⏰ Auto-stopping due to timeout');
          recognitionRef.current.stop();
        }
      }, 5000);
    };

    recognition.onresult = (event) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      const transcript = event.results[0][0].transcript;
      console.log('✅ Speech recognition result:', transcript);
      
      // Store in localStorage
      const voiceHistory = JSON.parse(localStorage.getItem('taskly-voice-history') || '[]');
      voiceHistory.push({ text: transcript, timestamp: new Date().toISOString() });
      localStorage.setItem('taskly-voice-history', JSON.stringify(voiceHistory.slice(-10))); // Keep last 10
      
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = async (event) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      console.log('❌ Native speech recognition error:', event.error);

      // If native recognition fails and server fallback is possible, use it
      if (support.canUseServerFallback && event.error !== 'aborted') {
        console.log('📡 Switching to server fallback due to error');
        setUseServerFallback(true);
        toast({
          title: "Switching to server voice recognition",
          description: "Native voice recognition failed. Using server fallback.",
        });
        await startServerVoiceRecognition();
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
      console.log('🔚 Native speech recognition ended');
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