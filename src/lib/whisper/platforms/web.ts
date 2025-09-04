import { pipeline } from '@huggingface/transformers';
import { 
  WhisperPlatformImplementation, 
  AudioInput, 
  WhisperConfig, 
  WhisperTranscriptionResult 
} from '../types';
import { AudioProcessor } from '../utils/audio';

export class WebWhisperImplementation implements WhisperPlatformImplementation {
  private whisperPipeline: any = null;
  private audioProcessor: AudioProcessor;
  private isInitialized = false;
  private isLoading = false;

  constructor() {
    this.audioProcessor = new AudioProcessor();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized || this.isLoading) return;
    
    this.isLoading = true;
    try {
      // Initialize multilingual Whisper pipeline with Hugging Face transformers
      this.whisperPipeline = await pipeline(
        'automatic-speech-recognition',
        'onnx-community/whisper-base',
        { 
          device: 'webgpu',
          // Fallback to CPU if WebGPU not available
          dtype: 'fp32'
        }
      );
      
      this.isInitialized = true;
    } catch (error) {
      // Fallback to CPU if WebGPU fails
      try {
        this.whisperPipeline = await pipeline(
          'automatic-speech-recognition',
          'onnx-community/whisper-base',
          { device: 'cpu' }
        );
        this.isInitialized = true;
      } catch (fallbackError) {
        throw new Error(`Failed to initialize Whisper: ${fallbackError}`);
      }
    } finally {
      this.isLoading = false;
    }
  }

  async transcribe(audio: AudioInput, config?: WhisperConfig): Promise<WhisperTranscriptionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    let audioData: Float32Array;

    console.log('🎤 Audio input type:', audio.type, 'has data:', !!audio.data, 'has stream:', !!audio.stream);

    if (audio.type === 'microphone' && audio.stream) {
      // Handle live microphone input
      const blob = await this.audioProcessor.stopRecording();
      console.log('🎤 Got recording blob:', blob.type, blob.size, 'bytes');
      audioData = await this.audioProcessor.convertToFloat32Array(blob);
      console.log('🎤 Converted to Float32Array:', audioData.constructor.name, audioData.length, 'samples');
    } else if (audio.data) {
      // Handle file or blob input
      if (audio.data instanceof Blob) {
        console.log('🎤 Processing Blob:', audio.data.type, audio.data.size, 'bytes');
        audioData = await this.audioProcessor.convertToFloat32Array(audio.data);
        console.log('🎤 Converted Blob to Float32Array:', audioData.constructor.name, audioData.length, 'samples');
      } else if (audio.data instanceof Float32Array) {
        console.log('🎤 Using provided Float32Array:', audio.data.length, 'samples');
        audioData = audio.data;
      } else if (audio.data instanceof ArrayBuffer) {
        console.log('🎤 Converting ArrayBuffer:', audio.data.byteLength, 'bytes');
        // Convert ArrayBuffer to Float32Array (assume 16-bit PCM)
        const int16Array = new Int16Array(audio.data);
        audioData = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
          audioData[i] = int16Array[i] / 32768.0; // Convert to -1.0 to 1.0 range
        }
        console.log('🎤 Converted ArrayBuffer to Float32Array:', audioData.length, 'samples');
      } else {
        console.error('🎤 Unsupported audio data type:', typeof audio.data, (audio.data as any)?.constructor?.name);
        throw new Error('Unsupported audio data format');
      }
    } else {
      console.error('🎤 No audio data provided');
      throw new Error('No audio data provided');
    }

    console.log('🎤 About to call pipeline with:', audioData.constructor.name, audioData.length, 'samples');
    console.log('🎤 Sample rate check - first few values:', Array.from(audioData.slice(0, 5)));

    try {
      // Validate that we have a valid Float32Array with proper methods
      if (!(audioData instanceof Float32Array)) {
        throw new Error('Audio data must be a Float32Array');
      }

      // Ensure we have sufficient audio data
      if (audioData.length === 0) {
        throw new Error('Audio data is empty');
      }

      // Verify the typed array has required methods to avoid "subarray is not a function" error
      if (typeof audioData.subarray !== 'function') {
        console.warn('🎤 Audio data missing subarray method, creating new Float32Array');
        // Only create new Float32Array if the original lacks required methods
        audioData = new Float32Array(audioData);
      }

      // Create proper audio object for Hugging Face transformers
      const audioObject = {
        array: audioData,
        sampling_rate: 16000
      };

      console.log('🎤 Calling Whisper pipeline with audio object:', {
        arrayType: audioObject.array.constructor.name,
        arrayLength: audioObject.array.length,
        samplingRate: audioObject.sampling_rate,
        isProperArray: audioObject.array.constructor === Float32Array,
        duration: `${(audioObject.array.length / audioObject.sampling_rate).toFixed(2)}s`
      });

      // Configure for multilingual Whisper model (whisper-base)
      const pipelineConfig = {
        return_timestamps: config?.returnTimestamps ?? true,
        chunk_length_s: 30, // Process in 30-second chunks
        stride_length_s: 5,  // 5-second stride
        is_multilingual: true, // Required for whisper-base multilingual model
        // Auto-detect language unless specifically provided
        ...(config?.language ? { language: config.language } : {})
      };

      console.log('🎤 Multilingual Whisper config:', pipelineConfig);

      // Call Hugging Face Transformers pipeline (NOT a stream pipe operation)
      // This is a function call to the ML pipeline, not stream piping
      const result = await this.whisperPipeline(audioObject, pipelineConfig);

      console.log('🎤 Transcription result:', result);
      return this.formatResult(result);
    } catch (error) {
      console.error('🎤 Transcription error:', error);
      console.error('🎤 Audio data details:', {
        type: typeof audioData,
        constructor: audioData?.constructor?.name,
        isFloat32Array: audioData instanceof Float32Array,
        length: audioData?.length
      });
      throw new Error(`Safe transcription failed: ${error instanceof Error ? error.message : error}`);
    }
  }

  private formatResult(result: any): WhisperTranscriptionResult {
    const segments = result.chunks?.map((chunk: any, index: number) => ({
      id: index,
      start: chunk.timestamp?.[0] ?? 0,
      end: chunk.timestamp?.[1] ?? 0,
      text: chunk.text,
      confidence: chunk.score
    })) ?? [];

    return {
      text: result.text || '',
      segments,
      language: result.language || 'auto-detected',
      confidence: result.score
    };
  }

  private floatArrayToWav(floatArray: Float32Array): ArrayBuffer {
    const length = floatArray.length;
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 16000, true);
    view.setUint32(28, 16000 * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);

    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, floatArray[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }

    return buffer;
  }

  isModelLoaded(): boolean {
    return this.isInitialized;
  }

  async cleanup(): Promise<void> {
    this.audioProcessor.cleanup();
    this.whisperPipeline = null;
    this.isInitialized = false;
  }
}