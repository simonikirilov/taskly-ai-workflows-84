import { 
  WhisperTranscriptionResult,
  WhisperConfig,
  AudioInput,
  WhisperStatus,
  WhisperPlatformImplementation
} from './types';
import { detectPlatform, isPlatformSupported } from './utils/platform';
import { WebWhisperImplementation } from './platforms/web';

export class WhisperTranscriber {
  private implementation: WhisperPlatformImplementation;
  private status: WhisperStatus;

  constructor() {
    const platform = detectPlatform();
    
    if (!isPlatformSupported(platform)) {
      throw new Error(`Platform ${platform} is not supported`);
    }

    this.status = {
      isInitialized: false,
      isLoading: false,
      isTranscribing: false,
      platform,
      modelLoaded: false
    };

    // Initialize platform-specific implementation
    switch (platform) {
      case 'web':
        this.implementation = new WebWhisperImplementation();
        break;
      case 'ios':
      case 'android':
      case 'capacitor':
        // TODO: Implement native implementations
        throw new Error('Native platform implementations coming soon');
      case 'electron':
        // TODO: Implement electron implementation
        throw new Error('Electron implementation coming soon');
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  async initialize(): Promise<void> {
    if (this.status.isInitialized || this.status.isLoading) return;

    this.status.isLoading = true;
    this.status.error = undefined;

    try {
      await this.implementation.initialize();
      this.status.isInitialized = true;
      this.status.modelLoaded = this.implementation.isModelLoaded();
    } catch (error) {
      this.status.error = error instanceof Error ? error.message : 'Initialization failed';
      throw error;
    } finally {
      this.status.isLoading = false;
    }
  }

  async transcribe(audio: AudioInput, config?: WhisperConfig): Promise<WhisperTranscriptionResult> {
    if (!this.status.isInitialized) {
      await this.initialize();
    }

    this.status.isTranscribing = true;
    this.status.error = undefined;

    try {
      const result = await this.implementation.transcribe(audio, config);
      return result;
    } catch (error) {
      this.status.error = error instanceof Error ? error.message : 'Transcription failed';
      throw error;
    } finally {
      this.status.isTranscribing = false;
    }
  }

  getStatus(): WhisperStatus {
    return { ...this.status };
  }

  async cleanup(): Promise<void> {
    await this.implementation.cleanup();
    this.status.isInitialized = false;
    this.status.modelLoaded = false;
  }
}

// Export types and utilities
export * from './types';
export { detectPlatform, isPlatformSupported } from './utils/platform';

// Create singleton instance for easy use
export const whisperTranscriber = new WhisperTranscriber();