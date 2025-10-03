import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transcribedText: string;
  suggestedTask: string;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  transcribedText,
  suggestedTask,
}: ConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="elevated-card">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            🤔 Did you mean this?
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                You said:
              </p>
              <p className="text-foreground">"{transcribedText}"</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-primary mb-1">
                I'll create this task:
              </p>
              <p className="text-foreground font-medium">"{suggestedTask}"</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>No, cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-primary hover:bg-primary/90">
            Yes, create task
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}