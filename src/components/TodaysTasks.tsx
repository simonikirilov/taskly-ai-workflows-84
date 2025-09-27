import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Clock, MoreVertical, Copy, Zap, Calendar } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

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
          <Card className="p-6 text-center bg-card/30 border-border/20">
            <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">All tasks completed!</p>
            <p className="text-sm text-muted-foreground/80 mt-1">Great work today! 🎉</p>
          </Card>
        ) : (
          activeTasks.map((task) => (
            <Card key={task.id} className="p-4 bg-card/30 border-border/20 hover:bg-card/40 transition-colors">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={task.isCompleted}
                  onCheckedChange={() => handleTaskToggle(task.id)}
                  className="flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-foreground truncate">
                      {task.title}
                    </h4>
                    {task.isAuto && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 border-blue-500/20">
                        Auto
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {task.time && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{task.time}</span>
                      </div>
                    )}
                    {task.duration && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{task.duration}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDuplicateTask(task, 1)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate x1
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateTask(task, 5)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate x5
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateTask(task, 10)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate x10
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
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
              <Card key={task.id} className="p-3 bg-card/20 border-border/10">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm text-muted-foreground line-through truncate">
                        {task.title}
                      </h4>
                      {task.isAuto && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-blue-500/5 text-blue-400/60 border-blue-500/10">
                          Auto
                        </Badge>
                      )}
                    </div>
                    {task.time && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground/60">
                        <span>✓ {task.time}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}