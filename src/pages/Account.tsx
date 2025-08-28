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
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="flex h-20 items-center justify-between px-6">
          <button 
            onClick={() => navigate('/')} 
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Page Title */}
      <div className="flex justify-center py-6">
        <h1 className="text-4xl font-bold text-foreground">Account</h1>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-2xl space-y-8">
        {/* Top Section: Avatar + Greeting + Streak */}
        <Card className="glass p-6">
          <div className="flex items-center space-x-6">
            <button className="group relative">
              <Avatar className="h-24 w-24 border-4 border-primary/20 cursor-pointer group-hover:border-primary/40 transition-all">
                <AvatarImage src="/placeholder.svg" alt="User Avatar" />
                <AvatarFallback className="bg-[var(--gradient-primary)] text-white text-lg">
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
            </button>
            
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl font-bold">Hello, {user?.email?.split('@')[0]?.charAt(0).toUpperCase() + user?.email?.split('@')[0]?.slice(1) || 'User'}! 👋</h2>
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
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Analytics
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="group text-center p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/40 transition-all duration-300 cursor-pointer hover:scale-105">
                <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform">47</div>
                <div className="text-sm text-muted-foreground">🗣️ Most Used Commands</div>
              </div>
              
              <div className="group text-center p-6 rounded-xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 hover:border-accent/40 transition-all duration-300 cursor-pointer hover:scale-105">
                <div className="text-3xl font-bold text-accent mb-2 group-hover:scale-110 transition-transform">3.2h</div>
                <div className="text-sm text-muted-foreground">⏱️ Daily Average</div>
              </div>
              
              <div className="group text-center p-6 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 hover:border-secondary/40 transition-all duration-300 cursor-pointer hover:scale-105">
                <div className="text-3xl font-bold text-secondary mb-2 group-hover:scale-110 transition-transform">36%</div>
                <div className="text-sm text-muted-foreground">📊 Top Category</div>
              </div>
              
              <div className="group text-center p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 cursor-pointer hover:scale-105">
                <div className="text-3xl font-bold text-green-500 mb-2 group-hover:scale-110 transition-transform">92%</div>
                <div className="text-sm text-muted-foreground">✅ Completion Rate</div>
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