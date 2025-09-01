import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedRobotProps {
  isListening?: boolean;
  onClick?: () => void;
  className?: string;
}

export function AnimatedRobot({ isListening, onClick, className }: AnimatedRobotProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isSmiling, setIsSmiling] = useState(false);
  const [eyesWide, setEyesWide] = useState(false);

  // Blinking animation every 5-7 seconds
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, Math.random() * 2000 + 5000); // 5-7 seconds

    return () => clearInterval(blinkInterval);
  }, []);

  // Enhanced animations when listening
  useEffect(() => {
    if (isListening) {
      setIsSmiling(true);
      setEyesWide(true);
      const timer = setTimeout(() => {
        setIsSmiling(false);
        setEyesWide(false);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setEyesWide(false);
    }
  }, [isListening]);

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Subtle background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-[400px] aspect-square bg-gradient-radial from-blue-400/15 via-blue-400/8 to-transparent rounded-full blur-3xl opacity-50" />
      </div>
      
      {/* Robot container with enhanced prominence and floating animation */}
      <div 
        className={cn(
          "relative transition-all duration-500 cursor-pointer w-full max-w-[420px] mx-auto",
          "animate-float-slow", // Subtle floating/bobbing motion
          isListening 
            ? "scale-110" 
            : "hover:scale-[1.05]"
        )}
        onClick={onClick}
      >
        <img 
          src="/lovable-uploads/d9e422aa-ea2c-4619-8ac2-3818edd8bcb3.png"
          alt="Taskly AI Assistant"
          className={cn(
            "w-full h-auto object-contain p-0 m-0 max-w-full transition-all duration-300",
            isListening && "brightness-110 drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]",
            isSmiling && "animate-pulse"
          )}
          style={{ 
            filter: isListening 
              ? 'drop-shadow(0 0 25px rgba(59, 130, 246, 0.6)) brightness(1.1)' 
              : 'drop-shadow(0 0 25px rgba(59, 130, 246, 0.4))',
            transform: isListening ? 'rotate(2deg)' : 'rotate(0deg)' // Subtle head tilt when listening
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        
        {/* Fallback Bot icon */}
        <div className="hidden w-full aspect-square bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center max-w-[350px]">
          <Bot className="h-28 w-28 text-white" />
        </div>
        
        {/* Eyes animations overlay */}
        {(isBlinking || eyesWide) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full max-w-[420px] relative">
              {/* Eyes - blinking or wide when listening */}
              <div className={cn(
                "absolute top-[35%] left-[40%] rounded-full transition-all duration-200",
                isBlinking ? "w-2 h-1 bg-background opacity-90" : 
                eyesWide ? "w-4 h-4 bg-primary/20 border-2 border-primary/40" :
                "w-3 h-3 bg-primary/10 border border-primary/20"
              )} />
              <div className={cn(
                "absolute top-[35%] right-[40%] rounded-full transition-all duration-200",
                isBlinking ? "w-2 h-1 bg-background opacity-90" : 
                eyesWide ? "w-4 h-4 bg-primary/20 border-2 border-primary/40" :
                "w-3 h-3 bg-primary/10 border border-primary/20"
              )} />
            </div>
          </div>
        )}
        
        {/* Enhanced listening indicator with pulsing glow */}
        {isListening && (
          <>
            {/* Pulsing glow around robot */}
            <div className="absolute inset-0 animate-pulse">
              <div className="w-full h-full bg-gradient-to-r from-primary/30 via-blue-400/30 to-primary/30 rounded-full blur-xl" />
            </div>
            
            {/* Sound wave indicator */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-1 px-6 py-4 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-full backdrop-blur-md border border-primary/30 shadow-lg">
                <div className="w-2 h-8 bg-primary animate-pulse rounded-full" />
                <div className="w-2 h-6 bg-primary animate-pulse rounded-full" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-10 bg-primary animate-pulse rounded-full" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-6 bg-primary animate-pulse rounded-full" style={{ animationDelay: '0.3s' }} />
                <div className="w-2 h-8 bg-primary animate-pulse rounded-full" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}