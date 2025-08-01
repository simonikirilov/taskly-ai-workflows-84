import { useState, useEffect } from 'react';
import { Wifi } from 'lucide-react';

export function ConsciousnessStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Simulate consciousness status
    const interval = setInterval(() => {
      setIsOnline(prev => Math.random() > 0.1 ? true : prev);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-card/50 rounded-xl border border-border/20 backdrop-blur-sm">
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400 animate-pulse' : 'bg-muted'}`} />
      <Wifi className="h-3 w-3 text-muted-foreground" />
      <span className="text-xs font-medium text-muted-foreground">
        {isOnline ? 'Consciousness Online' : 'Connecting...'}
      </span>
    </div>
  );
}