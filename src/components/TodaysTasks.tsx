import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  status: boolean;
  scheduled_time?: string;
  created_at: string;
}

interface TodaysTasksProps {
  refreshTrigger?: number;
}

export function TodaysTasks({ refreshTrigger }: TodaysTasksProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user, refreshTrigger]);

  const toggleTask = async (taskId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: !currentStatus })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, status: !currentStatus } : task
      ));

      toast({
        title: !currentStatus ? "Task completed! ✅" : "Task reopened",
        description: !currentStatus ? "Great job!" : "Keep going!",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error updating task",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="elevated-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Today's Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted/50 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="elevated-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Today's Tasks
          <span className="text-sm font-normal text-muted-foreground">
            ({tasks.filter(t => !t.status).length} pending)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Plus className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No tasks created today yet</p>
            <p className="text-sm">Try saying "Create a task to..." to the robot</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-all duration-200",
                task.status 
                  ? "bg-muted/30 border-muted text-muted-foreground" 
                  : "bg-card border-border hover:border-primary/30"
              )}
            >
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-6 w-6 rounded-full hover:bg-primary/10"
                onClick={() => toggleTask(task.id, task.status)}
              >
                <CheckCircle2 
                  className={cn(
                    "h-5 w-5 transition-colors",
                    task.status ? "text-primary fill-primary/20" : "text-muted-foreground"
                  )} 
                />
              </Button>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium",
                  task.status && "line-through"
                )}>
                  {task.title}
                </p>
                {task.scheduled_time && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Scheduled: {new Date(task.scheduled_time).toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Created: {new Date(task.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}