export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];

  async startRecording(): Promise<MediaStream> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.chunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
      return this.stream;
    } catch (error) {
      throw new Error(`Failed to start recording: ${error}`);
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.chunks, { type: 'audio/webm' });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  async convertToFloat32Array(audioBlob: Blob): Promise<Float32Array> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext({ sampleRate: 16000 });
    }

    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    // Convert to 16kHz mono Float32Array (Whisper expects raw audio data)
    const length = audioBuffer.length;
    
    if (audioBuffer.numberOfChannels === 1) {
      // Create a proper Float32Array by copying data, not using views or set()
      const channelData = audioBuffer.getChannelData(0);
      const result = new Float32Array(length);
      // Copy data manually to ensure proper Float32Array with all prototype methods
      for (let i = 0; i < length; i++) {
        result[i] = channelData[i];
      }
      return result;
    } else {
      // Mix stereo to mono - create proper Float32Array
      const left = audioBuffer.getChannelData(0);
      const right = audioBuffer.getChannelData(1);
      const result = new Float32Array(length);
      for (let i = 0; i < length; i++) {
        result[i] = (left[i] + right[i]) * 0.5;
      }
      return result;
    }
  }

  private floatArrayToWav(floatArray: Float32Array, sampleRate: number): ArrayBuffer {
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
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
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

  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.mediaRecorder) {
      this.mediaRecorder = null;
    }
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.chunks = [];
  }
}