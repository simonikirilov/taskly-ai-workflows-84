import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, MoreVertical, Calendar, Sparkles, Play, Edit, Trash } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'completed' | 'scheduled';
  createdAt: string;
  completedAt?: string;
  scheduledFor?: string;
}

interface TaskCardProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onSchedule: (taskId: string) => void;
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onComplete, onSchedule, onEdit, onDelete }: TaskCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const isCompleted = task.status === 'completed';
  const isScheduled = task.status === 'scheduled';

  const handleRun = () => {
    if (!isCompleted) {
      setIsAnimating(true);
      setTimeout(() => {
        onComplete(task.id);
        setIsAnimating(false);
      }, 300);
    }
  };

  if (isCompleted) {
    return (
      <Card className="p-3 bg-card/20 border-border/10 transition-all duration-200">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <h4 className="text-sm text-muted-foreground line-through truncate">
              {task.title}
            </h4>
            {task.completedAt && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground/60 mt-1">
                <span>✓ {format(new Date(task.completedAt), 'h:mm a')}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "p-4 bg-card/30 border-border/20 hover:bg-card/50 transition-all duration-300 rounded-xl",
      "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10",
      isAnimating && "animate-scale-in"
    )}>
      <div className="flex items-start gap-3">
        {isAnimating && (
          <div className="absolute -inset-2 pointer-events-none">
            <Sparkles className="h-6 w-6 text-primary animate-ping" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-foreground truncate">
              {task.title}
            </h4>
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs px-2 py-1 font-medium rounded-full",
                isScheduled
                  ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              )}
            >
              {isScheduled ? "Scheduled" : "Pending"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {task.scheduledFor && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(task.scheduledFor), 'MMM d, h:mm a')}</span>
              </div>
            )}
            {!task.scheduledFor && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{format(new Date(task.createdAt), 'h:mm a')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            onClick={handleRun}
            className="h-8 gap-1"
          >
            <Play className="h-3 w-3" />
            Run
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 hover:bg-primary/10">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => onSchedule(task.id)} className="cursor-pointer">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(task.id)} className="cursor-pointer">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(task.id)} 
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}