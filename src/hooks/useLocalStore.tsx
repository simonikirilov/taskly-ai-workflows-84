import { useState, useEffect } from 'react';

interface LocalStoreState {
  // Appearance
  darkMode: boolean;
  
  // Voice & AI
  autoProcessVoice: boolean;
  assistantTone: 'friendly' | 'neutral' | 'concise';
  defaultInput: 'speak' | 'type';
  
  // Notifications
  taskCompletionNotifications: boolean;
  reminders: boolean;
  
  // Privacy
  microphonePermission: 'granted' | 'denied' | 'ask';
  
  // Security
  twoFactorAuth: boolean;
  appLock: 'off' | '1min' | '5min';
}

const defaultState: LocalStoreState = {
  darkMode: true,
  autoProcessVoice: true,
  assistantTone: 'friendly',
  defaultInput: 'speak',
  taskCompletionNotifications: true,
  reminders: true,
  microphonePermission: 'ask',
  twoFactorAuth: false,
  appLock: 'off',
};

export const useLocalStore = () => {
  const [state, setState] = useState<LocalStoreState>(() => {
    const stored = localStorage.getItem('taskly-local-store');
    if (stored) {
      try {
        return { ...defaultState, ...JSON.parse(stored) };
      } catch {
        return defaultState;
      }
    }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem('taskly-local-store', JSON.stringify(state));
  }, [state]);

  const updateState = (updates: Partial<LocalStoreState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  return {
    state,
    updateState,
  };
};
