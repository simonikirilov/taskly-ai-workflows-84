import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { LogOut, Settings as SettingsIcon, Moon, Bell, Mic, MessageCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const { user, loading, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [taskReminders, setTaskReminders] = useState(true);
  const [autoProcessVoice, setAutoProcessVoice] = useState(true);
  const [assistantTone, setAssistantTone] = useState('friendly');

  useEffect(() => {
    // Check current dark mode state
    const isDarkMode = document.documentElement.classList.contains('dark');
    setDarkMode(isDarkMode);

    // Load saved preferences
    const savedPreferences = localStorage.getItem('taskly-user-preferences');
    if (savedPreferences) {
      const preferences = JSON.parse(savedPreferences);
      setTaskReminders(preferences.taskReminders ?? true);
      setAutoProcessVoice(preferences.autoProcessVoice ?? true);
      setAssistantTone(preferences.assistantTone ?? 'friendly');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-12 w-12 border-b-2 border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    savePreferences({ darkMode: enabled });
  };

  const handleTaskRemindersToggle = (enabled: boolean) => {
    setTaskReminders(enabled);
    savePreferences({ taskReminders: enabled });
    toast({
      title: enabled ? "Task reminders enabled" : "Task reminders disabled",
      description: enabled ? "You'll receive notifications for upcoming tasks" : "Task notifications are now disabled",
    });
  };

  const handleAutoProcessToggle = (enabled: boolean) => {
    setAutoProcessVoice(enabled);
    savePreferences({ autoProcessVoice: enabled });
    toast({
      title: enabled ? "Auto-processing enabled" : "Manual confirmation enabled",
      description: enabled ? "Voice commands will be automatically converted to tasks" : "You'll confirm voice commands before creating tasks",
    });
  };

  const handleAssistantToneChange = (tone: string) => {
    setAssistantTone(tone);
    savePreferences({ assistantTone: tone });
    toast({
      title: "Assistant tone updated",
      description: `Taskly will now use a ${tone} tone in responses`,
    });
  };

  const savePreferences = (updates: any) => {
    const currentPreferences = JSON.parse(localStorage.getItem('taskly-user-preferences') || '{}');
    const newPreferences = { ...currentPreferences, ...updates };
    localStorage.setItem('taskly-user-preferences', JSON.stringify(newPreferences));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You've been logged out of Taskly",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <SettingsIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Appearance Settings */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how Taskly looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dark-mode" className="text-base font-medium">
                    Enable Dark Mode
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={handleDarkModeToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications Settings */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="task-completion-notifications" className="text-base font-medium">
                    Enable Task Completion Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when Taskly AI completes a task for you
                  </p>
                </div>
                <Switch
                  id="task-completion-notifications"
                  checked={taskReminders}
                  onCheckedChange={handleTaskRemindersToggle}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enable-reminders" className="text-base font-medium">
                    Enable Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminders for unfinished or upcoming tasks
                  </p>
                </div>
                <Switch
                  id="enable-reminders"
                  checked={taskReminders}
                  onCheckedChange={handleTaskRemindersToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Voice & AI Settings */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Voice & AI
              </CardTitle>
              <CardDescription>
                Configure voice input and AI assistant behavior
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-process-voice" className="text-base font-medium">
                    Auto Process Voice Input
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically convert voice commands to tasks
                  </p>
                </div>
                <Switch
                  id="auto-process-voice"
                  checked={autoProcessVoice}
                  onCheckedChange={handleAutoProcessToggle}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <Label htmlFor="assistant-tone" className="text-base font-medium">
                    Assistant Tone
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Choose how Taskly communicates with you
                </p>
                <Select value={assistantTone} onValueChange={handleAssistantToneChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select assistant tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="motivational">Motivational</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>
                Manage your account and session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleSignOut}
                className="w-full sm:w-auto"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;