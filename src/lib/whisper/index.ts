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
    if (this.status.isInitialized || this.status.isLoading) {
      console.log('🎤 WhisperTranscriber already initialized or loading, skipping...');
      return;
    }

    console.log('🎤 WhisperTranscriber starting initialization...');
    this.status.isLoading = true;
    this.status.error = undefined;

    try {
      // Add timeout to prevent infinite loading
      const initPromise = this.implementation.initialize();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Whisper initialization timeout after 60 seconds')), 60000);
      });

      await Promise.race([initPromise, timeoutPromise]);
      
      this.status.isInitialized = true;
      this.status.modelLoaded = this.implementation.isModelLoaded();
      console.log('🎤 WhisperTranscriber initialization complete:', {
        isInitialized: this.status.isInitialized,
        modelLoaded: this.status.modelLoaded,
        platform: this.status.platform
      });
    } catch (error) {
      console.error('🎤 WhisperTranscriber initialization failed:', error);
      this.status.error = error instanceof Error ? error.message : 'Initialization failed';
      throw error;
    } finally {
      this.status.isLoading = false;
      console.log('🎤 WhisperTranscriber isLoading set to false');
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
    const currentStatus = { ...this.status };
    console.log('🎤 Getting WhisperTranscriber status:', currentStatus);
    return currentStatus;
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