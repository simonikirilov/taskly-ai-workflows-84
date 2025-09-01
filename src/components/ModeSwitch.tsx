import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mic, Keyboard } from 'lucide-react';

interface ModeSwitchProps {
  defaultMode?: 'speaking' | 'typing';
  onModeChange: (mode: 'speaking' | 'typing') => void;
}

export function ModeSwitch({ defaultMode = 'speaking', onModeChange }: ModeSwitchProps) {
  const [isSpeakingMode, setIsSpeakingMode] = useState(defaultMode === 'speaking');

  const handleToggle = (checked: boolean) => {
    const newMode = checked ? 'speaking' : 'typing';
    setIsSpeakingMode(checked);
    onModeChange(newMode);
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-card/50 backdrop-blur-sm rounded-xl border border-border/30 shadow-sm">
      <div className={`flex items-center gap-2 p-1 rounded-lg transition-colors ${!isSpeakingMode ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>
        <Keyboard className="h-4 w-4" />
      </div>
      
      <Switch
        id="mode-switch"
        checked={isSpeakingMode}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-primary"
      />
      
      <div className={`flex items-center gap-2 p-1 rounded-lg transition-colors ${isSpeakingMode ? 'bg-primary/20 text-primary' : 'text-muted-foreground'}`}>
        <Mic className="h-4 w-4" />
      </div>
    </div>
  );
}