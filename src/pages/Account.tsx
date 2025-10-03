import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Camera, 
  Globe, 
  Calendar, 
  Mail, 
  FileText, 
  Bell, 
  Shield, 
  Download, 
  Trash2, 
  Lock, 
  Info,
  CheckCircle,
  Volume2,
  Bot,
  Eye,
  Mic
} from 'lucide-react';

export default function Account() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Profile state
  const [displayName, setDisplayName] = useState(user?.email?.split('@')[0] || '');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [timezone, setTimezone] = useState('UTC-5 (Eastern)');
  const [language, setLanguage] = useState('EN');
  const [slogan, setSlogan] = useState('Report • Label • Automate');
  
  // Settings state
  const [robotVoice, setRobotVoice] = useState(false);
  const [expressions, setExpressions] = useState('Medium');
  const [showSpeakButton, setShowSpeakButton] = useState(false);
  const [watching, setWatching] = useState(true);
  
  
  // Notifications state
  const [reminders, setReminders] = useState(true);
  const [preBlockNudge, setPreBlockNudge] = useState(true);
  const [doneReceipts, setDoneReceipts] = useState(true);
  
  // Security state
  const [appLock, setAppLock] = useState('Off');
  
  // Save state
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!user) {
    return null;
  }

  const handleSave = () => {
    // Save all settings to localStorage
    localStorage.setItem('taskly-profile', JSON.stringify({
      displayName, username, email, timezone, language, slogan
    }));
    localStorage.setItem('taskly-settings', JSON.stringify({
      robotVoice, expressions, showSpeakButton, watching,
      reminders, preBlockNudge, doneReceipts,
      appLock
    }));
    
    setSaveSuccess(true);
    setHasChanges(false);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDeleteData = () => {
    // Clear all local data
    localStorage.removeItem('taskly-profile');
    localStorage.removeItem('taskly-settings');
    localStorage.removeItem('taskly-tasks');
    localStorage.removeItem('taskly-workflows');
  };

  const handleExportData = () => {
    const data = {
      profile: JSON.parse(localStorage.getItem('taskly-profile') || '{}'),
      settings: JSON.parse(localStorage.getItem('taskly-settings') || '{}'),
      tasks: JSON.parse(localStorage.getItem('taskly-tasks') || '[]'),
      workflows: JSON.parse(localStorage.getItem('taskly-workflows') || '[]')
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'taskly-data-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

        {/* A. Profile Card */}
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-semibold">Profile</h2>
          
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src="" />
                <AvatarFallback className="text-lg font-medium">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                variant="secondary" 
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 gap-2"
              >
                <Camera className="h-3 w-3" />
                Change
              </Button>
            </div>
            
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input 
                    id="displayName"
                    value={displayName}
                    onChange={(e) => { setDisplayName(e.target.value); setHasChanges(true); }}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setHasChanges(true); }}
                    placeholder="your-handle"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setHasChanges(true); }}
                    placeholder="your@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={(value) => { setTimezone(value); setHasChanges(true); }}>
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
              </div>
              
              <div className="flex items-center gap-4">
                <Label>Language</Label>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={language === 'EN' ? 'default' : 'outline'}
                    onClick={() => { setLanguage('EN'); setHasChanges(true); }}
                  >
                    EN
                  </Button>
                  <Button 
                    size="sm" 
                    variant={language === 'BG' ? 'default' : 'outline'}
                    onClick={() => { setLanguage('BG'); setHasChanges(true); }}
                  >
                    BG
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              disabled={!hasChanges}
              onClick={handleSave}
              className="gap-2"
            >
              {saveSuccess && <CheckCircle className="h-4 w-4" />}
              {saveSuccess ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </Card>

        {/* B. Personalization */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Personalization</h2>
          
          <div className="space-y-2">
            <Label htmlFor="slogan">Slogan under greeting</Label>
            <Input 
              id="slogan"
              value={slogan}
              onChange={(e) => { setSlogan(e.target.value); setHasChanges(true); }}
              placeholder="Report • Label • Automate"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Robot voice
                </Label>
                <p className="text-sm text-muted-foreground">Narration of replies</p>
              </div>
              <Switch 
                checked={robotVoice} 
                onCheckedChange={(checked) => { setRobotVoice(checked); setHasChanges(true); }} 
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Expression intensity
              </Label>
              <Select value={expressions} onValueChange={(value) => { setExpressions(value); setHasChanges(true); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Show Speak Button
                </Label>
                <p className="text-sm text-muted-foreground">Display voice input</p>
              </div>
              <Switch 
                checked={showSpeakButton} 
                onCheckedChange={(checked) => { setShowSpeakButton(checked); setHasChanges(true); }} 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Watching
                </Label>
                <p className="text-sm text-muted-foreground">Mirrors home bubble</p>
              </div>
              <Switch 
                checked={watching} 
                onCheckedChange={(checked) => { setWatching(checked); setHasChanges(true); }} 
              />
            </div>
          </div>
        </Card>


        {/* D. Notifications */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Reminders</Label>
              <Switch 
                checked={reminders} 
                onCheckedChange={(checked) => { setReminders(checked); setHasChanges(true); }} 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Pre-block nudge</Label>
                <p className="text-sm text-muted-foreground">5 min before focus blocks</p>
              </div>
              <Switch 
                checked={preBlockNudge} 
                onCheckedChange={(checked) => { setPreBlockNudge(checked); setHasChanges(true); }} 
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Done receipts</Label>
              <Switch 
                checked={doneReceipts} 
                onCheckedChange={(checked) => { setDoneReceipts(checked); setHasChanges(true); }} 
              />
            </div>
          </div>
        </Card>

        {/* E. Data & Privacy */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">Data & Privacy</h2>
          
          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm"><strong>Storage:</strong> Local-first</p>
              <p className="text-xs text-muted-foreground mt-1">
                You control your data. We only store structure (titles/links), not bodies.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 gap-2" onClick={handleExportData}>
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
                  <div className="space-y-4">
                    <Input placeholder="Type DELETE to confirm" />
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1">Cancel</Button>
                      <Button variant="destructive" onClick={handleDeleteData}>Delete</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>

        {/* F. Security */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>App lock</Label>
              <Select value={appLock} onValueChange={(value) => { setAppLock(value); setHasChanges(true); }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Off">Off</SelectItem>
                  <SelectItem value="Passcode">Passcode</SelectItem>
                  <SelectItem value="Biometric">Biometric</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" className="w-full gap-2">
              <Lock className="h-4 w-4" />
              Lock Now (Test)
            </Button>
          </div>
        </Card>

        {/* G. About */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Info className="h-5 w-5" />
            About
          </h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>Version</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>Build</span>
              <span>2024.12.001</span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">Help / FAQ</Button>
            <Button variant="outline" className="flex-1">Contact Support</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}