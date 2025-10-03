import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Settings2, Zap, CreditCard, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLocalTaskly } from '@/hooks/useLocalTaskly';
import { storage } from '@/lib/storage';

export default function Settings() {
  const navigate = useNavigate();
  const { prefs, setPrefs } = useLocalTaskly();
  const [saved, setSaved] = useState(false);

  const updatePref = (updates: any) => {
    setPrefs(updates);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const toggleBeta = (feature: string) => {
    const updated = { ...prefs.beta, [feature]: !prefs.beta[feature] };
    updatePref({ beta: updated });
  };

  const resetTutorials = () => {
    storage.clear('tutorials');
    toast({ title: '✅ Tutorials reset' });
  };

  useEffect(() => {
    if (prefs.ui.theme === 'Dark') {
      document.documentElement.classList.add('dark');
    } else if (prefs.ui.theme === 'Light') {
      document.documentElement.classList.remove('dark');
    }
  }, [prefs.ui.theme]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/20 bg-background/95 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-6 max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />Back
          </Button>
          {saved && <div className="flex items-center gap-2 text-sm text-green-500"><CheckCircle className="h-4 w-4" />Saved</div>}
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Configure your Taskly experience</p>
        </div>

        {/* Assistant & Personalization */}
        <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" />Assistant & Personalization</CardTitle>
            <CardDescription>Customize your AI assistant behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Assistant Tone</Label>
              <Select value={prefs.ai.tone} onValueChange={v => updatePref({ ai: { ...prefs.ai, tone: v } })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Friendly">Friendly</SelectItem>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Playful">Playful</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-process voice input</Label>
                <p className="text-sm text-muted-foreground">Convert speech to tasks automatically</p>
              </div>
              <Switch checked={prefs.ai.autoProcess} onCheckedChange={c => updatePref({ ai: { ...prefs.ai, autoProcess: c } })} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Watching bubble</Label>
                <p className="text-sm text-muted-foreground">Show animated assistant</p>
              </div>
              <Switch checked={prefs.ui.watchBubble} onCheckedChange={c => updatePref({ ui: { ...prefs.ui, watchBubble: c } })} />
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" />App Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select value={prefs.ui.theme} onValueChange={v => {
                updatePref({ ui: { ...prefs.ui, theme: v } });
                if (v === 'Dark') document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dark">Dark</SelectItem>
                  <SelectItem value="Light">Light</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label>Enable Reminders</Label>
              <Switch checked={prefs.reminders.enabled} onCheckedChange={c => updatePref({ reminders: { enabled: c } })} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <Label>Task completion notifications</Label>
              <Switch checked={prefs.notifications.tasks} onCheckedChange={c => updatePref({ notifications: { tasks: c } })} />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Language</Label>
              <div className="flex gap-2">
                {['EN', 'BG'].map(lang => (
                  <Badge key={lang} variant={prefs.locale === lang ? 'default' : 'outline'} className="cursor-pointer" onClick={() => updatePref({ locale: lang })}>{lang}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advanced */}
        <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" />Advanced</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Beta Features</Label>
              <div className="flex flex-wrap gap-2">
                {['Smart Suggestions v2', 'Live Transcribe', 'Quick Actions'].map(f => (
                  <Badge key={f} variant={prefs.beta[f] ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleBeta(f)}>{f}</Badge>
                ))}
              </div>
            </div>
            <Separator />
            <Button variant="outline" onClick={resetTutorials}>Reset tutorials</Button>
          </CardContent>
        </Card>

        {/* Billing & Subscription */}
        <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Billing & Subscription</CardTitle>
            <CardDescription>Preview mode — no real billing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/30">
              <p className="font-medium">Current Plan: Free (Preview)</p>
            </div>
            <Button variant="outline" disabled className="w-full">Manage billing</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
