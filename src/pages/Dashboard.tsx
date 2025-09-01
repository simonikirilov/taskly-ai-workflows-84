import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Activity, CheckCircle, Clock, Zap, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';

interface DashboardStats {
  actionsThisWeek: number;
  todayTasksCompleted: number;
  todayTasksRemaining: number;
  automationSuccessRate: number;
  minutesSaved: number;
  morningVsAfternoonPercentage: number;
}

interface NextUpItem {
  id: string;
  title: string;
  time: string;
  type: 'auto' | 'scheduled';
}

interface RecentActivity {
  id: string;
  action: string;
  type: 'executed' | 'failed' | 'scheduled';
  time: string;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    actionsThisWeek: 0,
    todayTasksCompleted: 0,
    todayTasksRemaining: 0,
    automationSuccessRate: 0,
    minutesSaved: 0,
    morningVsAfternoonPercentage: 0,
  });
  
  const [nextUpItems, setNextUpItems] = useState<NextUpItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Fetch today's tasks
      const today = new Date().toISOString().split('T')[0];
      const { data: todayTasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      // Calculate stats (using mock data for now since we don't have actions table)
      const completed = todayTasks?.filter(task => task.status).length || 0;
      const remaining = (todayTasks?.length || 0) - completed;
      
      setStats({
        actionsThisWeek: Math.floor(Math.random() * 50) + 20, // Mock data
        todayTasksCompleted: completed,
        todayTasksRemaining: remaining,
        automationSuccessRate: Math.floor(Math.random() * 30) + 70, // Mock data
        minutesSaved: (Math.floor(Math.random() * 50) + 20) * 2, // Mock data
        morningVsAfternoonPercentage: Math.floor(Math.random() * 40) - 20, // Mock data
      });

      // Mock next up items
      setNextUpItems([
        { id: '1', title: 'Review morning emails', time: '09:00', type: 'auto' },
        { id: '2', title: 'Team standup', time: '10:30', type: 'scheduled' },
        { id: '3', title: 'Project review', time: '14:00', type: 'scheduled' },
      ]);

      // Mock recent activity
      setRecentActivity([
        { id: '1', action: 'Email notification sent', type: 'executed', time: '2m ago' },
        { id: '2', action: 'Calendar sync completed', type: 'executed', time: '5m ago' },
        { id: '3', action: 'Task reminder triggered', type: 'executed', time: '12m ago' },
        { id: '4', action: 'Slack integration failed', type: 'failed', time: '18m ago' },
        { id: '5', action: 'Daily backup scheduled', type: 'scheduled', time: '25m ago' },
        { id: '6', action: 'Report generation completed', type: 'executed', time: '32m ago' },
      ]);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-12 w-12 border-b-2 border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'executed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <Activity className="h-4 w-4 text-red-500" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Your productivity overview</p>
      </div>

      {/* Stats Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions This Week</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.actionsThisWeek}</div>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex gap-0.5">
                {/* Mini 7-bar sparkline */}
                {[3, 5, 2, 7, 4, 6, 8].map((height, i) => (
                  <div 
                    key={i} 
                    className="w-1 bg-primary/60 rounded-sm" 
                    style={{ height: `${height * 2}px` }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">+12% from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.todayTasksCompleted} / {stats.todayTasksCompleted + stats.todayTasksRemaining}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.todayTasksRemaining} remaining
            </p>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automation Success</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.automationSuccessRate > 0 ? `${stats.automationSuccessRate}%` : '—'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.automationSuccessRate > 0 ? 'Last 7 days' : 'No data yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Morning vs Afternoon */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Morning vs Afternoon (Yesterday)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-2">Morning</div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-3/5"></div>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-muted-foreground mb-2">Afternoon</div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-2/5"></div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              You were <span className={stats.morningVsAfternoonPercentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                {Math.abs(stats.morningVsAfternoonPercentage)}%{' '}
                {stats.morningVsAfternoonPercentage >= 0 ? 'better' : 'worse'}
              </span> before noon.
            </p>
            <Button variant="outline" size="sm" className="mt-2">
              <Calendar className="h-4 w-4 mr-2" />
              Block 09:00–09:45
            </Button>
          </CardContent>
        </Card>

        {/* Minutes Saved */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Minutes Saved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.minutesSaved}</div>
            <p className="text-sm text-muted-foreground mt-2">
              Estimated time saved through automation this week
            </p>
            <div className="flex items-center gap-2 mt-4">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600">+{Math.floor(stats.minutesSaved * 0.1)} from last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Up & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Up */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Next Up (Today)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nextUpItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">{item.time}</div>
                  <div>
                    <div className="font-medium text-sm">{item.title}</div>
                    <Badge variant={item.type === 'auto' ? 'default' : 'secondary'} className="text-xs">
                      {item.type === 'auto' ? 'Auto' : 'Scheduled'}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Skip</Button>
                  <Button size="sm">Approve</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 rounded cursor-pointer transition-colors">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.action}</div>
                </div>
                <div className="text-xs text-muted-foreground">{activity.time}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}