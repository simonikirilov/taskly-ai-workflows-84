import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, Activity } from 'lucide-react';

interface LiveTranscriptionDisplayProps {
  isListening: boolean;
  partialText: string;
  finalText: string;
  confidence: number;
  volume: number;
  isSpeaking: boolean;
  speechDuration: number;
  silenceDuration: number;
  className?: string;
}

export function LiveTranscriptionDisplay({
  isListening,
  partialText,
  finalText,
  confidence,
  volume,
  isSpeaking,
  speechDuration,
  silenceDuration,
  className
}: LiveTranscriptionDisplayProps) {
  const [displayText, setDisplayText] = useState('');

  // Update display text with typing animation for partial results
  useEffect(() => {
    const fullText = finalText + (partialText ? ' ' + partialText : '');
    if (fullText !== displayText) {
      setDisplayText(fullText);
    }
  }, [finalText, partialText, displayText]);

  // Don't render if not listening and no text
  if (!isListening && !displayText) return null;

  const formatDuration = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-600';
    if (confidence > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getVolumeIndicator = (volume: number) => {
    const normalizedVolume = Math.min(volume * 100, 100);
    const bars = Math.floor(normalizedVolume / 20);
    return '█'.repeat(bars) + '░'.repeat(5 - bars);
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardContent className="p-4 space-y-3">
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isListening ? (
              <Mic className={`h-4 w-4 ${isSpeaking ? 'text-green-500 animate-pulse' : 'text-blue-500'}`} />
            ) : (
              <MicOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              {isListening ? (isSpeaking ? 'Listening...' : 'Waiting for speech') : 'Processing'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Volume Indicator */}
            {isListening && (
              <div className="flex items-center gap-1">
                <Volume2 className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs font-mono text-muted-foreground">
                  {getVolumeIndicator(volume)}
                </span>
              </div>
            )}
            
            {/* Confidence Badge */}
            {confidence > 0 && (
              <Badge variant="outline" className={`text-xs ${getConfidenceColor(confidence)}`}>
                {Math.round(confidence * 100)}%
              </Badge>
            )}
          </div>
        </div>

        {/* Speech Timing */}
        {isListening && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {isSpeaking && speechDuration > 0 && (
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3 text-green-500" />
                <span>Speaking: {formatDuration(speechDuration)}</span>
              </div>
            )}
            {!isSpeaking && silenceDuration > 0 && silenceDuration < 3000 && (
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-yellow-500 opacity-60" />
                <span>Silence: {formatDuration(silenceDuration)}</span>
              </div>
            )}
          </div>
        )}

        {/* Transcription Text */}
        <div className="min-h-[60px] p-3 rounded-lg bg-muted/30 border border-border/50">
          {displayText ? (
            <div className="space-y-2">
              {/* Final Text */}
              {finalText && (
                <p className="text-foreground leading-relaxed">
                  {finalText}
                </p>
              )}
              
              {/* Partial Text (streaming) */}
              {partialText && (
                <p className="text-muted-foreground italic leading-relaxed opacity-80">
                  {partialText}
                  <span className="animate-pulse ml-1">|</span>
                </p>
              )}
            </div>
          ) : isListening ? (
            <p className="text-muted-foreground text-center">
              {isSpeaking ? 'Processing speech...' : 'Speak now...'}
            </p>
          ) : (
            <p className="text-muted-foreground text-center">
              Click to start speaking
            </p>
          )}
        </div>

        {/* Natural Language Indicators */}
        {isListening && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className={`h-2 w-2 rounded-full transition-colors ${
                isSpeaking ? 'bg-green-500' : 'bg-muted-foreground/30'
              }`} />
              <span>Natural speech detection active</span>
              <div className={`h-2 w-2 rounded-full transition-colors ${
                confidence > 0.7 ? 'bg-blue-500' : 'bg-muted-foreground/30'
              }`} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}