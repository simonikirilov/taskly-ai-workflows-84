import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStore } from '@/hooks/useLocalStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Moon, Mic, MessageCircle, Bell, Shield, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state, updateState } = useLocalStore();
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    // Sync dark mode with document
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  const handleDarkModeToggle = (enabled: boolean) => {
    updateState({ darkMode: enabled });
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    toast({
      title: enabled ? "Dark mode enabled" : "Light mode enabled",
    });
  };

  const handleDeleteAllData = () => {
    if (deleteConfirmText !== 'DELETE') {
      toast({
        title: "Confirmation required",
        description: "Please type DELETE to confirm",
        variant: "destructive",
      });
      return;
    }
    
    localStorage.removeItem('taskly-profile');
    localStorage.removeItem('taskly-activities');
    localStorage.removeItem('taskly-suggestions');
    localStorage.removeItem('taskly-local-store');
    setDeleteConfirmText('');
    
    toast({
      title: "✅ Data deleted",
      description: "All local data has been cleared",
    });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/20 bg-background/95 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-6 max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')} 
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Configure your experience</p>
        </div>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Customize how Taskly looks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="dark-mode" className="text-base font-medium">
                  Enable Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={state.darkMode}
                onCheckedChange={handleDarkModeToggle}
              />
            </div>
          </CardContent>
        </Card>

        {/* Voice & AI Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Voice & AI
            </CardTitle>
            <CardDescription>Configure voice input and AI assistant behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="auto-process" className="text-base font-medium">
                  Auto Process Voice Input
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically convert speech to tasks
                </p>
              </div>
              <Switch
                id="auto-process"
                checked={state.autoProcessVoice}
                onCheckedChange={(checked) => {
                  updateState({ autoProcessVoice: checked });
                  toast({
                    title: checked ? "Auto-process enabled" : "Manual confirmation enabled",
                    description: checked 
                      ? "Voice commands will be automatically converted" 
                      : "You'll confirm voice commands before creating tasks",
                  });
                }}
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <Label className="text-base font-medium">Assistant Tone</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose how Taskly communicates with you
              </p>
              <Select 
                value={state.assistantTone} 
                onValueChange={(value: any) => {
                  updateState({ assistantTone: value });
                  toast({
                    title: "Assistant tone updated",
                    description: `Taskly will use a ${value} tone`,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="concise">Concise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-base font-medium">Default Input</Label>
              <p className="text-sm text-muted-foreground">
                Choose your preferred input method
              </p>
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  variant={state.defaultInput === 'speak' ? 'default' : 'outline'}
                  onClick={() => {
                    updateState({ defaultInput: 'speak' });
                    toast({ title: "Default input set to Speak" });
                  }}
                  className="flex-1"
                >
                  Speak
                </Button>
                <Button 
                  size="sm"
                  variant={state.defaultInput === 'type' ? 'default' : 'outline'}
                  onClick={() => {
                    updateState({ defaultInput: 'type' });
                    toast({ title: "Default input set to Type" });
                  }}
                  className="flex-1"
                >
                  Type
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="task-completion" className="text-base font-medium">
                  Task Completion Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when Taskly AI completes a task
                </p>
              </div>
              <Switch
                id="task-completion"
                checked={state.taskCompletionNotifications}
                onCheckedChange={(checked) => {
                  updateState({ taskCompletionNotifications: checked });
                  toast({
                    title: checked ? "Task notifications enabled" : "Task notifications disabled",
                  });
                }}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="reminders" className="text-base font-medium">
                  Reminders / Nudges
                </Label>
                <p className="text-sm text-muted-foreground">
                  Get reminders for unfinished or upcoming tasks
                </p>
              </div>
              <Switch
                id="reminders"
                checked={state.reminders}
                onCheckedChange={(checked) => {
                  updateState({ reminders: checked });
                  toast({
                    title: checked ? "Reminders enabled" : "Reminders disabled",
                  });
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Section */}
        <Card id="privacy-section">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy
            </CardTitle>
            <CardDescription>Control what data is collected and stored</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  Log structure only (titles/links)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Always on — we never store task bodies
                </p>
              </div>
              <Badge variant="secondary">Always On</Badge>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-medium">
                  Microphone Permission
                </Label>
                <p className="text-sm text-muted-foreground">
                  Required for voice commands
                </p>
              </div>
              <Badge 
                variant={
                  state.microphonePermission === 'granted' ? 'default' :
                  state.microphonePermission === 'denied' ? 'destructive' :
                  'secondary'
                }
              >
                {state.microphonePermission === 'granted' ? 'Granted' :
                 state.microphonePermission === 'denied' ? 'Denied' :
                 'Ask'}
              </Badge>
            </div>

            <Separator />

            <div className="pt-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete All Data
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete All Data</DialogTitle>
                    <DialogDescription>
                      This action cannot be undone. Type "DELETE" to confirm.
                    </DialogDescription>
                  </DialogHeader>
                  <Input 
                    placeholder="Type DELETE to confirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                  />
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={() => setDeleteConfirmText('')}>
                      Cancel
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAllData}
                      disabled={deleteConfirmText !== 'DELETE'}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}