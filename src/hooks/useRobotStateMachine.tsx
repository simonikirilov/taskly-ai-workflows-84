import { useState, useCallback, useEffect } from 'react';

export type RobotState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

interface RobotStateMachineOptions {
  onStateChange?: (state: RobotState) => void;
  silenceTimeout?: number; // milliseconds
}

export function useRobotStateMachine({ 
  onStateChange, 
  silenceTimeout = 2500 
}: RobotStateMachineOptions = {}) {
  const [state, setState] = useState<RobotState>('idle');
  const [silenceTimer, setSilenceTimer] = useState<NodeJS.Timeout | null>(null);

  const changeState = useCallback((newState: RobotState) => {
    setState(newState);
    onStateChange?.(newState);
    
    // Clear any existing silence timer when state changes
    if (silenceTimer) {
      clearTimeout(silenceTimer);
      setSilenceTimer(null);
    }
  }, [onStateChange, silenceTimer]);

  const startListening = useCallback(() => {
    changeState('listening');
    
    // Start silence detection timer
    const timer = setTimeout(() => {
      if (state === 'listening') {
        changeState('thinking'); // Will auto-transition to idle
        setTimeout(() => changeState('idle'), 500);
      }
    }, silenceTimeout);
    
    setSilenceTimer(timer);
  }, [changeState, silenceTimeout, state]);

  const stopListening = useCallback(() => {
    changeState('thinking');
    // Auto-transition to idle after a brief moment
    setTimeout(() => changeState('idle'), 500);
  }, [changeState]);

  const startSpeaking = useCallback(() => {
    changeState('speaking');
  }, [changeState]);

  const finishSpeaking = useCallback(() => {
    changeState('idle');
  }, [changeState]);

  const setError = useCallback(() => {
    changeState('error');
    // Auto-transition back to idle after error animation
    setTimeout(() => changeState('idle'), 500);
  }, [changeState]);

  const reset = useCallback(() => {
    changeState('idle');
  }, [changeState]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
    };
  }, [silenceTimer]);

  return {
    state,
    startListening,
    stopListening,
    startSpeaking,
    finishSpeaking,
    setError,
    reset,
    isIdle: state === 'idle',
    isListening: state === 'listening',
    isThinking: state === 'thinking',
    isSpeaking: state === 'speaking',
    isError: state === 'error',
  };
}