import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Camera, Download, Trash2, Shield, Database, CreditCard, HelpCircle, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getJSON, setJSON, clearTasklyData } from '@/lib/localStorage';

interface Preferences {
  slogan: string;
  assistantVoice: boolean;
  expressionIntensity: 'subtle' | 'medium' | 'expressive';
  theme: 'dark' | 'light' | 'system';
  notificationSummary: 'daily' | 'off';
  showSpeakButton: boolean;
}

export default function Account() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Profile state
  const prefs = getJSON<Preferences>('taskly:prefs', {
    slogan: 'Record • Label • Automate',
    assistantVoice: true,
    expressionIntensity: 'medium',
    theme: 'dark',
    notificationSummary: 'daily',
    showSpeakButton: true,
  });
  
  const [displayName, setDisplayName] = useState(user?.email?.split('@')[0] || '');
  const [username, setUsername] = useState('');
  const [email] = useState(user?.email || '');
  const [timezone, setTimezone] = useState('UTC-5 (Eastern)');
  const [language, setLanguage] = useState('EN');
  const [hasProfileChanges, setHasProfileChanges] = useState(false);
  
  // Preferences
  const [slogan, setSlogan] = useState(prefs.slogan);
  const [assistantVoice, setAssistantVoice] = useState(prefs.assistantVoice);
  const [expressionIntensity, setExpressionIntensity] = useState(prefs.expressionIntensity);
  const [theme, setTheme] = useState(prefs.theme);
  const [notificationSummary, setNotificationSummary] = useState(prefs.notificationSummary);
  const [showSpeakButton, setShowSpeakButton] = useState(prefs.showSpeakButton);
  
  // Security
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [appLock, setAppLock] = useState<'off' | '30s' | '1m' | '5m'>('off');
  
  // Billing
  const [couponCode, setCouponCode] = useState('');
  
  // Delete confirmation
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState('');

  const handleProfileChange = (field: string, value: any) => {
    setHasProfileChanges(true);
    switch (field) {
      case 'displayName':
        setDisplayName(value);
        break;
      case 'username':
        setUsername(value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
        break;
      case 'timezone':
        setTimezone(value);
        break;
      case 'language':
        setLanguage(value);
        break;
    }
  };

  const handleSaveProfile = () => {
    setJSON('taskly:profile', {
      displayName,
      username,
      email,
      timezone,
      language,
    });
    
    setHasProfileChanges(false);
    toast({
      title: '✅ Profile updated',
      description: 'Your changes have been saved',
    });
  };
  
  const handleSavePreferences = () => {
    setJSON('taskly:prefs', {
      slogan,
      assistantVoice,
      expressionIntensity,
      theme,
      notificationSummary,
      showSpeakButton,
    });
    
    toast({
      title: '✅ Preferences updated',
      description: 'Your preferences have been saved',
    });
  };

  const handleExportData = () => {
    const data = {
      tasks: getJSON('taskly:tasks', []),
      prefs: getJSON('taskly:prefs', {}),
      analytics: getJSON('taskly:analytics', {}),
      profile: getJSON('taskly:profile', {}),
      version: '1.0.0',
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskly-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: '✅ Data exported',
      description: 'Your data has been downloaded as JSON',
    });
  };

  const handleDeleteData = () => {
    if (deleteConfirmText !== 'DELETE') {
      toast({
        title: 'Confirmation required',
        description: 'Please type DELETE to confirm',
        variant: 'destructive',
      });
      return;
    }
    
    clearTasklyData();
    setDeleteConfirmText('');
    
    toast({
      title: '✅ Data deleted',
      description: 'All local data has been cleared',
    });
  };
  
  const handleDeleteAccount = () => {
    if (deleteAccountConfirm !== 'DELETE') {
      toast({
        title: 'Confirmation required',
        description: 'Please type DELETE to confirm',
        variant: 'destructive',
      });
      return;
    }
    
    clearTasklyData();
    toast({
      title: '✅ Account deleted',
      description: 'All data has been cleared',
    });
    navigate('/');
  };

  const handleSignOutOthers = () => {
    toast({
      title: '✅ Sessions cleared',
      description: 'Other sessions have been signed out',
    });
  };
  
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    toast({
      title: '✅ Coupon applied',
      description: `Coupon "${couponCode}" has been applied`,
    });
    setCouponCode('');
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
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-muted-foreground"
            >
              Account
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Account</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>
        
        {/* Two-column layout on desktop, stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left Column */}
          <div className="space-y-6">
            {/* 1. Profile Card */}
            <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
              <CardHeader>
                <CardTitle className="text-xl">Profile</CardTitle>
                <CardDescription>Your personal information and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-lg font-medium">
                        {displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 gap-1 text-xs h-7"
                    >
                      <Camera className="h-3 w-3" />
                      Upload
                    </Button>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input 
                          id="displayName"
                          value={displayName}
                          onChange={(e) => handleProfileChange('displayName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input 
                          id="username"
                          value={username}
                          onChange={(e) => handleProfileChange('username', e.target.value)}
                          placeholder="your-handle"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email"
                        value={email}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select value={timezone} onValueChange={(v) => handleProfileChange('timezone', v)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC-8 (Pacific)">UTC-8 (Pacific)</SelectItem>
                            <SelectItem value="UTC-7 (Mountain)">UTC-7 (Mountain)</SelectItem>
                            <SelectItem value="UTC-6 (Central)">UTC-6 (Central)</SelectItem>
                            <SelectItem value="UTC-5 (Eastern)">UTC-5 (Eastern)</SelectItem>
                            <SelectItem value="UTC+2 (Sofia)">UTC+2 (Sofia)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant={language === 'EN' ? 'default' : 'outline'}
                            onClick={() => handleProfileChange('language', 'EN')}
                            className="flex-1"
                          >
                            EN
                          </Button>
                          <Button 
                            size="sm" 
                            variant={language === 'BG' ? 'default' : 'outline'}
                            onClick={() => handleProfileChange('language', 'BG')}
                            className="flex-1"
                          >
                            BG
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t">
                  <Button 
                    disabled={!hasProfileChanges}
                    onClick={handleSaveProfile}
                  >
                    Save changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 2. Preferences Card */}
            <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
              <CardHeader>
                <CardTitle className="text-xl">Preferences</CardTitle>
                <CardDescription>Customize your Taskly experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Personalization</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slogan">Slogan under greeting</Label>
                    <Input
                      id="slogan"
                      value={slogan}
                      onChange={(e) => setSlogan(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Assistant voice narration</Label>
                      <p className="text-sm text-muted-foreground">Enable voice responses</p>
                    </div>
                    <Switch checked={assistantVoice} onCheckedChange={setAssistantVoice} />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Expression intensity</Label>
                    <Select value={expressionIntensity} onValueChange={(v: any) => setExpressionIntensity(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subtle">Subtle</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="expressive">Expressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">App Preferences</h3>
                  
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select value={theme} onValueChange={(v: any) => setTheme(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Notification summary</Label>
                    <Select value={notificationSummary} onValueChange={(v: any) => setNotificationSummary(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="off">Off</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label>Show Speak Button</Label>
                      <p className="text-sm text-muted-foreground">Display voice input button</p>
                    </div>
                    <Switch checked={showSpeakButton} onCheckedChange={setShowSpeakButton} />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button onClick={handleSavePreferences}>Save preferences</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* 3. Security Card */}
            <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>Manage authentication and active sessions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Two-factor authentication</Label>
                    <p className="text-sm text-muted-foreground">Demo only — no backend</p>
                  </div>
                  <Switch 
                    checked={twoFactorAuth}
                    onCheckedChange={(checked) => {
                      setTwoFactorAuth(checked);
                      toast({
                        title: checked ? '2FA enabled' : '2FA disabled',
                        description: 'Demo only',
                      });
                    }}
                  />
                </div>

                <Separator />

                <div>
                  <Label className="mb-3 block">Active sessions</Label>
                  <div className="p-3 rounded-lg bg-muted/30 mb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Current device</p>
                        <p className="text-xs text-muted-foreground">Last active: Now</p>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleSignOutOthers}
                  >
                    Sign out others
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>App lock</Label>
                  <p className="text-sm text-muted-foreground">Demo only — no actual locking</p>
                  <Select value={appLock} onValueChange={(v: any) => {
                    setAppLock(v);
                    toast({
                      title: 'App lock updated',
                      description: `Set to ${v}`,
                    });
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="off">Off</SelectItem>
                      <SelectItem value="30s">30 seconds</SelectItem>
                      <SelectItem value="1m">1 minute</SelectItem>
                      <SelectItem value="5m">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 4. Data & Privacy Card */}
            <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Database className="h-5 w-5" />
                  Data & Privacy
                </CardTitle>
                <CardDescription>Control your data and privacy settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <p className="text-sm font-medium mb-1">Storage: Local-first</p>
                  <p className="text-xs text-muted-foreground">
                    We store structure only in this preview. Your data stays on your device.
                  </p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    variant="outline" 
                    className="gap-2 justify-start"
                    onClick={handleExportData}
                  >
                    <Download className="h-4 w-4" />
                    Export Data (JSON)
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="gap-2 justify-start">
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
                          onClick={handleDeleteData}
                          disabled={deleteConfirmText !== 'DELETE'}
                        >
                          Delete
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <Separator />

                <Button 
                  variant="link" 
                  className="px-0"
                  onClick={() => {
                    navigate('/settings');
                    setTimeout(() => {
                      document.getElementById('privacy-section')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  Privacy choices →
                </Button>
              </CardContent>
            </Card>

            {/* 5. Billing & Subscription Card */}
            <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <CreditCard className="h-5 w-5" />
                  Billing & Subscription
                </CardTitle>
                <CardDescription>Manage your subscription and payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-lg bg-muted/50 border">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Current Plan</p>
                    <Badge>Free (Preview)</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This is a preview build. Billing is not active.
                  </p>
                </div>

                <div className="space-y-3">
                  <Button variant="outline" disabled className="w-full">
                    Manage billing
                  </Button>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button variant="secondary" onClick={handleApplyCoupon}>
                      Apply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 6. Support & Danger Zone Card */}
            <Card className="rounded-xl border-white/10 bg-zinc-900/60 backdrop-blur hover:ring-1 ring-white/10 transition-all">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <HelpCircle className="h-5 w-5" />
                  Support & Danger Zone
                </CardTitle>
                <CardDescription>Get help or delete your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="#">Help Center</a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href="mailto:support@taskly.app">Contact Support</a>
                  </Button>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-destructive">Danger Zone</p>
                      <p className="text-muted-foreground">This action cannot be undone</p>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        Delete account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Delete Account</DialogTitle>
                        <DialogDescription>
                          This will clear all local data and cannot be undone. Type "DELETE" to confirm.
                        </DialogDescription>
                      </DialogHeader>
                      <Input 
                        placeholder="Type DELETE to confirm"
                        value={deleteAccountConfirm}
                        onChange={(e) => setDeleteAccountConfirm(e.target.value)}
                      />
                      <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleteAccountConfirm('')}>
                          Cancel
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleDeleteAccount}
                          disabled={deleteAccountConfirm !== 'DELETE'}
                        >
                          Delete Account
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
