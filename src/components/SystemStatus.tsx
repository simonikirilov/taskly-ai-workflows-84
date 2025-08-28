import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Play, TrendingUp, Coffee, Moon } from 'lucide-react';

interface SystemStats {
  tasksExecutedToday: number;
  tasksCurrentlyExecuting: number;
  totalCompletedTasks: number;
  morningProductivity: number;
  afternoonProductivity: number;
  aeuwScore: number;
}

export function SystemStatus() {
  const [stats, setStats] = useState<SystemStats>({
    tasksExecutedToday: 12,
    tasksCurrentlyExecuting: 3,
    totalCompletedTasks: 247,
    morningProductivity: 87,
    afternoonProductivity: 72,
    aeuwScore: 79
  });

  // Mock real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        tasksCurrentlyExecuting: Math.floor(Math.random() * 5),
        aeuwScore: 75 + Math.floor(Math.random() * 15)
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">System Status</h3>
        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
          🟢 Active
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Tasks Executed Today */}
        <Card className="p-4 bg-card/30 border-border/20 hover:bg-card/40 transition-colors">
          <div className="text-center space-y-2">
            <CheckCircle className="h-6 w-6 mx-auto text-green-500" />
            <div className="text-2xl font-bold text-foreground">{stats.tasksExecutedToday}</div>
            <div className="text-xs text-muted-foreground">Tasks Executed Today</div>
          </div>
        </Card>

        {/* Currently Executing */}
        <Card className="p-4 bg-card/30 border-border/20 hover:bg-card/40 transition-colors">
          <div className="text-center space-y-2">
            <Play className="h-6 w-6 mx-auto text-blue-500 animate-pulse" />
            <div className="text-2xl font-bold text-foreground">{stats.tasksCurrentlyExecuting}</div>
            <div className="text-xs text-muted-foreground">Currently Executing</div>
          </div>
        </Card>

        {/* Total Completed */}
        <Card className="p-4 bg-card/30 border-border/20 hover:bg-card/40 transition-colors">
          <div className="text-center space-y-2">
            <TrendingUp className="h-6 w-6 mx-auto text-primary" />
            <div className="text-2xl font-bold text-foreground">{stats.totalCompletedTasks}</div>
            <div className="text-xs text-muted-foreground">Total Completed</div>
          </div>
        </Card>

        {/* AEUW Score */}
        <Card className="p-4 bg-card/30 border-border/20 hover:bg-card/40 transition-colors">
          <div className="text-center space-y-2">
            <Clock className="h-6 w-6 mx-auto text-accent" />
            <div className="text-2xl font-bold text-foreground">{stats.aeuwScore}%</div>
            <div className="text-xs text-muted-foreground">AEUW Score</div>
          </div>
        </Card>
      </div>

      {/* Productivity Timeline */}
      <Card className="p-4 bg-card/30 border-border/20">
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Today's Productivity</h4>
          
          <div className="space-y-2">
            {/* Morning */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Coffee className="h-4 w-4 text-amber-500" />
                <span className="text-muted-foreground">Morning</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.morningProductivity}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground w-10">{stats.morningProductivity}%</span>
              </div>
            </div>

            {/* Afternoon */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Moon className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground">Afternoon</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.afternoonProductivity}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-foreground w-10">{stats.afternoonProductivity}%</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}