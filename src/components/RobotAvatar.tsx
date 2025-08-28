import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface RobotAvatarProps {
  className?: string;
  isListening?: boolean;
  isRecording?: boolean;
}

export function RobotAvatar({ className, isListening, isRecording }: RobotAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [expression, setExpression] = useState<'neutral' | 'smile' | 'talk'>('neutral');

  // Random blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 2000 + Math.random() * 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Expression changes based on interaction
  useEffect(() => {
    if (isListening || isRecording) {
      setExpression('talk');
    } else {
      setExpression('smile');
    }
  }, [isListening, isRecording]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative w-32 h-32 mx-auto">
        {/* Robot Head */}
        <div className={cn(
          "w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 backdrop-blur-sm transition-all duration-300",
          (isListening || isRecording) && "animate-pulse",
          "hover:scale-105 cursor-pointer float"
        )}>
          {/* Eyes */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex gap-4">
            <div className={cn(
              "w-3 h-3 bg-primary rounded-full transition-all duration-150",
              isBlinking && "h-0.5",
              expression === 'smile' && "bg-primary/80"
            )} />
            <div className={cn(
              "w-3 h-3 bg-primary rounded-full transition-all duration-150",
              isBlinking && "h-0.5",
              expression === 'smile' && "bg-primary/80"
            )} />
          </div>

          {/* Mouth */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            {expression === 'neutral' && (
              <div className="w-6 h-0.5 bg-primary/60 rounded-full" />
            )}
            {expression === 'smile' && (
              <div className="w-8 h-4 border-2 border-primary/80 border-t-0 rounded-b-full" />
            )}
            {expression === 'talk' && (
              <div className={cn(
                "w-6 h-6 bg-primary/20 border-2 border-primary/60 rounded-full",
                (isListening || isRecording) && "animate-pulse"
              )} />
            )}
          </div>

          {/* Activity Indicator */}
          {(isListening || isRecording) && (
            <div className="absolute -inset-2 rounded-full border-2 border-primary/50 animate-ping" />
          )}
        </div>

        {/* Status Text */}
        {isListening && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-primary font-medium animate-pulse">
            Listening...
          </div>
        )}
        {isRecording && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-destructive font-medium animate-pulse">
            Recording...
          </div>
        )}
      </div>
    </div>
  );
}