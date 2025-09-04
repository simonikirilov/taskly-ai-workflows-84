import { Mic, MicOff, Loader2, Zap, AlertCircle } from 'lucide-react';
import type { WhisperStatus } from '@/lib/whisper/types';
import { Badge } from '@/components/ui/badge';

interface WhisperStatusProps {
  status: WhisperStatus | null;
  isListening?: boolean;
  className?: string;
}

export function WhisperStatus({ status, isListening, className }: WhisperStatusProps) {
  if (!status) return null;

  const getStatusIcon = () => {
    if (status.error) return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (status.isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (status.isTranscribing) return <Zap className="h-4 w-4 animate-pulse text-accent" />;
    if (isListening) return <Mic className="h-4 w-4 text-primary animate-pulse" />;
    return <MicOff className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (status.error) return 'Error';
    if (status.isLoading) return 'Loading Model...';
    if (status.isTranscribing) return 'Transcribing...';
    if (isListening) return 'Listening';
    if (status.isInitialized) return 'Ready';
    return 'Initializing';
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (status.error) return 'destructive';
    if (status.isLoading || status.isTranscribing) return 'secondary';
    if (isListening) return 'default';
    return 'outline';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge variant={getStatusVariant()} className="flex items-center gap-2">
        {getStatusIcon()}
        <span className="text-xs font-medium">{getStatusText()}</span>
      </Badge>
      
      {status.platform !== 'web' && (
        <Badge variant="outline" className="text-xs">
          {status.platform.toUpperCase()}
        </Badge>
      )}
      
      {status.modelLoaded && (
        <Badge variant="outline" className="text-xs text-primary">
          Whisper
        </Badge>
      )}
    </div>
  );
}