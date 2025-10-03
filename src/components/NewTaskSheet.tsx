import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { ParsedTask } from '@/utils/parseSpokenTask';

interface NewTaskSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parsedTask: ParsedTask | null;
  onSave: (title: string, scheduledFor?: string) => void;
}

export function NewTaskSheet({ open, onOpenChange, parsedTask, onSave }: NewTaskSheetProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('09:00');

  useEffect(() => {
    if (parsedTask) {
      setTitle(parsedTask.title);
      if (parsedTask.when) {
        const scheduledDate = new Date(parsedTask.when);
        setDate(scheduledDate);
        setTime(format(scheduledDate, 'HH:mm'));
      } else {
        setDate(undefined);
        setTime('09:00');
      }
    }
  }, [parsedTask]);

  const handleSave = () => {
    if (!title.trim()) return;

    let scheduledFor: string | undefined;
    if (date) {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduled = new Date(date);
      scheduled.setHours(hours, minutes, 0, 0);
      scheduledFor = scheduled.toISOString();
    }

    onSave(title.trim(), scheduledFor);
    onOpenChange(false);
  };

  const handleDiscard = () => {
    setTitle('');
    setDate(undefined);
    setTime('09:00');
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[90vh]">
        <SheetHeader>
          <SheetTitle>Confirm Task</SheetTitle>
          <SheetDescription>
            Review and edit your task details
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="task-title">Task Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="text-base"
              autoFocus
            />
          </div>

          {/* Date Picker */}
          <div className="space-y-2">
            <Label>Schedule (optional)</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {date && (
                <div className="flex items-center gap-2 px-3 border rounded-md">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="border-0 p-0 h-auto focus-visible:ring-0 w-24"
                  />
                </div>
              )}
            </div>
            {date && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDate(undefined)}
                className="text-xs"
              >
                Clear schedule
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleDiscard}
              className="flex-1"
            >
              Discard
            </Button>
            <Button
              onClick={handleSave}
              disabled={!title.trim()}
              className="flex-1"
            >
              Save Task
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
