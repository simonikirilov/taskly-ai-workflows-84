import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Clock, Plus, Sparkles, Target, CheckCircle2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  status: boolean;
  scheduled_time: string | null;
  created_at: string;
  workflow_id?: string;
}

interface TaskListProps {
  refreshTrigger?: number;
}

export function TaskList({ refreshTrigger }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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
        .or(`scheduled_time.gte.${today.toISOString()},scheduled_time.lt.${tomorrow.toISOString()},scheduled_time.is.null`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error loading tasks",
        description: "Failed to load your tasks. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user, refreshTrigger]);

  const toggleTaskStatus = async (taskId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: !currentStatus })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: !currentStatus } : task
      ));

      toast({
        title: !currentStatus ? "Task completed!" : "Task reopened",
        description: !currentStatus ? "Great job!" : "Task marked as incomplete",
      });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error updating task",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card className="glass border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[var(--gradient-primary)] flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            Today's Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedTasks = tasks.filter(task => task.status);
  const pendingTasks = tasks.filter(task => !task.status);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <Card className="glass border-0 overflow-hidden">
      {/* Header with Progress */}
      <CardHeader className="pb-4 bg-gradient-to-r from-background to-muted/20">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[var(--gradient-primary)] flex items-center justify-center">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            Today's Tasks
          </CardTitle>
          {tasks.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {completedTasks.length}/{tasks.length}
              </Badge>
              <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--gradient-primary)] transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {tasks.length === 0 ? (
          <div className="text-center p-12 space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-[var(--gradient-primary)] flex items-center justify-center opacity-80">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-lg">Let's win the day! 🚀</h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Start by saying "Remind me to..." or "Schedule..." to create your first task
              </p>
            </div>
            <Button variant="outline" className="glass hover:bg-primary/10">
              <Plus className="h-4 w-4 mr-2" />
              Add Task via Voice
            </Button>
          </div>
        ) : (
          <>
            {/* Pending Tasks */}
            {pendingTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium">Focus Zone</h3>
                  <Badge variant="outline" className="text-xs">
                    {pendingTasks.length} pending
                  </Badge>
                </div>
                <div className="space-y-2">
                  {pendingTasks.map((task, index) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={toggleTaskStatus}
                      delay={index * 100}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <h3 className="text-sm font-medium text-muted-foreground">Completed</h3>
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    {completedTasks.length} done
                  </Badge>
                </div>
                <div className="space-y-2">
                  {completedTasks.map((task, index) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={toggleTaskStatus}
                      delay={index * 100}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, status: boolean) => void;
  delay?: number;
}

function TaskItem({ task, onToggle, delay = 0 }: TaskItemProps) {
  return (
    <div 
      className={cn(
        "flex items-center gap-4 p-4 rounded-xl border bg-card/50 backdrop-blur-sm transition-all duration-300 group",
        "hover:bg-card hover:shadow-md hover:scale-[1.02] cursor-pointer animate-[slide-up_0.5s_ease-out]",
        task.status && "opacity-70"
      )}
      style={{ animationDelay: `${delay}ms` }}
      onClick={() => onToggle(task.id, task.status)}
    >
      <div className="relative">
        <Checkbox
          checked={task.status}
          onCheckedChange={() => onToggle(task.id, task.status)}
          className="h-5 w-5 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
        />
        {task.status && (
          <div className="absolute inset-0 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-white animate-in zoom-in duration-300" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0 space-y-1">
        <p className={cn(
          "text-sm font-medium transition-all duration-300",
          task.status 
            ? 'line-through text-muted-foreground' 
            : 'text-foreground group-hover:text-primary'
        )}>
          {task.title}
        </p>
        
        {task.scheduled_time && (
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {format(new Date(task.scheduled_time), 'h:mm a')}
            </span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {task.status ? (
          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
            ✓ Done
          </Badge>
        ) : (
          <Badge variant="outline" className="text-xs">
            Pending
          </Badge>
        )}
      </div>
    </div>
  );
}