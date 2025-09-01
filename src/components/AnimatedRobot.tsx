import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedRobotProps {
  isListening?: boolean;
  isExpanded?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function AnimatedRobot({ isListening, isExpanded, onClick, className, children }: AnimatedRobotProps) {
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
      {/* Enhanced background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={cn(
          "w-full max-w-[400px] aspect-square bg-gradient-radial from-blue-400/15 via-blue-400/8 to-transparent rounded-full blur-3xl transition-opacity duration-500",
          isExpanded ? "opacity-80" : "opacity-50"
        )} />
      </div>
      
      {/* Robot container with enhanced prominence and floating animation */}
      <div 
        className={cn(
          "relative transition-all duration-500 cursor-pointer w-full max-w-[420px] mx-auto",
          "animate-float-slow", // Subtle floating/bobbing motion
          isExpanded 
            ? "scale-140 z-50" 
            : isListening 
              ? "scale-110" 
              : "hover:scale-[1.05]"
        )}
        onClick={onClick}
      >
        <img 
          src="/lovable-uploads/d9e422aa-ea2c-4619-8ac2-3818edd8bcb3.png"
          alt="Taskly AI Assistant"
          className={cn(
            "w-full h-auto object-contain p-0 m-0 max-w-full transition-all duration-500",
            isListening && "brightness-110 drop-shadow-[0_0_25px_rgba(59,130,246,0.6)]",
            isExpanded && "brightness-115 drop-shadow-[0_0_35px_rgba(59,130,246,0.8)]",
            isSmiling && "animate-pulse"
          )}
          style={{ 
            filter: isExpanded 
              ? 'drop-shadow(0 0 35px rgba(59, 130, 246, 0.8)) brightness(1.15)'
              : isListening 
                ? 'drop-shadow(0 0 25px rgba(59, 130, 246, 0.6)) brightness(1.1)' 
                : 'drop-shadow(0 0 25px rgba(59, 130, 246, 0.4))',
            transform: isExpanded ? 'rotate(0deg)' : isListening ? 'rotate(2deg)' : 'rotate(0deg)'
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
        
        {/* Listening indicator - enhanced visibility */}
        {isListening && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-1 px-5 py-3 bg-primary/25 rounded-full backdrop-blur-sm border border-primary/20">
              <div className="w-2 h-7 bg-primary animate-pulse rounded-full" />
              <div className="w-2 h-7 bg-primary animate-pulse rounded-full" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-7 bg-primary animate-pulse rounded-full" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        
        {/* Action overlay when expanded */}
        {isExpanded && children && (
          <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 z-60">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}