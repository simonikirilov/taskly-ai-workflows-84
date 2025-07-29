import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Edit2, Play, Settings, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  isEditing: boolean;
}

interface WorkflowAnalysisProps {
  isVisible: boolean;
  onClose: () => void;
  recordingData?: {
    duration: string;
    type: 'voice' | 'screen';
  };
}

export function WorkflowAnalysis({ isVisible, onClose, recordingData }: WorkflowAnalysisProps) {
  const [analysisStep, setAnalysisStep] = useState<'analyzing' | 'labeling' | 'ready'>('analyzing');
  const [workflowTitle, setWorkflowTitle] = useState('');
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: '1',
      title: 'Open Email Client',
      description: 'Launch Gmail or preferred email application',
      isEditing: false
    },
    {
      id: '2', 
      title: 'Check New Messages',
      description: 'Review inbox for new messages and priority emails',
      isEditing: false
    },
    {
      id: '3',
      title: 'Respond to Urgent',
      description: 'Reply to time-sensitive messages first',
      isEditing: false
    }
  ]);

  // Simulate analysis process
  useState(() => {
    if (isVisible && analysisStep === 'analyzing') {
      const timer = setTimeout(() => {
        setAnalysisStep('labeling');
        setWorkflowTitle('Morning Email Check');
      }, 3000);
      return () => clearTimeout(timer);
    }
  });

  const handleEditStep = (stepId: string) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, isEditing: true } : step
    ));
  };

  const handleSaveStep = (stepId: string, newTitle: string) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, title: newTitle, isEditing: false } : step
    ));
  };

  const handleCreateAutomation = () => {
    setAnalysisStep('ready');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl glass p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Workflow Analysis</h2>
            <p className="text-muted-foreground">
              {recordingData && `${recordingData.type === 'voice' ? '🎤' : '📹'} Recording: ${recordingData.duration}`}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Analysis Step */}
        {analysisStep === 'analyzing' && (
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 mx-auto bg-[var(--gradient-primary)] rounded-full flex items-center justify-center animate-pulse">
              <Settings className="h-10 w-10 text-white animate-spin" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Analyzing your flow...</h3>
              <p className="text-muted-foreground">
                Taskly is breaking down your recording into smart, actionable steps
              </p>
            </div>
            <div className="flex justify-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {/* Labeling Step */}
        {analysisStep === 'labeling' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Label Your Workflow</h3>
              <p className="text-muted-foreground">Review and edit the detected steps</p>
            </div>

            {/* Workflow Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Workflow Name</label>
              <Input
                value={workflowTitle}
                onChange={(e) => setWorkflowTitle(e.target.value)}
                placeholder="Enter workflow name..."
                className="glass"
              />
            </div>

            {/* Steps */}
            <div className="space-y-3">
              <label className="text-sm font-medium">Detected Steps</label>
              {steps.map((step, index) => (
                <div key={step.id} className="p-4 rounded-lg border border-border/50 bg-muted/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Step {index + 1}
                        </Badge>
                        {step.isEditing ? (
                          <Input
                            defaultValue={step.title}
                            onBlur={(e) => handleSaveStep(step.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSaveStep(step.id, e.currentTarget.value);
                              }
                            }}
                            className="text-sm font-medium bg-background"
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm font-medium">{step.title}</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditStep(step.id)}
                      disabled={step.isEditing}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateAutomation} className="flex-1">
                Create Automation
              </Button>
            </div>
          </div>
        )}

        {/* Ready Step */}
        {analysisStep === 'ready' && (
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Automation Ready! 🎉</h3>
              <p className="text-muted-foreground mb-4">
                "{workflowTitle}" has been saved and is ready to use
              </p>
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                Active Agent
              </Badge>
            </div>
            
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                <Play className="h-4 w-4 mr-2" />
                Test Run
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  Edit Labels
                </Button>
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}