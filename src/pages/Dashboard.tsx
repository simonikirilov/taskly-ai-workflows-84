import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Workflow,
  Calendar,
  Target
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
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Badge variant="secondary" className="text-sm">
            Productivity Overview
          </Badge>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedToday}</div>
              <p className="text-xs text-muted-foreground">
                Great progress today!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
              <Workflow className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWorkflows}</div>
              <p className="text-xs text-muted-foreground">
                Automated processes created
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
              <Calendar className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSchedules}</div>
              <p className="text-xs text-muted-foreground">
                Recurring automations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                Task completion success
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Saved</CardTitle>
              <Clock className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.timesSaved} min</div>
              <p className="text-xs text-muted-foreground">
                Estimated time saved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                All-time task count
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Insights Section */}
        <Card>
          <CardHeader>
            <CardTitle>Productivity Insights</CardTitle>
            <CardDescription>
              AI-powered analysis of your workflow patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.completedToday === 0 && (
              <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  💡 <strong>Tip:</strong> Try using voice commands to create your first task today! 
                  Say something like "Remind me to check emails at 2 PM"
                </p>
              </div>
            )}

            {stats.totalWorkflows === 0 && (
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  🚀 <strong>Get Started:</strong> Create your first workflow using voice commands! 
                  Try saying "Schedule a daily standup meeting at 9 AM"
                </p>
              </div>
            )}

            {stats.completionRate >= 80 && stats.totalTasks > 0 && (
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  🎉 <strong>Excellent!</strong> You have a {stats.completionRate}% completion rate. 
                  You're doing great at staying on top of your tasks!
                </p>
              </div>
            )}

            {stats.activeSchedules > 0 && (
              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-purple-800 dark:text-purple-200">
                  ⚡ <strong>Automation Active:</strong> You have {stats.activeSchedules} active schedules 
                  saving you time every day!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}