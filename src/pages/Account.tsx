import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Calendar, LogOut, ArrowLeft, Settings, Download, Shield, Mic, Palette, Flame, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const handleSignOut = () => {
    signOut();
  };

  const getProviderBadge = () => {
    if (user.app_metadata?.provider === 'google') {
      return <Badge variant="secondary">Google</Badge>;
    }
    return <Badge variant="secondary">Email</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-lg font-semibold">Account</h1>
          <div /> {/* Spacer for center alignment */}
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-2xl space-y-8">
        {/* Top Section: Avatar + Greeting + Streak */}
        <Card className="glass p-6">
          <div className="flex items-center space-x-6">
            <Avatar className="h-24 w-24 border-4 border-primary/20">
              <AvatarImage src="/placeholder.svg" alt="User Avatar" />
              <AvatarFallback className="bg-[var(--gradient-primary)] text-white text-lg">
                <User className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl font-bold">Hello, {user?.email?.split('@')[0] || 'User'}! 👋</h2>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Flame className="h-3 w-3" />
                  5 Day Streak
                </Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  {user?.email_confirmed_at ? "Verified" : "Free Plan"}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Account Details Section */}
        <div className="space-y-6">
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Account Details
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                <span className="text-sm font-medium">📧 Email</span>
                <span className="text-sm text-muted-foreground">{user?.email}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                <span className="text-sm font-medium">💎 Subscription</span>
                <Badge variant="secondary">Free Plan</Badge>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                <span className="text-sm font-medium">⚙️ Total Workflows</span>
                <span className="text-sm font-bold text-primary">12</span>
              </div>
              
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/20">
                <span className="text-sm font-medium">🤖 Agent Activity</span>
                <span className="text-sm font-bold text-accent">Active</span>
              </div>
            </div>
          </Card>

          {/* Preferences */}
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preferences
            </h3>
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start glass border-0">
                <Mic className="mr-3 h-4 w-4 text-primary" />
                🎤 Voice Settings
              </Button>
              
              <Button variant="outline" className="w-full justify-start glass border-0">
                <User className="mr-3 h-4 w-4 text-accent" />
                🤖 AI Tone & Personality
              </Button>
              
              <Button variant="outline" className="w-full justify-start glass border-0">
                <Palette className="mr-3 h-4 w-4 text-secondary-foreground" />
                🎨 Assistant Theme
              </Button>
              
              <Button variant="outline" className="w-full justify-start glass border-0">
                <Settings className="mr-3 h-4 w-4" />
                ✏️ Edit Profile
              </Button>
            </div>
          </Card>

          {/* Analytics */}
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Analytics
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="text-2xl font-bold text-primary">47</div>
                <div className="text-sm text-muted-foreground">🗣️ Most Used Commands</div>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-accent/5 border border-accent/10">
                <div className="text-2xl font-bold text-accent">3.2h</div>
                <div className="text-sm text-muted-foreground">⏱️ Daily Average</div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start glass border-0">
                <Download className="mr-3 h-4 w-4" />
                Export My Data
              </Button>
              
              <Button variant="outline" className="w-full justify-start glass border-0">
                <Shield className="mr-3 h-4 w-4" />
                Privacy Settings
              </Button>
              
              <Separator className="my-4" />
              
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full justify-start"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </Card>
        </div>

        {!user.email_confirmed_at && (
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <Mail className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Please check your email to verify your account
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}