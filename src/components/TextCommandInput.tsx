import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send, Type } from 'lucide-react';

interface TextCommandInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (command: string) => void;
  placeholder?: string;
}

export function TextCommandInput({ isOpen, onClose, onSubmit, placeholder = "Type your command..." }: TextCommandInputProps) {
  const [command, setCommand] = useState('');

  const handleSubmit = () => {
    if (command.trim()) {
      onSubmit(command.trim());
      setCommand('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Type className="h-5 w-5 text-primary" />
            Type Your Command
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[100px] resize-none"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!command.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send Command
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}