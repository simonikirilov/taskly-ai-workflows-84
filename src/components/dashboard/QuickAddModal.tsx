import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addTask } from '@/lib/analytics';
import { toast } from '@/hooks/use-toast';

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskAdded: () => void;
}

export function QuickAddModal({ open, onOpenChange, onTaskAdded }: QuickAddModalProps) {
  const [title, setTitle] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleAdd = () => {
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a task title',
        variant: 'destructive',
      });
      return;
    }

    const task = addTask({
      title: title.trim(),
      status: scheduledTime ? 'scheduled' : 'pending',
      createdAt: new Date().toISOString(),
      scheduledFor: scheduledTime ? new Date(scheduledTime).toISOString() : undefined,
      priority,
    });

    toast({
      title: '✅ Task added',
      description: scheduledTime ? `Scheduled for ${new Date(scheduledTime).toLocaleString()}` : 'Added to pending',
    });

    setTitle('');
    setScheduledTime('');
    setPriority('medium');
    onOpenChange(false);
    onTaskAdded();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Add Task</DialogTitle>
          <DialogDescription>Add a new task to your list</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              placeholder="Enter task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="task-time">Schedule (optional)</Label>
            <Input
              id="task-time"
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="task-priority">Priority</Label>
            <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
