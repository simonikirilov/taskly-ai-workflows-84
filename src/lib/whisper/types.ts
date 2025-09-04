export interface WhisperTranscriptionResult {
  text: string;
  segments: WhisperSegment[];
  language?: string;
  confidence?: number;
}

export interface WhisperSegment {
  id: number;
  start: number;
  end: number;
  text: string;
  words?: WhisperWord[];
  confidence?: number;
}

export interface WhisperWord {
  start: number;
  end: number;
  word: string;
  confidence?: number;
}

export interface WhisperConfig {
  model?: string;
  language?: string;
  temperature?: number;
  maxTokens?: number;
  returnTimestamps?: boolean;
  returnWordTimestamps?: boolean;
}

export interface AudioInput {
  type: 'microphone' | 'file';
  data?: Blob | ArrayBuffer | Float32Array;
  stream?: MediaStream;
}

export type WhisperPlatform = 'web' | 'ios' | 'android' | 'capacitor' | 'electron';

export interface WhisperPlatformImplementation {
  initialize(): Promise<void>;
  transcribe(audio: AudioInput, config?: WhisperConfig): Promise<WhisperTranscriptionResult>;
  isModelLoaded(): boolean;
  cleanup(): Promise<void>;
}

export interface WhisperStatus {
  isInitialized: boolean;
  isLoading: boolean;
  isTranscribing: boolean;
  platform: WhisperPlatform;
  modelLoaded: boolean;
  error?: string;
}