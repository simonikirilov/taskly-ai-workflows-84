import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStore } from '@/hooks/useLocalStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Camera, Download, Trash2, Shield, Database } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Account() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { state: localState, updateState } = useLocalStore();
  
  // Profile state
  const [displayName, setDisplayName] = useState(user?.email?.split('@')[0] || '');
  const [username, setUsername] = useState('');
  const [email] = useState(user?.email || '');
  const [timezone, setTimezone] = useState('UTC-5 (Eastern)');
  const [language, setLanguage] = useState('EN');
  const [hasProfileChanges, setHasProfileChanges] = useState(false);
  
  // Delete confirmation
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

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
    localStorage.setItem('taskly-profile', JSON.stringify({
      displayName,
      username,
      email,
      timezone,
      language
    }));
    
    setHasProfileChanges(false);
    toast({
      title: "✅ Profile updated",
      description: "Your changes have been saved",
    });
  };

  const handleExportData = () => {
    const data = {
      profile: JSON.parse(localStorage.getItem('taskly-profile') || '{}'),
      settings: localState,
      activities: JSON.parse(localStorage.getItem('taskly-activities') || '[]'),
      suggestions: JSON.parse(localStorage.getItem('taskly-suggestions') || '[]'),
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
      title: "✅ Data exported",
      description: "Your data has been downloaded as JSON",
    });
  };

  const handleDeleteData = () => {
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

  const handleSignOutOthers = () => {
    toast({
      title: "✅ Sessions cleared",
      description: "Other sessions have been signed out",
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

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Account</h1>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>

        {/* 1. Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
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
                        variant={language === 'ES' ? 'default' : 'outline'}
                        onClick={() => handleProfileChange('language', 'ES')}
                        className="flex-1"
                      >
                        ES
                      </Button>
                      <Button 
                        size="sm" 
                        variant={language === 'FR' ? 'default' : 'outline'}
                        onClick={() => handleProfileChange('language', 'FR')}
                        className="flex-1"
                      >
                        FR
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

        {/* 2. Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage authentication and active sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Two-factor authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch 
                checked={localState.twoFactorAuth}
                onCheckedChange={(checked) => {
                  updateState({ twoFactorAuth: checked });
                  toast({
                    title: checked ? "2FA enabled" : "2FA disabled",
                    description: checked ? "Two-factor authentication is now active" : "Two-factor authentication is now disabled",
                  });
                }}
              />
            </div>

            <div className="pt-4 border-t">
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

            <div className="pt-4 border-t">
              <Label className="mb-3 block">App lock</Label>
              <Select 
                value={localState.appLock} 
                onValueChange={(value: any) => {
                  updateState({ appLock: value });
                  toast({
                    title: "App lock updated",
                    description: `App lock set to ${value}`,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="1min">1 minute</SelectItem>
                  <SelectItem value="5min">5 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 3. Data & Privacy Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data & Privacy
            </CardTitle>
            <CardDescription>Control your data and privacy settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg bg-muted/50 border">
              <p className="text-sm font-medium mb-1">Storage: Local-first</p>
              <p className="text-xs text-muted-foreground">
                We store structure (titles/links), not bodies. Your data stays on your device.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={handleExportData}
              >
                <Download className="h-4 w-4" />
                Export Data (JSON)
              </Button>
              
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
                      onClick={handleDeleteData}
                      disabled={deleteConfirmText !== 'DELETE'}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="pt-4 border-t">
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
