import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles, Settings2, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getJSON, setJSON } from '@/lib/localStorage';

interface Preferences {
  assistantTone: 'friendly' | 'professional' | 'playful';
  autoProcessVoice: boolean;
  watchingBubble: boolean;
  theme: 'dark' | 'light' | 'system';
  enableReminders: boolean;
  taskCompletionNotifications: boolean;
  language: 'EN' | 'BG';
  betaFeatures: string[];
}

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const defaultPrefs: Preferences = {
    assistantTone: 'friendly',
    autoProcessVoice: true,
    watchingBubble: true,
    theme: 'dark',
    enableReminders: true,
    taskCompletionNotifications: true,
    language: 'EN',
    betaFeatures: [],
  };
  
  const [prefs, setPrefs] = useState<Preferences>(() => getJSON('taskly:prefs', defaultPrefs));

  useEffect(() => {
    if (prefs.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (prefs.theme === 'light') {
      document.documentElement.classList.remove('dark');
    }
  }, [prefs.theme]);

  const updatePref = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    setJSON('taskly:prefs', updated);
  };

  const toggleBetaFeature = (feature: string) => {
    const updated = prefs.betaFeatures.includes(feature)
      ? prefs.betaFeatures.filter(f => f !== feature)
      : [...prefs.betaFeatures, feature];
    updatePref('betaFeatures', updated);
    toast({
      title: updated.includes(feature) ? '✅ Feature enabled' : 'Feature disabled',
      description: feature,
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/20 bg-background/95 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-6 max-w-4xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Configure your Taskly experience</p>
        </div>

        {/* Assistant & Personalization */}
        <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-5 w-5" />Assistant & Personalization</CardTitle>
            <CardDescription>Customize your AI assistant behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Assistant Tone</Label>
              <Select value={prefs.assistantTone} onValueChange={(v: any) => { updatePref('assistantTone', v); toast({ title: 'Tone updated' }); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="playful">Playful</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div><Label>Auto-process voice input</Label><p className="text-sm text-muted-foreground">Convert speech to tasks automatically</p></div>
              <Switch checked={prefs.autoProcessVoice} onCheckedChange={(c) => updatePref('autoProcessVoice', c)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div><Label>Watching bubble</Label><p className="text-sm text-muted-foreground">Show animated assistant</p></div>
              <Switch checked={prefs.watchingBubble} onCheckedChange={(c) => updatePref('watchingBubble', c)} />
            </div>
          </CardContent>
        </Card>

        {/* App Preferences */}
        <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Settings2 className="h-5 w-5" />App Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Theme</Label>
              <Select value={prefs.theme} onValueChange={(v: any) => { updatePref('theme', v); if (v === 'dark') document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark'); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="dark">Dark</SelectItem><SelectItem value="light">Light</SelectItem><SelectItem value="system">System</SelectItem></SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div><Label>Enable Reminders</Label></div>
              <Switch checked={prefs.enableReminders} onCheckedChange={(c) => updatePref('enableReminders', c)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div><Label>Task notifications</Label></div>
              <Switch checked={prefs.taskCompletionNotifications} onCheckedChange={(c) => updatePref('taskCompletionNotifications', c)} />
            </div>
            <Separator />
            <div className="flex gap-2">
              <Button size="sm" variant={prefs.language === 'EN' ? 'default' : 'outline'} onClick={() => updatePref('language', 'EN')} className="flex-1">EN</Button>
              <Button size="sm" variant={prefs.language === 'BG' ? 'default' : 'outline'} onClick={() => updatePref('language', 'BG')} className="flex-1">BG</Button>
            </div>
          </CardContent>
        </Card>

        {/* Advanced */}
        <Card id="privacy-section" className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5" />Advanced</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Beta Features</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Smart Suggestions v2', 'Live Transcribe', 'Quick Actions'].map((f) => (
                  <Badge key={f} variant={prefs.betaFeatures.includes(f) ? 'default' : 'outline'} className="cursor-pointer" onClick={() => toggleBetaFeature(f)}>{f}</Badge>
                ))}
              </div>
            </div>
            <Separator />
            <Button variant="outline" onClick={() => toast({ title: '✅ Tutorials reset' })}>Reset tutorials</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
