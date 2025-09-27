import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Brain, Loader2 } from 'lucide-react';

interface WorkflowAnalysisProps {
  isVisible: boolean;
  onClose: () => void;
  recordingData?: Blob;
}

export function WorkflowAnalysis({ isVisible, onClose, recordingData }: WorkflowAnalysisProps) {
  const [analysisStep, setAnalysisStep] = useState<'analyzing' | 'complete'>('analyzing');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setAnalysisStep('analyzing');
      setProgress(0);
      
      // Simulate analysis progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setAnalysisStep('complete'), 500);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-background border border-border">
        <DialogHeader>
          <DialogTitle className="text-center">Workflow Analysis</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 text-center space-y-6">
          {analysisStep === 'analyzing' ? (
            <>
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                <Brain className="h-8 w-8 text-primary animate-pulse" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Analyzing and labeling your workflow...</h3>
                <p className="text-sm text-muted-foreground">
                  We're currently processing this session. You'll receive a notification when it's ready to use.
                </p>
                
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-xs text-muted-foreground">{progress}% complete</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Workflow Analysis Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  Your workflow has been processed and saved. You can now view it in your Workflows section.
                </p>
                
                <Button onClick={onClose} className="w-full">
                  Done
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}