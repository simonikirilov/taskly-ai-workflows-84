import { WhisperPlatform } from '../types';

export function detectPlatform(): WhisperPlatform {
  // Check if running in Capacitor
  if (typeof window !== 'undefined' && window.Capacitor) {
    // Check if iOS
    if (window.Capacitor.platform === 'ios') {
      return 'ios';
    }
    // Check if Android
    if (window.Capacitor.platform === 'android') {
      return 'android';
    }
    return 'capacitor';
  }

  // Check if running in Electron
  if (typeof window !== 'undefined' && window.electronAPI) {
    return 'electron';
  }

  // Default to web
  return 'web';
}

export function isPlatformSupported(platform: WhisperPlatform): boolean {
  switch (platform) {
    case 'web':
      return typeof window !== 'undefined' && 'MediaRecorder' in window;
    case 'ios':
    case 'android':
      return typeof window !== 'undefined' && window.Capacitor !== undefined;
    case 'capacitor':
      return typeof window !== 'undefined' && window.Capacitor !== undefined;
    case 'electron':
      return typeof window !== 'undefined' && window.electronAPI !== undefined;
    default:
      return false;
  }
}

// Extend Window interface for platform detection
declare global {
  interface Window {
    Capacitor?: {
      platform: string;
      isNativePlatform(): boolean;
    };
    electronAPI?: any;
  }
}