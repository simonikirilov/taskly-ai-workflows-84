import { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedRobotProps {
  isListening?: boolean;
  isExpanded?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  state?: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
}

export function AnimatedRobot({ 
  isListening, 
  isExpanded, 
  onClick, 
  className, 
  children,
  state = 'idle' 
}: AnimatedRobotProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isSmiling, setIsSmiling] = useState(false);
  const [eyesWide, setEyesWide] = useState(false);
  const [isShaking, setIsShaking] = useState(false);

  // Natural blinking every 5-7 seconds
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (state === 'idle' || state === 'listening') {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 150);
      }
    }, Math.random() * 2000 + 5000); // 5-7 seconds

    return () => clearInterval(blinkInterval);
  }, [state]);

  // State-based animations
  useEffect(() => {
    switch (state) {
      case 'listening':
        setIsSmiling(false);
        setEyesWide(true);
        setIsShaking(false);
        break;
      case 'thinking':
        setIsSmiling(false);
        setEyesWide(false);
        setIsShaking(false);
        break;
      case 'speaking':
        setIsSmiling(true);
        setEyesWide(false);
        setIsShaking(false);
        setTimeout(() => setIsSmiling(false), 1000);
        break;
      case 'error':
        setIsSmiling(false);
        setEyesWide(false);
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 400);
        break;
      default: // idle
        setIsSmiling(false);
        setEyesWide(false);
        setIsShaking(false);
        break;
    }
  }, [state]);

  const getScaleClass = () => {
    if (isExpanded) return "scale-[1.4]";
    if (state === 'listening') return "scale-[1.15] hover:scale-[1.2]";
    if (state === 'thinking') return "scale-[1.05]";
    return "hover:scale-[1.05]";
  };

  const getFilterStyle = () => {
    if (isExpanded) {
      return 'drop-shadow(0 0 35px rgba(59, 130, 246, 0.8)) brightness(1.15)';
    }
    if (state === 'listening') {
      return 'drop-shadow(0 0 25px rgba(59, 130, 246, 0.7)) brightness(1.1)';
    }
    if (state === 'speaking') {
      return 'drop-shadow(0 0 20px rgba(34, 197, 94, 0.6)) brightness(1.05)';
    }
    if (state === 'error') {
      return 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.6)) brightness(0.9)';
    }
    return 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.4))';
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Enhanced background glow */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={cn(
          "w-full max-w-[400px] aspect-square rounded-full blur-3xl transition-all duration-500",
          state === 'listening' && "bg-gradient-radial from-blue-400/25 via-blue-400/15 to-transparent opacity-80",
          state === 'speaking' && "bg-gradient-radial from-green-400/25 via-green-400/15 to-transparent opacity-70",
          state === 'error' && "bg-gradient-radial from-red-400/25 via-red-400/15 to-transparent opacity-70",
          (state === 'idle' || state === 'thinking') && "bg-gradient-radial from-blue-400/15 via-blue-400/8 to-transparent opacity-50",
          isExpanded && "opacity-90"
        )} />
      </div>
      
      {/* Focus ring for listening state */}
      {state === 'listening' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-[450px] aspect-square border-2 border-primary/30 rounded-full animate-pulse" />
        </div>
      )}
      
      {/* Robot container with enhanced animations */}
      <div 
        className={cn(
          "relative transition-all duration-200 cursor-pointer w-full max-w-[420px] mx-auto",
          "animate-[float_3s_ease-in-out_infinite]", // Breathing/floating motion
          getScaleClass(),
          state === 'thinking' && "animate-[float_3s_ease-in-out_infinite,pulse_1s_ease-in-out_infinite]",
          isShaking && "animate-[shake_0.12s_ease-in-out_3]"
        )}
        onClick={onClick}
        style={{
          transform: state === 'thinking' ? 'rotate(3deg)' : 'rotate(0deg)',
          transition: 'transform 200ms ease-out, scale 200ms spring(1, 0.5, 0.8, 1.2)'
        }}
      >
        <img 
          src="/lovable-uploads/d9e422aa-ea2c-4619-8ac2-3818edd8bcb3.png"
          alt="Taskly AI Assistant"
          className={cn(
            "w-full h-auto object-contain p-0 m-0 max-w-full transition-all duration-200",
            isSmiling && "animate-pulse"
          )}
          style={{ 
            filter: getFilterStyle()
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
        
        {/* Enhanced eyes animations overlay */}
        {(isBlinking || eyesWide || state === 'thinking') && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-full max-w-[420px] relative">
              {/* Left eye */}
              <div className={cn(
                "absolute top-[35%] left-[40%] rounded-full transition-all duration-150",
                isBlinking ? "w-3 h-1 bg-background opacity-90" : 
                eyesWide ? "w-5 h-5 bg-primary/25 border-2 border-primary/50 animate-pulse" :
                state === 'thinking' ? "w-3 h-3 bg-primary/20 border border-primary/30 animate-pulse" :
                "w-3 h-3 bg-primary/10 border border-primary/20"
              )} />
              {/* Right eye */}
              <div className={cn(
                "absolute top-[35%] right-[40%] rounded-full transition-all duration-150",
                isBlinking ? "w-3 h-1 bg-background opacity-90" : 
                eyesWide ? "w-5 h-5 bg-primary/25 border-2 border-primary/50 animate-pulse" :
                state === 'thinking' ? "w-3 h-3 bg-primary/20 border border-primary/30 animate-pulse" :
                "w-3 h-3 bg-primary/10 border border-primary/20"
              )} />
            </div>
          </div>
        )}
        
        {/* Enhanced listening indicator */}
        {state === 'listening' && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-1 px-6 py-3 bg-primary/30 rounded-full backdrop-blur-sm border border-primary/30 shadow-lg">
              <div className="w-2 h-8 bg-primary animate-pulse rounded-full" />
              <div className="w-2 h-8 bg-primary animate-pulse rounded-full" style={{ animationDelay: '0.15s' }} />
              <div className="w-2 h-8 bg-primary animate-pulse rounded-full" style={{ animationDelay: '0.3s' }} />
              <div className="w-2 h-8 bg-primary animate-pulse rounded-full" style={{ animationDelay: '0.45s' }} />
            </div>
          </div>
        )}
        
        {/* Thinking indicator */}
        {state === 'thinking' && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="flex gap-1 px-4 py-2 bg-secondary/30 rounded-full backdrop-blur-sm border border-secondary/30">
              <div className="w-1.5 h-1.5 bg-secondary animate-bounce rounded-full" />
              <div className="w-1.5 h-1.5 bg-secondary animate-bounce rounded-full" style={{ animationDelay: '0.1s' }} />
              <div className="w-1.5 h-1.5 bg-secondary animate-bounce rounded-full" style={{ animationDelay: '0.2s' }} />
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