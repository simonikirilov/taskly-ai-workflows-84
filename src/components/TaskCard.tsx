import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle, Clock, MoreVertical, Copy, Calendar, Sparkles } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  isAuto?: boolean;
  time?: string;
  duration?: string;
}

interface TaskCardProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDuplicate: (task: Task, count: number) => void;
  isCompleted?: boolean;
}

export function TaskCard({ task, onToggle, onDuplicate, isCompleted = false }: TaskCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (!isCompleted) {
      setIsAnimating(true);
      setTimeout(() => {
        onToggle(task.id);
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
    );
  }

  return (
    <Card className={cn(
      "p-4 bg-card/30 border-border/20 hover:bg-card/50 transition-all duration-300 rounded-xl",
      "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10",
      isAnimating && "animate-scale-in"
    )}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Checkbox
            checked={task.isCompleted}
            onCheckedChange={handleToggle}
            className="flex-shrink-0 transition-transform duration-200 hover:scale-110"
          />
          {isAnimating && (
            <div className="absolute -inset-2">
              <Sparkles className="h-6 w-6 text-primary animate-ping" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-foreground truncate">
              {task.title}
            </h4>
            <Badge 
              variant="secondary" 
              className={cn(
                "text-xs px-2 py-1 font-medium rounded-full",
                task.isAuto 
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20" 
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              )}
            >
              {task.isAuto ? "Auto" : "Manual"}
            </Badge>
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
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 hover:bg-primary/10">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onDuplicate(task, 1)} className="cursor-pointer">
              <Copy className="h-4 w-4 mr-2" />
              Duplicate x1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(task, 5)} className="cursor-pointer">
              <Copy className="h-4 w-4 mr-2" />
              Duplicate x5
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(task, 10)} className="cursor-pointer">
              <Copy className="h-4 w-4 mr-2" />
              Duplicate x10
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}