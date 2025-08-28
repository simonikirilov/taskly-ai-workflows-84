import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { TaskCard } from './TaskCard';

interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  isAuto?: boolean;
  time?: string;
  duration?: string;
}

export function TodaysTasks() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Focus Session', isCompleted: false, isAuto: false, time: '9:00 AM', duration: '2h' },
    { id: '2', title: 'Email sync workflow', isCompleted: false, isAuto: true, time: '10:30 AM' },
    { id: '3', title: 'Team Sync', isCompleted: false, isAuto: false, time: '11:30 AM', duration: '30m' },
    { id: '4', title: 'Social media posting', isCompleted: false, isAuto: true, time: '1:00 PM' },
    { id: '5', title: 'Deep Work', isCompleted: false, isAuto: false, time: '2:00 PM', duration: '3h' },
    { id: '6', title: 'Daily standup notes', isCompleted: false, isAuto: true, time: '4:00 PM' },
    { id: '7', title: 'Review & Plan', isCompleted: false, isAuto: false, time: '5:30 PM', duration: '1h' }
  ]);

  const [completedTasks, setCompletedTasks] = useState<Task[]>([
    { id: 'c1', title: 'Morning routine workflow', isCompleted: true, isAuto: true, time: '7:00 AM' },
    { id: 'c2', title: 'Check overnight emails', isCompleted: true, isAuto: false, time: '8:00 AM' },
    { id: 'c3', title: 'Coffee break reminder', isCompleted: true, isAuto: true, time: '8:30 AM' }
  ]);

  const [showCompleted, setShowCompleted] = useState(false);

  const handleTaskToggle = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedTask = { ...task, isCompleted: !task.isCompleted };
          if (updatedTask.isCompleted) {
            // Move to completed tasks
            setCompletedTasks(prev => [updatedTask, ...prev]);
            return null; // Will be filtered out
          }
          return updatedTask;
        }
        return task;
      }).filter(Boolean) as Task[]
    );
  };

  const handleDuplicateTask = (task: Task, count: number) => {
    const newTasks = Array.from({ length: count }, (_, index) => ({
      ...task,
      id: `${task.id}-dup-${Date.now()}-${index}`,
      title: `${task.title} (Copy ${index + 1})`,
      isCompleted: false
    }));

    setTasks(prev => [...prev, ...newTasks]);
  };

  const activeTasks = tasks.filter(task => !task.isCompleted);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Today's Tasks</h3>
      
      {/* Active Tasks */}
      <div className="space-y-3">
        {activeTasks.length === 0 ? (
          <Card className="p-8 text-center bg-card/30 border-border/20 rounded-xl">
            <CheckCircle className="h-16 w-16 mx-auto text-green-500/70 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">All tasks completed!</h3>
            <p className="text-sm text-muted-foreground">Great work today! 🎉</p>
          </Card>
        ) : (
          activeTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={handleTaskToggle}
              onDuplicate={handleDuplicateTask}
            />
          ))
        )}
      </div>

      {/* Completed Tasks - Collapsible */}
      {completedTasks.length > 0 && (
        <Collapsible open={showCompleted} onOpenChange={setShowCompleted}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-3 h-auto">
              <span className="text-sm font-medium text-muted-foreground">
                Completed Today ({completedTasks.length})
              </span>
              <CheckCircle className={cn("h-4 w-4 transition-transform", showCompleted && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-2 mt-2">
            {completedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => {}}
                onDuplicate={() => {}}
                isCompleted={true}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}