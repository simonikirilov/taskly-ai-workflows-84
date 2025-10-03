import { useCallback } from 'react';

interface AudioFeedbackOptions {
  respectSystemMute?: boolean;
}

export function useAudioFeedback({ respectSystemMute = true }: AudioFeedbackOptions = {}) {
  
  const playEarcon = useCallback((type: 'start' | 'stop' | 'success' | 'error') => {
    if (respectSystemMute && !navigator.userActivation?.hasBeenActive) {
      return; // Respect autoplay policies
    }

    // Create audio context for short beeps
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure based on type
    switch (type) {
      case 'start':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        break;
        
      case 'stop':
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        break;
        
      case 'success':
        // Two-tone success sound
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        break;
        
      case 'error':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        break;
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + (type === 'success' ? 0.2 : type === 'error' ? 0.3 : 0.1));
    
    // Cleanup
    setTimeout(() => {
      audioContext.close();
    }, 1000);
  }, [respectSystemMute]);

  const playHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      switch (type) {
        case 'light':
          navigator.vibrate(10);
          break;
        case 'medium':
          navigator.vibrate(25);
          break;
        case 'heavy':
          navigator.vibrate([50, 25, 50]);
          break;
      }
    }
  }, []);

  return {
    playEarcon,
    playHaptic,
  };
}