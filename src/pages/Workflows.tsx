import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Clock,
  Play,
  Edit,
  Calendar,
  Tag,
  Plus,
  Workflow,
  Star
} from 'lucide-react';

interface WorkflowItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface ScheduleRule {
  id: string;
  workflow_id: string;
  frequency: string;
  time: string;
  is_active: boolean;
}

export default function Workflows() {
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowItem | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    frequency: 'daily',
    time: '09:00'
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkflows();
    fetchSchedules();
  }, [user]);

  const fetchWorkflows = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast({
        title: "Error loading workflows",
        description: "Failed to load your workflows. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchSchedules = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('schedule_rules')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async () => {
    if (!selectedWorkflow || !user) return;

    try {
      const { error } = await supabase
        .from('schedule_rules')
        .insert({
          workflow_id: selectedWorkflow.id,
          user_id: user.id,
          frequency: scheduleForm.frequency,
          time: scheduleForm.time,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Schedule created",
        description: `Workflow "${selectedWorkflow.title}" scheduled to run ${scheduleForm.frequency} at ${scheduleForm.time}`,
      });

      fetchSchedules();
      setSelectedWorkflow(null);
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error creating schedule",
        description: "Failed to schedule workflow. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (createdAt: string) => {
    // Mock duration calculation - in real app this would be stored
    const hours = Math.floor(Math.random() * 2) + 1;
    const minutes = Math.floor(Math.random() * 60);
    return `${hours}h ${minutes}m`;
  };

  const formatSteps = () => {
    // Mock steps count - in real app this would be stored
    return Math.floor(Math.random() * 10) + 3;
  };

  const isNewWorkflow = (createdAt: string) => {
    const created = new Date(createdAt);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return created > yesterday;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="h-12 w-12 border-b-2 border-primary rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-lg font-semibold">Workflows</h1>
          <div /> {/* Spacer for center alignment */}
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl space-y-8">
        {/* Header with Icon */}
        <Card className="glass p-6 text-center">
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-[var(--gradient-primary)] rounded-full flex items-center justify-center">
              <Workflow className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Your Workflows</h2>
              <p className="text-muted-foreground">Manage and schedule your recorded workflows</p>
            </div>
          </div>
        </Card>

        {/* Workflows List */}
        <div className="space-y-4">
          {workflows.length === 0 ? (
            <Card className="glass p-8 text-center">
              <div className="space-y-4">
                <Workflow className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No workflows yet</h3>
                  <p className="text-muted-foreground">Record your first workflow to get started</p>
                </div>
                <Button onClick={() => navigate('/')} className="mt-4">
                  Go to Home
                </Button>
              </div>
            </Card>
          ) : (
            workflows.map((workflow) => {
              const schedule = schedules.find(s => s.workflow_id === workflow.id && s.is_active);
              const isNew = isNewWorkflow(workflow.created_at);
              
              return (
                <Card key={workflow.id} className="glass hover:bg-card/60 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">
                            {workflow.title || "Untitled Workflow"}
                          </CardTitle>
                          {isNew && (
                            <Badge className="bg-primary/20 text-primary border-primary/30">
                              <Star className="h-3 w-3 mr-1" />
                              New
                            </Badge>
                          )}
                        </div>
                        <CardDescription>
                          {workflow.description || "No description provided"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedWorkflow(workflow)}
                            >
                              <Calendar className="h-4 w-4 mr-1" />
                              Schedule
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Schedule Workflow</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 p-4">
                              <div>
                                <Label htmlFor="frequency">Frequency</Label>
                                <select
                                  id="frequency"
                                  className="w-full p-2 border rounded-md bg-background"
                                  value={scheduleForm.frequency}
                                  onChange={(e) => setScheduleForm(prev => ({ ...prev, frequency: e.target.value }))}
                                >
                                  <option value="daily">Daily</option>
                                  <option value="weekly">Weekly</option>
                                  <option value="monthly">Monthly</option>
                                </select>
                              </div>
                              <div>
                                <Label htmlFor="time">Time</Label>
                                <Input
                                  id="time"
                                  type="time"
                                  value={scheduleForm.time}
                                  onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                                />
                              </div>
                              <Button onClick={createSchedule} className="w-full">
                                Create Schedule
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Duration: {formatDuration(workflow.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Play className="h-4 w-4 text-muted-foreground" />
                        <span>{formatSteps()} steps</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(workflow.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {workflow.category && (
                          <>
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="secondary">{workflow.category}</Badge>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {schedule && (
                      <div className="mt-4 p-3 bg-primary/5 border border-primary/10 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="font-medium">Scheduled:</span>
                          <span>{schedule.frequency} at {schedule.time}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}