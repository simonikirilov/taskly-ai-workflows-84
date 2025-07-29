import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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

      toast({
        title: !currentStatus ? "Task completed!" : "Task reopened",
        description: !currentStatus ? "Great job! Keep up the momentum." : "Task marked as pending.",
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

  // Show empty task slots if no tasks
  const renderEmptyTasks = () => {
    const emptySlots = 5; // Show 5 empty task slots
    return Array.from({ length: emptySlots }, (_, index) => (
      <div key={`empty-${index}`} className="flex items-center space-x-3 py-3 px-4 border border-dashed border-border rounded-lg">
        <Checkbox disabled className="opacity-50" />
        <span className="text-muted-foreground italic">Speak a task to get started...</span>
      </div>
    ));
  };

  return (
    <Card className="p-6 glass">
      <h2 className="text-xl font-semibold mb-4 text-foreground">Today's Tasks</h2>
      
      <div className="space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "flex items-center space-x-3 py-3 px-4 rounded-lg border transition-all duration-200",
                task.status 
                  ? "bg-primary/5 border-primary/20" 
                  : "bg-background border-border hover:border-primary/30"
              )}
            >
              <Checkbox
                checked={task.status}
                onCheckedChange={() => toggleTaskStatus(task.id, task.status)}
                className="flex-shrink-0"
              />
              <div className="flex-1">
                <p className={cn(
                  "text-sm transition-all duration-200",
                  task.status 
                    ? "line-through text-muted-foreground" 
                    : "text-foreground"
                )}>
                  {task.title}
                </p>
                {task.scheduled_time && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(task.scheduled_time).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          renderEmptyTasks()
        )}
      </div>
    </Card>
  );
}