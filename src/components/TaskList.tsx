import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';

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
      <Card>
        <CardHeader>
          <CardTitle>Today's Tasks</CardTitle>
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Today's Tasks
        </CardTitle>
        <Badge variant="secondary">
          {completedTasks.length}/{tasks.length} completed
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            <Plus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No tasks for today</p>
            <p className="text-sm">
              Use voice commands to create your first workflow and task!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={toggleTaskStatus}
              />
            ))}
            {completedTasks.length > 0 && (
              <>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-3">
                    Completed ({completedTasks.length})
                  </p>
                  {completedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={toggleTaskStatus}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, status: boolean) => void;
}

function TaskItem({ task, onToggle }: TaskItemProps) {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors">
      <Checkbox
        checked={task.status}
        onCheckedChange={() => onToggle(task.id, task.status)}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.status ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </p>
        {task.scheduled_time && (
          <p className="text-xs text-muted-foreground">
            Scheduled: {format(new Date(task.scheduled_time), 'h:mm a')}
          </p>
        )}
      </div>
    </div>
  );
}