import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, User, Shield, Database, CreditCard, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLocalTaskly } from '@/hooks/useLocalTaskly';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function Account() {
  const navigate = useNavigate();
  const { profile, prefs, setProfile, setPrefs, exportAll, resetAll } = useLocalTaskly();
  
  const [formData, setFormData] = useState(profile);
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [avatarPreview, setAvatarPreview] = useState(profile.avatar || '');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(profile);
    setIsDirty(changed);
  }, [formData, profile]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.displayName || formData.displayName.length < 2 || formData.displayName.length > 40) {
      errs.displayName = 'Display name must be 2-40 characters';
    }
    if (!formData.username || formData.username.length < 3 || /\s/.test(formData.username)) {
      errs.username = 'Username must be 3+ characters, no spaces';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setProfile(formData);
    toast({ title: '✅ Profile updated' });
    setIsDirty(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAvatarPreview(dataUrl);
      setFormData({ ...formData, avatar: dataUrl });
      setIsDirty(true);
    };
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    exportAll();
    toast({ title: '✅ Data exported' });
  };

  const handleDelete = () => {
    resetAll();
    toast({ title: '✅ All data deleted' });
    setTimeout(() => navigate('/'), 500);
  };

  const timezones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Sofia',
    'Asia/Tokyo', 'Asia/Dubai', 'Australia/Sydney', 'UTC'
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/20 bg-background/95 backdrop-blur-lg">
        <div className="flex h-16 items-center px-6 max-w-7xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />Back
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Account</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Profile */}
            <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="h-18 w-18 rounded-full object-cover" />
                    ) : (
                      <div className="h-18 w-18 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button variant="outline" size="sm" asChild>
                        <span>Upload</span>
                      </Button>
                    </Label>
                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Display Name</Label>
                  <Input value={formData.displayName} onChange={e => setFormData({ ...formData, displayName: e.target.value })} />
                  {errors.displayName && <p className="text-xs text-red-500">{errors.displayName}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                  {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={formData.email} disabled />
                  <p className="text-xs text-muted-foreground">Read-only in preview</p>
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Select value={formData.timezone} onValueChange={v => setFormData({ ...formData, timezone: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{timezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <div className="flex gap-2">
                    {['EN', 'BG', 'ES', 'FR'].map(lang => (
                      <Badge key={lang} variant={formData.language === lang ? 'default' : 'outline'} className="cursor-pointer" onClick={() => setFormData({ ...formData, language: lang })}>{lang}</Badge>
                    ))}
                  </div>
                </div>
                <Button onClick={handleSave} disabled={!isDirty} className="w-full">Save changes</Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Security */}
            <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" />Security</CardTitle>
                <CardDescription>Demo only — no backend</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between opacity-50">
                  <Label>Two-factor authentication</Label>
                  <Badge variant="outline">Demo only</Badge>
                </div>
                <Separator />
                <div>
                  <Label className="mb-2 block">Active Sessions</Label>
                  <div className="p-3 rounded-lg bg-muted/30 flex justify-between items-center">
                    <span className="text-sm">Current device · Active</span>
                    <Button size="sm" variant="outline" disabled>Sign out others</Button>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>App Lock</Label>
                  <Select value={prefs.appLock} onValueChange={v => setPrefs({ appLock: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Off">Off</SelectItem>
                      <SelectItem value="30s">30 seconds</SelectItem>
                      <SelectItem value="1m">1 minute</SelectItem>
                      <SelectItem value="5m">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Demo only</p>
                </div>
              </CardContent>
            </Card>

            {/* Data & Privacy */}
            <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" />Data & Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Badge variant="secondary">Storage: Local-first — we store structure only.</Badge>
                <Separator />
                <div className="flex gap-3">
                  <Button variant="outline" onClick={handleExport} className="flex-1">Export Data (JSON)</Button>
                  <Button variant="destructive" onClick={() => setDeleteConfirm(true)} className="flex-1">Delete All Data</Button>
                </div>
              </CardContent>
            </Card>

            {/* Billing */}
            <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Billing & Subscription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="font-medium">Current Plan: Free (Preview)</p>
                </div>
                <Button variant="outline" disabled className="w-full">Manage billing</Button>
              </CardContent>
            </Card>

            {/* Support & Danger Zone */}
            <Card className="rounded-xl border-red-500/20 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-red-500/20 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500"><AlertTriangle className="h-5 w-5" />Support & Danger Zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open('#', '_blank')}>Help Center</Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => window.location.href = 'mailto:support@taskly.app'}>Contact Support</Button>
                </div>
                <Separator />
                <Button variant="destructive" className="w-full" onClick={() => setDeleteConfirm(true)}>Delete Account</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete all data?</AlertDialogTitle>
            <AlertDialogDescription>This will clear all tasks, settings, and profile data. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
