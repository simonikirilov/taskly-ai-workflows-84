import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CompletedTask {
  id: string;
  title: string;
  completedAt: string;
  category?: string;
  duration?: string;
}

export function CompletedTasks() {
  const [completedTasks, setCompletedTasks] = useState<CompletedTask[]>([
    {
      id: '1',
      title: 'Review project proposals',
      completedAt: '2 hours ago',
      category: 'Work',
      duration: '25m'
    },
    {
      id: '2',
      title: 'Post social media content',
      completedAt: '4 hours ago',
      category: 'Marketing',
      duration: '15m'
    },
    {
      id: '3',
      title: 'Check email and respond',
      completedAt: '6 hours ago',
      category: 'Communication',
      duration: '20m'
    },
    {
      id: '4',
      title: 'Update task management system',
      completedAt: 'This morning',
      category: 'Admin',
      duration: '30m'
    }
  ]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Completed</h3>
        <Badge variant="outline" className="text-green-600 border-green-500/20">
          {completedTasks.length} done today
        </Badge>
      </div>
      
      <div className="space-y-3">
        {completedTasks.length === 0 ? (
          <Card className="p-6 text-center bg-card/30 border-border/20">
            <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">No completed tasks today yet</p>
            <p className="text-sm text-muted-foreground/80 mt-1">Complete some tasks to see them here!</p>
          </Card>
        ) : (
          completedTasks.map((task) => (
            <Card key={task.id} className="p-4 bg-card/30 border-border/20 hover:bg-card/40 transition-colors">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={cn(
                      "font-medium text-muted-foreground line-through",
                      "truncate"
                    )}>
                      {task.title}
                    </h4>
                    {task.category && (
                      <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-primary/10 text-primary">
                        {task.category}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>✓ {task.completedAt}</span>
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
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}