import { pipeline } from '@huggingface/transformers';
import { 
  WhisperPlatformImplementation, 
  AudioInput, 
  WhisperConfig, 
  WhisperTranscriptionResult 
} from '../types';
import { AudioProcessor } from '../utils/audio';

export class WebWhisperImplementation implements WhisperPlatformImplementation {
  private pipe: any = null;
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
      // Initialize Whisper pipeline with Hugging Face transformers
      this.pipe = await pipeline(
        'automatic-speech-recognition',
        'onnx-community/whisper-base.en',
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
        this.pipe = await pipeline(
          'automatic-speech-recognition',
          'onnx-community/whisper-base.en',
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

    let audioData: ArrayBuffer;

    if (audio.type === 'microphone' && audio.stream) {
      // Handle live microphone input
      const blob = await this.audioProcessor.stopRecording();
      audioData = await this.audioProcessor.convertToWav(blob);
    } else if (audio.data) {
      // Handle file or blob input
      if (audio.data instanceof Blob) {
        audioData = await this.audioProcessor.convertToWav(audio.data);
      } else if (audio.data instanceof ArrayBuffer) {
        audioData = audio.data;
      } else {
        // Float32Array - convert to WAV
        audioData = this.floatArrayToWav(audio.data);
      }
    } else {
      throw new Error('No audio data provided');
    }

    try {
      const result = await this.pipe(audioData, {
        return_timestamps: config?.returnTimestamps ?? true,
        return_word_timestamps: config?.returnWordTimestamps ?? false,
        language: config?.language ?? 'en',
        temperature: config?.temperature ?? 0.0,
        max_new_tokens: config?.maxTokens ?? 128
      });

      return this.formatResult(result);
    } catch (error) {
      throw new Error(`Transcription failed: ${error}`);
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
      language: 'en',
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
    this.pipe = null;
    this.isInitialized = false;
  }
}