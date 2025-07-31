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
  Star,
  Mic,
  Settings
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
        <div className="flex h-20 items-center justify-between px-6">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Page Title */}
      <div className="flex justify-center py-6">
        <h1 className="text-4xl font-bold text-foreground">Workflows</h1>
      </div>

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
        <div className="space-y-6">
          {workflows.length === 0 ? (
            <Card className="glass text-center p-12 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="max-w-md mx-auto space-y-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-lg">
                  <Workflow className="h-12 w-12 text-white" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">No workflows yet</h3>
                  <p className="text-lg text-muted-foreground">
                    Speak or type a task to create your first automation
                  </p>
                  <p className="text-sm text-muted-foreground/80">
                    Say: "Record my workflow" or click below to get started
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/')}
                  className="mt-6 px-8 py-3 text-lg bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all duration-300"
                >
                  <Clock className="h-5 w-5 mr-2" />
                  Record Your First Workflow
                </Button>
              </div>
            </Card>
          ) : (
            workflows.map((workflow) => {
              const schedule = schedules.find(s => s.workflow_id === workflow.id && s.is_active);
              const isNew = isNewWorkflow(workflow.created_at);
              
              return (
                <Card key={workflow.id} className="glass p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group border-primary/10 bg-gradient-to-br from-background/80 to-primary/5">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary via-accent to-secondary rounded-xl flex items-center justify-center shadow-lg">
                        <Workflow className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                          {workflow.title || "Untitled Workflow"}
                        </h3>
                        <p className="text-muted-foreground mt-1">
                          {workflow.description || "Intelligent automation workflow"}
                        </p>
                      </div>
                    </div>
                    
                    {isNew && (
                      <Badge className="bg-gradient-to-r from-primary to-accent text-white border-0 shadow-lg animate-pulse">
                        ✨ New
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                      <div className="text-lg font-bold text-primary">{formatDuration(workflow.created_at)}</div>
                      <div className="text-xs text-muted-foreground mt-1">Duration</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                      <div className="text-lg font-bold text-accent">{formatSteps()}</div>
                      <div className="text-xs text-muted-foreground mt-1">Steps</div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                      <div className="text-lg font-bold text-secondary-foreground">
                        {schedules.filter(s => s.workflow_id === workflow.id && s.is_active).length}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Schedules</div>
                    </div>
                  </div>

                  {/* Active Schedules */}
                  {schedule && (
                    <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20">
                      <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Active Schedule:
                      </h4>
                      <div className="text-sm text-muted-foreground bg-background/50 p-2 rounded-lg">
                        🔄 {schedule.frequency} at {schedule.time}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedWorkflow(workflow)}
                          className="flex-1 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 hover:bg-gradient-to-r hover:from-primary/20 hover:to-accent/20"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Automation
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
                    <Button variant="outline" size="sm" className="px-4 hover:bg-primary/10">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}