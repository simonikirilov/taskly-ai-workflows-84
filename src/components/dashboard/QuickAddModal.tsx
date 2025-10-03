import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useLocalTaskly } from '@/hooks/useLocalTaskly';

interface QuickAddModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAddModal({ open, onOpenChange }: QuickAddModalProps) {
  const { addTask } = useLocalTaskly();
  const [title, setTitle] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) return;
    
    addTask(title, scheduledFor || undefined);
    toast({ title: '✅ Task added' });
    setTitle('');
    setScheduledFor('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quick Add Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Task Title</Label>
            <Input 
              placeholder="What needs to be done?" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <div className="space-y-2">
            <Label>Schedule (optional)</Label>
            <Input 
              type="datetime-local" 
              value={scheduledFor} 
              onChange={(e) => setScheduledFor(e.target.value)}
            />
          </div>
          <Button onClick={handleSubmit} className="w-full">Add Task</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
