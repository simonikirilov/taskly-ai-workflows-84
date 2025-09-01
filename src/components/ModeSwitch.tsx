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
    <div className="flex items-center gap-3 p-4 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/30 shadow-lg">
      <div className="flex items-center gap-2">
        <Keyboard className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <Switch
        id="mode-switch"
        checked={isSpeakingMode}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-primary"
      />
      
      <div className="flex items-center gap-2">
        <Label htmlFor="mode-switch" className="text-sm font-medium">
          Speaking
        </Label>
        <Mic className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}