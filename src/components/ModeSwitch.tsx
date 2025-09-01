import { useState } from 'react';
import { Mic, Keyboard } from 'lucide-react';

interface ModeSwitchProps {
  defaultMode?: 'speaking' | 'typing';
  onModeChange: (mode: 'speaking' | 'typing') => void;
}

export function ModeSwitch({ defaultMode = 'speaking', onModeChange }: ModeSwitchProps) {
  const [isSpeakingMode, setIsSpeakingMode] = useState(defaultMode === 'speaking');

  const handleIconClick = (mode: 'speaking' | 'typing') => {
    const newMode = mode;
    setIsSpeakingMode(mode === 'speaking');
    onModeChange(newMode);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-card/50 backdrop-blur-sm rounded-xl border border-border/30 shadow-sm">
      <button
        onClick={() => handleIconClick('typing')}
        className={`flex items-center gap-2 p-1 rounded-lg transition-colors cursor-pointer ${!isSpeakingMode ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
      >
        <Keyboard className="h-4 w-4" />
      </button>
      
      <span className="text-muted-foreground">/</span>
      
      <button
        onClick={() => handleIconClick('speaking')}
        className={`flex items-center gap-2 p-1 rounded-lg transition-colors cursor-pointer ${isSpeakingMode ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
      >
        <Mic className="h-4 w-4" />
      </button>
    </div>
  );
}