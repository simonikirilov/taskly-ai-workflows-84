import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Workflow,
  Calendar,
  Target,
  ArrowLeft,
  Trophy,
  Flame,
  Brain
} from 'lucide-react';

interface DashboardStats {
  totalTasks: number;
  completedToday: number;
  totalWorkflows: number;
  activeSchedules: number;
  completionRate: number;
  timesSaved: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTasks: 0,
    completedToday: 0,
    totalWorkflows: 0,
    activeSchedules: 0,
    completionRate: 0,
    timesSaved: 0
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Fetch tasks
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id);

        if (tasksError) throw tasksError;

        // Fetch workflows
        const { data: workflows, error: workflowsError } = await supabase
          .from('workflows')
          .select('*')
          .eq('user_id', user.id);

        if (workflowsError) throw workflowsError;

        // Fetch active schedules
        const { data: schedules, error: schedulesError } = await supabase
          .from('schedule_rules')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (schedulesError) throw schedulesError;

        // Calculate stats
        const totalTasks = tasks?.length || 0;
        const completedToday = tasks?.filter(task => 
          task.status && 
          new Date(task.created_at) >= today &&
          new Date(task.created_at) < tomorrow
        ).length || 0;
        
        const totalWorkflows = workflows?.length || 0;
        const activeSchedules = schedules?.length || 0;
        
        const completionRate = totalTasks > 0 
          ? Math.round((tasks?.filter(task => task.status).length || 0) / totalTasks * 100)
          : 0;
        
        // Estimate time saved (rough calculation: 5 minutes per automated task)
        const timesSaved = (tasks?.filter(task => task.status).length || 0) * 5;

        setStats({
          totalTasks,
          completedToday,
          totalWorkflows,
          activeSchedules,
          completionRate,
          timesSaved
        });

      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: "Error loading dashboard",
          description: "Failed to load dashboard statistics. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

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
      {/* Header with Back Button */}
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
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <div /> {/* Spacer for center alignment */}
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl space-y-8">
        {/* AI Assistant Panel Header */}
        <Card className="glass p-6 text-center">
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-[var(--gradient-primary)] rounded-full flex items-center justify-center">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Your AI Assistant Panel</h2>
              <p className="text-muted-foreground">Track your productivity and optimize workflows</p>
            </div>
          </div>
        </Card>

        {/* Top Cards: Weekly Score & Time Saved */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-cyan-500 rounded-full flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">87</div>
                <div className="text-sm text-muted-foreground">🧠 Weekly Productivity Score</div>
              </div>
            </div>
          </Card>
          
          <Card className="glass p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-accent to-orange-500 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div>
                <div className="text-3xl font-bold text-accent">{stats.timesSaved}m</div>
                <div className="text-sm text-muted-foreground">⏰ Time Saved This Week</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Middle Card: Visual Calendar & Success Rate */}
        <Card className="glass p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Week's Flow
          </h3>
          
          <div className="grid grid-cols-7 gap-2 mb-6">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div key={day} className="text-center">
                <div className="text-xs text-muted-foreground mb-2">{day}</div>
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium ${
                  index < 4 ? 'bg-primary/20 text-primary' : 'bg-muted'
                }`}>
                  {index < 4 ? '✅' : ''}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.completionRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalWorkflows}</div>
              <div className="text-sm text-muted-foreground">Completed Flows</div>
            </div>
          </div>
        </Card>

        {/* Bottom Card: Achievements & Streaks */}
        <Card className="glass p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Latest Achievements
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
              <div className="text-3xl mb-2">🔥</div>
              <div className="font-bold">5 Day Streak</div>
              <div className="text-xs text-muted-foreground">Keep it going!</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-accent/5 border border-accent/10">
              <div className="text-3xl mb-2">✅</div>
              <div className="font-bold">Task Master</div>
              <div className="text-xs text-muted-foreground">100 tasks completed</div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-secondary/20 border border-secondary/30">
              <div className="text-3xl mb-2">🤖</div>
              <div className="font-bold">Voice Pro</div>
              <div className="text-xs text-muted-foreground">50 voice commands</div>
            </div>
          </div>
        </Card>

        {/* Quick Tips */}
        {(stats.completedToday === 0 || stats.totalWorkflows === 0) && (
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4">💡 Quick Tips</h3>
            <div className="space-y-3">
              {stats.completedToday === 0 && (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-sm">
                    🎤 <strong>Try saying:</strong> "Remind me to check emails at 2 PM"
                  </p>
                </div>
              )}
              {stats.totalWorkflows === 0 && (
                <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
                  <p className="text-sm">
                    📹 <strong>Record your first workflow:</strong> Click "Record My Flow" and capture a task
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}