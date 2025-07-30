import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { X, CheckCircle, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Task {
  id: string;
  title: string;
  status: boolean;
  scheduled_time?: string;
  created_at: string;
}

interface TaskListProps {
  refreshTrigger?: number;
}

export function TaskList({ refreshTrigger = 0 }: TaskListProps) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user, refreshTrigger]);

  const fetchTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
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

  const toggleTaskStatus = async (taskId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: !currentStatus })
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, status: !currentStatus }
          : task
      ));

      // Show completion notification if task was just completed
      if (!currentStatus) {
        const completedTask = tasks.find(task => task.id === taskId);
        toast({
          title: "✅ Task Completed",
          description: `${completedTask?.title}`,
        });
      } else {
        toast({
          title: "Task reopened",
          description: "Task marked as pending.",
        });
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error updating task",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      // Update local state
      setTasks(tasks.filter(task => task.id !== taskId));

      toast({
        title: "Task deleted",
        description: "Task removed from your list.",
      });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error deleting task",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {tasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="elevated-card w-32 h-32 mx-auto mb-6 rounded-3xl flex items-center justify-center">
            <CheckCircle className="h-16 w-16 text-primary/70" />
          </div>
          <h3 className="text-2xl font-semibold text-foreground mb-3">Ready for your first task</h3>
          <p className="text-lg text-muted-foreground font-light max-w-md mx-auto">
            Use voice commands or workflow recording to get started
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "elevated-card p-6 rounded-2xl transition-all duration-300",
                task.status && "opacity-70"
              )}
            >
              <div className="flex items-center gap-5">
                <button
                  onClick={() => toggleTaskStatus(task.id, task.status)}
                  className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center",
                    task.status
                      ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/25"
                      : "border-muted-foreground/40 hover:border-primary hover:shadow-md hover:shadow-primary/20"
                  )}
                >
                  {task.status && <Check className="h-4 w-4" />}
                </button>

                <div className="flex-1 min-w-0">
                  <h3 className={cn(
                    "text-lg font-medium text-foreground",
                    task.status && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </h3>
                  {task.scheduled_time && (
                    <p className="text-sm text-muted-foreground mt-2 font-light">
                      {formatDistanceToNow(new Date(task.scheduled_time), { addSuffix: true })}
                    </p>
                  )}
                </div>

                {task.status && (
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="flex-shrink-0 p-3 text-muted-foreground hover:text-destructive transition-all duration-200 rounded-xl hover:bg-destructive/10"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}