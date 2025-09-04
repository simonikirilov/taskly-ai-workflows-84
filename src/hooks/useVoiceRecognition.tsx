import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useWhisperTranscription } from './useWhisperTranscription';
import { useAdvancedVAD } from './useAdvancedVAD';
import { useStreamingTranscription } from './useStreamingTranscription';

interface UseVoiceRecognitionOptions {
  onResult: (transcript: string) => void;
  onError?: (error: string) => void;
  onVolumeChange?: (volume: number) => void;
  onPartialResult?: (transcript: string) => void;
  useWhisper?: boolean;
  useStreaming?: boolean;
  sensitivityLevel?: number;
}

interface BrowserSupportCheck {
  isSupported: boolean;
  reason?: string;
  canUseServerFallback: boolean;
  hasNativeSupport: boolean;
  hasMediaRecorder: boolean;
  whisperSupported: boolean;
  advancedVADSupported: boolean;
  streamingSupported: boolean;
  permissionStatus: 'unknown' | 'granted' | 'denied' | 'prompt';
}

interface VoiceState {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  partialText: string;
  finalText: string;
  confidence: number;
  volume: number;
  speechDuration: number;
  silenceDuration: number;
}

export function useVoiceRecognition({ 
  onResult, 
  onError, 
  onVolumeChange,
  onPartialResult, 
  useWhisper = true,
  useStreaming = true,
  sensitivityLevel = 3
}: UseVoiceRecognitionOptions) {
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isListening: false,
    isSpeaking: false,
    isProcessing: false,
    partialText: '',
    finalText: '',
    confidence: 0,
    volume: 0,
    speechDuration: 0,
    silenceDuration: 0,
  });
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [supportStatus, setSupportStatus] = useState<BrowserSupportCheck | null>(null);
  
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const naturalStopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const completionConfidenceRef = useRef<number>(0);

  // Initialize advanced VAD
  const advancedVAD = useAdvancedVAD({
    sensitivityLevel,
    adaptiveThreshold: true,
    onSpeechStart: () => {
      console.log('🎙️ Natural speech detected');
      setVoiceState(prev => ({ ...prev, isSpeaking: true }));
      
      // Clear any pending natural stop timer
      if (naturalStopTimerRef.current) {
        clearTimeout(naturalStopTimerRef.current);
        naturalStopTimerRef.current = null;
      }
    },
    onSpeechEnd: () => {
      console.log('🔇 Natural speech pause detected');
      setVoiceState(prev => ({ ...prev, isSpeaking: false }));
      handleNaturalSpeechPause();
    },
    onVolumeChange: (volume) => {
      setVoiceState(prev => ({ ...prev, volume }));
      onVolumeChange?.(volume);
    }
  });

  // Initialize streaming transcription
  const streamingTranscription = useStreamingTranscription({
    chunkDuration: 800, // 800ms chunks for responsive streaming
    onPartialResult: (text, confidence) => {
      console.log('📝 Partial transcription:', text);
      setVoiceState(prev => ({ 
        ...prev, 
        partialText: text, 
        confidence,
        isProcessing: false 
      }));
      onPartialResult?.(text);
      
      // Analyze completion confidence
      analyzeCompletionConfidence(text, confidence);
    },
    onFinalResult: (result) => {
      console.log('✅ Final transcription:', result.text);
      setVoiceState(prev => ({ 
        ...prev, 
        finalText: result.text,
        partialText: '',
        confidence: result.confidence || 0.8,
        isProcessing: false 
      }));
      onResult(result.text);
    },
    onError: (error) => {
      console.error('Streaming transcription error:', error);
      onError?.(error);
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
    }
  });

  // Fallback Whisper transcription for non-streaming mode
  const whisperTranscription = useWhisperTranscription({
    onResult: (result) => {
      console.log('✅ Whisper result:', result.text);
      setVoiceState(prev => ({ 
        ...prev, 
        finalText: result.text,
        confidence: result.confidence || 0.8,
        isProcessing: false 
      }));
      onResult(result.text);
    },
    onError: (error) => {
      console.error('Whisper transcription error:', error);
      onError?.(error);
      setVoiceState(prev => ({ ...prev, isProcessing: false }));
    }
  });

  // Analyze completion confidence using linguistic patterns
  const analyzeCompletionConfidence = useCallback((text: string, transcriptionConfidence: number) => {
    const words = text.trim().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    let completionScore = 0;
    
    // Length-based confidence (longer utterances are more likely complete)
    if (words.length >= 5) completionScore += 0.3;
    if (words.length >= 10) completionScore += 0.2;
    
    // Sentence completion markers
    const lastChar = text.trim().slice(-1);
    if (['.', '!', '?'].includes(lastChar)) completionScore += 0.4;
    
    // Common completion patterns
    const completionPhrases = [
      /\b(that's it|done|finished|complete|end|thanks?|okay|alright)\b/i,
      /\b(please|thank you|got it)\b/i
    ];
    if (completionPhrases.some(pattern => pattern.test(text))) {
      completionScore += 0.3;
    }
    
    // Grammatical completion (simple heuristic)
    if (sentences.length > 0 && sentences[sentences.length - 1].trim()) {
      const lastSentence = sentences[sentences.length - 1].trim();
      const hasSubjectVerb = /\b\w+\s+(is|are|was|were|will|would|can|could|should)\b/i.test(lastSentence);
      if (hasSubjectVerb) completionScore += 0.2;
    }
    
    // Combine with transcription confidence
    const finalConfidence = Math.min(1, (completionScore * 0.7) + (transcriptionConfidence * 0.3));
    completionConfidenceRef.current = finalConfidence;
    
    console.log('🧠 Completion analysis:', { completionScore, transcriptionConfidence, finalConfidence });
  }, []);

  // Update voice state when handleNaturalSpeechPause is called
  const handleNaturalSpeechPause = useCallback(() => {
    const { silenceDuration } = advancedVAD.vadState;
    const confidence = completionConfidenceRef.current;
    
    // Dynamic pause handling based on context
    let stopDelay = 1500; // Base delay
    
    // Adjust based on completion confidence
    if (confidence > 0.8) stopDelay = 800;  // High confidence = quick stop
    if (confidence < 0.5) stopDelay = 2500; // Low confidence = wait longer
    
    // Adjust based on silence duration
    if (silenceDuration > 2000) stopDelay = Math.max(500, stopDelay - 500);
    
    // Clear any existing timer
    if (naturalStopTimerRef.current) {
      clearTimeout(naturalStopTimerRef.current);
    }
    
    naturalStopTimerRef.current = setTimeout(() => {
      if (!advancedVAD.isSpeaking && voiceState.isListening) {
        console.log('🎯 Natural conversation end detected', { confidence, silenceDuration, stopDelay });
        stopListening();
      }
    }, stopDelay);
  }, [advancedVAD.vadState, advancedVAD.isSpeaking, voiceState.isListening]);

  const checkBrowserSupport = useCallback(async (): Promise<BrowserSupportCheck> => {
    console.log('🔍 Checking browser support for natural voice recognition...');
    
    const isHttps = location.protocol === 'https:' || location.hostname === 'localhost';
    const hasNativeSupport = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
    const whisperSupported = whisperTranscription.isInitialized || 
                             (typeof window !== 'undefined' && 'WebAssembly' in window);
    const advancedVADSupported = !!(window.AudioContext || (window as any).webkitAudioContext);
    const streamingSupported = hasMediaRecorder && whisperSupported;
    
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

    console.log('📊 Advanced browser capabilities:', {
      isHttps,
      hasNativeSupport,
      hasMediaDevices,
      hasMediaRecorder,
      whisperSupported,
      advancedVADSupported,
      streamingSupported,
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
        advancedVADSupported,
        streamingSupported,
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
        advancedVADSupported,
        streamingSupported,
        permissionStatus
      };
    }

    return {
      isSupported: advancedVADSupported || hasNativeSupport || whisperSupported,
      reason: advancedVADSupported ? 'Natural speech detection available' : 
             hasNativeSupport ? 'Browser speech recognition available' : 
             whisperSupported ? 'AI transcription available' : 'Limited support',
      canUseServerFallback: hasMediaRecorder,
      hasNativeSupport,
      hasMediaRecorder,
      whisperSupported,
      advancedVADSupported,
      streamingSupported,
      permissionStatus
    };
  }, [whisperTranscription.isInitialized]);

  // Initialize support check
  useEffect(() => {
    const initializeSupportCheck = async () => {
      console.log('🚀 Initializing natural voice recognition support check...');
      try {
        const support = await checkBrowserSupport();
        setSupportStatus(support);
        setIsSupported(support.isSupported);
        console.log('✅ Support check complete:', support);
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
          advancedVADSupported: false,
          streamingSupported: false,
          permissionStatus: 'unknown'
        });
      }
    };

    initializeSupportCheck();
  }, [checkBrowserSupport]);

  // Start natural voice recognition
  const startListening = useCallback(async () => {
    console.log('🎙️ Starting natural voice recognition...');
    
    const support = await checkBrowserSupport();
    setSupportStatus(support);
    
    if (!support.isSupported) {
      const errorMessage = support.reason || 'Voice recognition not supported';
      onError?.(errorMessage);
      toast({
        title: "Voice Recognition Unavailable",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });
      
      streamRef.current = stream;
      
      // Start VAD
      await advancedVAD.startVAD(stream);
      
      // Start streaming or batch transcription based on preference
      if (useStreaming && support.streamingSupported) {
        console.log('🚀 Starting streaming transcription');
        await streamingTranscription.startStreaming(stream);
      } else if (support.whisperSupported) {
        console.log('🚀 Starting Whisper transcription');
        // Whisper will be triggered when speech ends naturally
      } else {
        // Fallback to native speech recognition if available
        if (support.hasNativeSupport) {
          console.log('🚀 Fallback to native speech recognition');
          await startNativeSpeechRecognition();
          return;
        }
      }
      
      // Update state
      setVoiceState(prev => ({
        ...prev,
        isListening: true,
        isProcessing: false,
        partialText: '',
        finalText: '',
        confidence: 0
      }));
      
      console.log('✅ Natural voice recognition started successfully');
      
    } catch (error) {
      console.error('❌ Failed to start voice recognition:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to access microphone';
      onError?.(errorMessage);
      toast({
        title: "Microphone Access Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [checkBrowserSupport, advancedVAD, streamingTranscription, useStreaming, onError]);

  // Start native speech recognition (fallback)
  const startNativeSpeechRecognition = useCallback(async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true; // Enable partial results
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('🎙️ Native speech recognition started');
      setVoiceState(prev => ({ ...prev, isListening: true }));
    };

    recognition.onresult = (event) => {
      let transcript = '';
      let isFinal = false;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        transcript += result[0].transcript;
        if (result.isFinal) {
          isFinal = true;
        }
      }
      
      if (isFinal) {
        console.log('✅ Final speech result:', transcript);
        setVoiceState(prev => ({ 
          ...prev, 
          finalText: transcript, 
          partialText: '',
          confidence: event.results[event.results.length - 1][0].confidence || 0.8
        }));
        onResult(transcript);
      } else {
        console.log('📝 Partial speech result:', transcript);
        setVoiceState(prev => ({ 
          ...prev, 
          partialText: transcript,
          confidence: event.results[event.results.length - 1][0].confidence || 0.5
        }));
        onPartialResult?.(transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Native speech recognition error:', event.error);
      const errorMessage = `Speech recognition error: ${event.error}`;
      onError?.(errorMessage);
      setVoiceState(prev => ({ ...prev, isListening: false }));
    };

    recognition.onend = () => {
      console.log('🔚 Native speech recognition ended');
      setVoiceState(prev => ({ ...prev, isListening: false }));
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onResult, onPartialResult, onError]);

  // Stop voice recognition
  const stopListening = useCallback(async () => {
    console.log('🛑 Stopping natural voice recognition');
    
    // Clear natural stop timer
    if (naturalStopTimerRef.current) {
      clearTimeout(naturalStopTimerRef.current);
      naturalStopTimerRef.current = null;
    }
    
    // Stop VAD
    if (advancedVAD.isActive) {
      advancedVAD.stopVAD();
    }
    
    // Stop streaming transcription
    if (streamingTranscription.isStreaming) {
      const finalResult = await streamingTranscription.stopStreaming();
      if (finalResult) {
        console.log('✅ Final streaming result:', finalResult.text);
        setVoiceState(prev => ({ 
          ...prev, 
          finalText: finalResult.text,
          confidence: finalResult.confidence || 0.8
        }));
        onResult(finalResult.text);
      }
    }
    
    // Stop native recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    
    // Stop media stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Update state
    setVoiceState(prev => ({
      ...prev,
      isListening: false,
      isSpeaking: false,
      isProcessing: false
    }));
    
    console.log('✅ Voice recognition stopped');
  }, [advancedVAD, streamingTranscription, onResult]);

  // Update voice state with VAD data
  useEffect(() => {
    setVoiceState(prev => ({
      ...prev,
      volume: advancedVAD.volume,
      speechDuration: advancedVAD.speechDuration,
      silenceDuration: advancedVAD.silenceDuration
    }));
  }, [advancedVAD.volume, advancedVAD.speechDuration, advancedVAD.silenceDuration]);

  return {
    // State
    ...voiceState,
    isSupported,
    supportStatus,
    
    // Actions
    startListening,
    stopListening,
    checkBrowserSupport,
    
    // Advanced features
    isSpeaking: voiceState.isSpeaking,
    isProcessing: voiceState.isProcessing || streamingTranscription.isProcessing,
    partialText: voiceState.partialText,
    finalText: voiceState.finalText,
    confidence: voiceState.confidence,
    speechDuration: voiceState.speechDuration,
    silenceDuration: voiceState.silenceDuration,
    
    // Legacy compatibility
    audioLevel: voiceState.volume,
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