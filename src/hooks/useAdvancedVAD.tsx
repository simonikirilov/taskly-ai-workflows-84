import { useState, useCallback, useRef, useEffect } from 'react';

interface AdvancedVADOptions {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onVolumeChange?: (volume: number) => void;
  sensitivityLevel?: number; // 1-5, 3 is default
  adaptiveThreshold?: boolean;
}

interface VADState {
  isSpeaking: boolean;
  volume: number;
  confidence: number;
  backgroundNoise: number;
  speechDuration: number;
  silenceDuration: number;
}

export function useAdvancedVAD(options: AdvancedVADOptions = {}) {
  const [vadState, setVADState] = useState<VADState>({
    isSpeaking: false,
    volume: 0,
    confidence: 0,
    backgroundNoise: 0,
    speechDuration: 0,
    silenceDuration: 0,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Advanced VAD parameters
  const backgroundNoiseRef = useRef<number[]>([]);
  const speechHistoryRef = useRef<number[]>([]);
  const lastSpeechTimeRef = useRef<number>(0);
  const speechStartTimeRef = useRef<number>(0);
  const silenceStartTimeRef = useRef<number>(0);
  
  // Adaptive thresholds
  const adaptiveThresholdRef = useRef<number>(0.02);
  const noiseFloorRef = useRef<number>(0.01);

  const { sensitivityLevel = 3, adaptiveThreshold = true } = options;

  // Calculate dynamic speech threshold based on background noise
  const calculateSpeechThreshold = useCallback(() => {
    const baseThreshold = 0.01 + (5 - sensitivityLevel) * 0.005;
    const noiseCompensation = Math.max(noiseFloorRef.current * 2, 0.005);
    return Math.min(baseThreshold + noiseCompensation, 0.08);
  }, [sensitivityLevel]);

  // Advanced spectral analysis for speech detection
  const analyzeAudioSpectrum = useCallback((dataArray: Uint8Array) => {
    const frequencyBins = dataArray.length;
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    
    // Speech typically occurs in 300-3400 Hz range
    const speechFreqStart = Math.floor((300 / sampleRate) * frequencyBins * 2);
    const speechFreqEnd = Math.floor((3400 / sampleRate) * frequencyBins * 2);
    
    let speechEnergy = 0;
    let totalEnergy = 0;
    let highFreqEnergy = 0;
    
    for (let i = 0; i < frequencyBins; i++) {
      const value = dataArray[i] / 255.0;
      totalEnergy += value * value;
      
      if (i >= speechFreqStart && i <= speechFreqEnd) {
        speechEnergy += value * value;
      }
      
      if (i > speechFreqEnd) {
        highFreqEnergy += value * value;
      }
    }
    
    const speechRatio = speechEnergy / Math.max(totalEnergy, 0.001);
    const spectralCentroid = speechEnergy / Math.max(speechFreqEnd - speechFreqStart, 1);
    
    return {
      speechEnergy,
      totalEnergy,
      speechRatio,
      spectralCentroid,
      highFreqEnergy
    };
  }, []);

  // Update background noise estimation
  const updateBackgroundNoise = useCallback((volume: number) => {
    backgroundNoiseRef.current.push(volume);
    if (backgroundNoiseRef.current.length > 100) {
      backgroundNoiseRef.current.shift();
    }
    
    // Calculate noise floor (median of lowest 20% of samples)
    const sorted = [...backgroundNoiseRef.current].sort((a, b) => a - b);
    const noiseFloorSamples = sorted.slice(0, Math.floor(sorted.length * 0.2));
    noiseFloorRef.current = noiseFloorSamples.reduce((a, b) => a + b, 0) / noiseFloorSamples.length;
    
    if (adaptiveThreshold) {
      adaptiveThresholdRef.current = calculateSpeechThreshold();
    }
  }, [adaptiveThreshold, calculateSpeechThreshold]);

  // Detect natural speech patterns
  const detectSpeechPattern = useCallback((volume: number, spectralData: any) => {
    const now = Date.now();
    const threshold = adaptiveThreshold ? adaptiveThresholdRef.current : calculateSpeechThreshold();
    
    // Multi-criteria speech detection
    const volumeTest = volume > threshold;
    const spectralTest = spectralData.speechRatio > 0.3;
    const energyTest = spectralData.speechEnergy > noiseFloorRef.current * 3;
    
    const isSpeechDetected = volumeTest && (spectralTest || energyTest);
    
    // Update speech history for pattern analysis
    speechHistoryRef.current.push(isSpeechDetected ? 1 : 0);
    if (speechHistoryRef.current.length > 20) {
      speechHistoryRef.current.shift();
    }
    
    // Calculate confidence based on recent history
    const recentSpeechRatio = speechHistoryRef.current.reduce((a, b) => a + b, 0) / speechHistoryRef.current.length;
    const confidence = Math.min(recentSpeechRatio * 2, 1);
    
    return {
      isSpeechDetected,
      confidence,
      threshold
    };
  }, [adaptiveThreshold, calculateSpeechThreshold]);

  // Main audio analysis loop
  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    const timeArray = new Uint8Array(analyserRef.current.fftSize);
    
    analyserRef.current.getByteFrequencyData(dataArray);
    analyserRef.current.getByteTimeDomainData(timeArray);

    // Calculate RMS volume
    let sum = 0;
    for (let i = 0; i < timeArray.length; i++) {
      const sample = (timeArray[i] - 128) / 128;
      sum += sample * sample;
    }
    const volume = Math.sqrt(sum / timeArray.length);

    // Spectral analysis
    const spectralData = analyzeAudioSpectrum(dataArray);
    
    // Speech pattern detection
    const speechDetection = detectSpeechPattern(volume, spectralData);
    
    const now = Date.now();
    
    // Update VAD state
    setVADState(prevState => {
      const wasSpeaking = prevState.isSpeaking;
      const isSpeaking = speechDetection.isSpeechDetected;
      
      let speechDuration = prevState.speechDuration;
      let silenceDuration = prevState.silenceDuration;
      
      if (isSpeaking && !wasSpeaking) {
        // Speech started
        speechStartTimeRef.current = now;
        silenceDuration = 0;
        options.onSpeechStart?.();
      } else if (!isSpeaking && wasSpeaking) {
        // Speech ended
        silenceStartTimeRef.current = now;
        speechDuration = 0;
        options.onSpeechEnd?.();
      } else if (isSpeaking) {
        // Continuing speech
        speechDuration = now - speechStartTimeRef.current;
      } else {
        // Continuing silence
        silenceDuration = now - silenceStartTimeRef.current;
      }
      
      return {
        isSpeaking,
        volume,
        confidence: speechDetection.confidence,
        backgroundNoise: noiseFloorRef.current,
        speechDuration,
        silenceDuration,
      };
    });

    // Update background noise when not speaking
    if (!speechDetection.isSpeechDetected) {
      updateBackgroundNoise(volume);
    }
    
    options.onVolumeChange?.(volume);
    
    animationFrameRef.current = requestAnimationFrame(analyzeAudio);
  }, [analyzeAudioSpectrum, detectSpeechPattern, updateBackgroundNoise, options]);

  const startVAD = useCallback(async (stream: MediaStream) => {
    try {
      // Create audio context
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create analyser
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.3;
      
      // Connect stream to analyser
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      
      // Start analysis
      analyzeAudio();
      
    } catch (error) {
      console.error('Failed to start VAD:', error);
      throw error;
    }
  }, [analyzeAudio]);

  const stopVAD = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    analyserRef.current = null;
    
    setVADState({
      isSpeaking: false,
      volume: 0,
      confidence: 0,
      backgroundNoise: 0,
      speechDuration: 0,
      silenceDuration: 0,
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVAD();
    };
  }, [stopVAD]);

  return {
    vadState,
    startVAD,
    stopVAD,
    isActive: !!audioContextRef.current,
    // Helper getters
    isSpeaking: vadState.isSpeaking,
    volume: vadState.volume,
    confidence: vadState.confidence,
    speechDuration: vadState.speechDuration,
    silenceDuration: vadState.silenceDuration,
    backgroundNoise: vadState.backgroundNoise,
  };
}