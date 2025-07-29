import { useEffect, useState } from 'react';
import { Bot } from 'lucide-react';

interface LaunchAnimationProps {
  onComplete: () => void;
}

export function LaunchAnimation({ onComplete }: LaunchAnimationProps) {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(onComplete, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Animated Robot */}
        <div className={`relative transition-all duration-1000 ${isAnimating ? 'scale-100 opacity-100' : 'scale-110 opacity-0'}`}>
          <div className="absolute inset-0 bg-[var(--gradient-primary)] rounded-full opacity-30 animate-pulse" />
          <div className="relative h-24 w-24 mx-auto bg-[var(--gradient-primary)] rounded-full flex items-center justify-center">
            <Bot className="h-12 w-12 text-white" />
          </div>
        </div>

        {/* Taskly Logo */}
        <div className={`transition-all duration-1000 delay-500 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Taskly
          </h1>
          <p className="text-sm text-muted-foreground mt-2">AI Assistant Coming Online...</p>
        </div>

        {/* Loading Animation */}
        <div className={`transition-all duration-1000 delay-1000 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex space-x-1 justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
}