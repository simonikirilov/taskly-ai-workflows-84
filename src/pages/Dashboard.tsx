import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Zap, 
  Clock, 
  TrendingUp, 
  Calendar,
  CheckCircle,
  Eye,
  BarChart3,
  Activity,
  Target,
  HelpCircle,
  Play,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DashboardStats {
  actionsThisWeek: number;
  todaysTasks: number;
  completedToday: number;
  remainingToday: number;
  automationSuccess: number;
  avgRunTime: string;
  minutesSaved: number;
  consecutiveDays: number;
  watching: boolean;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    actionsThisWeek: 0,
    todaysTasks: 0,
    completedToday: 0,
    remainingToday: 0,
    automationSuccess: 0,
    avgRunTime: '1:23',
    minutesSaved: 0,
    consecutiveDays: 1,
    watching: true
  });
  const [loading, setLoading] = useState(true);
  const [showUpcoming, setShowUpcoming] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Sample data for charts and activities
  const weekData = [12, 8, 15, 22, 18, 5, 9]; // Actions per day for sparkline
  const morningVsAfternoon = { morning: 65, afternoon: 35 };
  const autoVsManual = { auto: 78, manual: 22 };
  
  const nextUpItems = [
    { time: '2:30 PM', workflow: 'Email digest review', id: 1 },
    { time: '4:00 PM', workflow: 'Daily standup prep', id: 2 },
    { time: '5:30 PM', workflow: 'Project status update', id: 3 }
  ];
  
  const upcomingItems = [
    { date: 'Tomorrow', time: '9:00 AM', workflow: 'Morning focus block', id: 4 },
    { date: 'Tomorrow', time: '11:30 AM', workflow: 'Client call prep', id: 5 },
    { date: 'Friday', time: '2:00 PM', workflow: 'Weekly report generation', id: 6 },
    { date: 'Monday', time: '10:00 AM', workflow: 'Team planning session', id: 7 },
    { date: 'Monday', time: '3:30 PM', workflow: 'Code review workflow', id: 8 }
  ];
  
  const recentActivity = [
    { icon: '✅', title: 'Email automation completed', time: '2 mins ago', type: 'success' },
    { icon: '⏰', title: 'Focus block scheduled', time: '15 mins ago', type: 'scheduled' },
    { icon: '🤖', title: 'Workflow "Daily prep" executed', time: '1 hour ago', type: 'executed' },
    { icon: '❌', title: 'Calendar sync failed', time: '2 hours ago', type: 'failed' },
    { icon: '✅', title: 'Task "Review docs" completed', time: '3 hours ago', type: 'success' },
    { icon: '⏰', title: 'Reminder: Team meeting in 5 min', time: '4 hours ago', type: 'scheduled' }
  ];

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Get date ranges
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
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

        // Fetch workflows for action count
        const { data: workflows, error: workflowsError } = await supabase
          .from('workflows')
          .select('*')
          .eq('user_id', user.id);

        if (workflowsError) throw workflowsError;

        // Calculate stats
        const todaysTasks = tasks?.filter(task => {
          const taskDate = new Date(task.created_at);
          return taskDate >= today && taskDate < tomorrow;
        }).length || 0;

        const completedToday = tasks?.filter(task => 
          task.status && 
          new Date(task.created_at) >= today &&
          new Date(task.created_at) < tomorrow
        ).length || 0;

        const actionsThisWeek = tasks?.filter(task => 
          new Date(task.created_at) >= weekAgo
        ).length || 0;

        const totalCompleted = tasks?.filter(task => task.status).length || 0;
        const automationSuccess = tasks?.length > 0 
          ? Math.round((totalCompleted / tasks.length) * 100)
          : 95; // Default success rate

        const minutesSaved = actionsThisWeek * 2; // 2 minutes per action

        setStats({
          actionsThisWeek,
          todaysTasks,
          completedToday,
          remainingToday: todaysTasks - completedToday,
          automationSuccess,
          avgRunTime: '1:23',
          minutesSaved,
          consecutiveDays: 5, // Placeholder
          watching: JSON.parse(localStorage.getItem('taskly-settings') || '{}').watching || true
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

  const handleWatchingToggle = (checked: boolean) => {
    setStats(prev => ({ ...prev, watching: checked }));
    const settings = JSON.parse(localStorage.getItem('taskly-settings') || '{}');
    settings.watching = checked;
    localStorage.setItem('taskly-settings', JSON.stringify(settings));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-12 w-12 border-b-2 border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/20 bg-background/95 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-6 max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')} 
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/account')}
            >
              Account
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Clear insights into your productivity</p>
        </div>

        {/* Hero Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Actions This Week */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Actions This Week</h3>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-3xl font-bold text-primary">{stats.actionsThisWeek}</div>
              
              {/* Mini sparkline */}
              <div className="flex items-end gap-1 h-8">
                {weekData.map((value, index) => (
                  <div 
                    key={index} 
                    className="bg-primary/30 rounded-t-sm flex-1 transition-all duration-200 hover:bg-primary/50"
                    style={{ height: `${(value / Math.max(...weekData)) * 100}%` }}
                  />
                ))}
              </div>
              
              <p className="text-xs text-muted-foreground">Actions executed in the last 7 days.</p>
            </div>
          </Card>

          {/* Today's Tasks */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Today's Tasks</h3>
              <div className="text-3xl font-bold">{stats.todaysTasks}</div>
              <p className="text-sm text-muted-foreground">
                Completed: {stats.completedToday} • Remaining: {stats.remainingToday}
              </p>
            </div>
          </Card>

          {/* Automation Success */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Automation Success</h3>
              <div className="text-3xl font-bold text-green-500">{stats.automationSuccess}%</div>
              <p className="text-sm text-muted-foreground">
                Avg run time: {stats.avgRunTime}
              </p>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Morning vs Afternoon */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Morning vs Afternoon (Yesterday)</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Before 12 PM</span>
                  <span>{morningVsAfternoon.morning}%</span>
                </div>
                <Progress value={morningVsAfternoon.morning} className="h-2" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>After 12 PM</span>
                  <span>{morningVsAfternoon.afternoon}%</span>
                </div>
                <Progress value={morningVsAfternoon.afternoon} className="h-2" />
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              You were +{morningVsAfternoon.morning - morningVsAfternoon.afternoon}% better before noon.
            </p>
            
            <Button size="sm" variant="outline" className="mt-3 gap-2">
              <Calendar className="h-3 w-3" />
              Block 09:00–09:45
            </Button>
          </Card>

          {/* Auto vs Manual */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Auto vs Manual (Last 7 days)</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Automated runs</span>
                  <span>{autoVsManual.auto}%</span>
                </div>
                <Progress value={autoVsManual.auto} className="h-3" />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Manual runs</span>
                  <span>{autoVsManual.manual}%</span>
                </div>
                <Progress value={autoVsManual.manual} className="h-3" />
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4">
              Automation share: {autoVsManual.auto}%
            </p>
          </Card>
        </div>

        {/* Schedule & Upcoming */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Next Up Today */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Next Up (Today)</h3>
            
            <div className="space-y-3">
              {nextUpItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{item.time}</div>
                    <div className="text-sm text-muted-foreground">{item.workflow}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Next 3 Days */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Upcoming (Next 3 days)</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowUpcoming(!showUpcoming)}
                className="gap-2"
              >
                {showUpcoming ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
            
            {showUpcoming && (
              <div className="space-y-2">
                {upcomingItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-2 text-sm border rounded">
                    <div className="flex gap-3">
                      <span className="text-muted-foreground min-w-[60px]">{item.date}</span>
                      <span className="min-w-[60px]">{item.time}</span>
                      <span>{item.workflow}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!showUpcoming && (
              <p className="text-sm text-muted-foreground">Click to expand upcoming items</p>
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                <div className="text-lg">{activity.icon}</div>
                <div className="flex-1">
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
                <Badge 
                  variant={
                    activity.type === 'success' ? 'default' :
                    activity.type === 'failed' ? 'destructive' : 'secondary'
                  }
                  className="text-xs"
                >
                  {activity.type}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-primary mb-2">{stats.minutesSaved}m</div>
            <p className="text-sm text-muted-foreground">Minutes saved this week</p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold mb-2">{stats.consecutiveDays}</div>
            <p className="text-sm text-muted-foreground">Consecutive days used</p>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold mb-2">Watching</div>
                <p className="text-sm text-muted-foreground">Status mirror</p>
              </div>
              <Switch 
                checked={stats.watching} 
                onCheckedChange={handleWatchingToggle}
              />
            </div>
          </Card>
        </div>

        {/* Empty State */}
        {stats.actionsThisWeek === 0 && (
          <Card className="p-8 text-center">
            <div className="space-y-4">
              <div className="text-4xl">🚀</div>
              <h3 className="text-xl font-semibold">Ready to get started?</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                No actions yet. Try recording a workflow or scheduling a block to see your productivity metrics here.
              </p>
              <div className="flex gap-3 justify-center">
                <Button className="gap-2">
                  <Activity className="h-4 w-4" />
                  Record Workflow
                </Button>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Block
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}