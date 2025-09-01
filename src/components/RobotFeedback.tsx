import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface RobotFeedbackProps {
  message: string;
  type: 'success' | 'error' | 'thinking' | 'listening';
  isVisible: boolean;
  onHide?: () => void;
}

export function RobotFeedback({ message, type, isVisible, onHide }: RobotFeedbackProps) {
  useEffect(() => {
    if (isVisible && type !== 'listening') {
      const timer = setTimeout(() => {
        onHide?.();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, type, onHide]);

  if (!isVisible) return null;

  const getEmoji = () => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '🤔';
      case 'thinking': return '💭';
      case 'listening': return '👂';
      default: return '💬';
    }
  };

  const getBubbleStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300';
      case 'error':
        return 'bg-orange-50 border-orange-200 text-orange-800 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-300';
      case 'thinking':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300';
      case 'listening':
        return 'bg-primary/10 border-primary/30 text-primary dark:bg-primary/10 dark:border-primary/30 dark:text-primary';
      default:
        return 'bg-muted border-border text-foreground';
    }
  };

  return (
    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-50">
      <div className={cn(
        "relative px-4 py-2 rounded-2xl border backdrop-blur-sm text-sm font-medium",
        "animate-fade-in shadow-lg max-w-xs text-center",
        getBubbleStyles()
      )}>
        <span className="mr-2">{getEmoji()}</span>
        {message}
        
        {/* Speech bubble tail */}
        <div className={cn(
          "absolute top-full left-1/2 transform -translate-x-1/2",
          "w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px]",
          "border-l-transparent border-r-transparent",
          type === 'success' ? 'border-t-green-200 dark:border-t-green-800' :
          type === 'error' ? 'border-t-orange-200 dark:border-t-orange-800' :
          type === 'thinking' ? 'border-t-blue-200 dark:border-t-blue-800' :
          type === 'listening' ? 'border-t-primary/30' :
          'border-t-border'
        )} />
      </div>
    </div>
  );
}