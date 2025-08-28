import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Settings, User, Bell, Shield, LogOut, ArrowLeft, Camera, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch"
import { useAuth } from '@/hooks/useAuth';

export default function Account() {
  const { user, signOut } = useAuth();
  const [userName, setUserName] = useState<string>('');

  // Get user name from localStorage
  useEffect(() => {
    const storedUserName = localStorage.getItem('taskly_user_name');
    if (storedUserName) {
      setUserName(storedUserName);
    } else if (user?.email) {
      // Fallback to email first name
      const emailName = user.email.split('@')[0];
      const capitalizedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
      setUserName(capitalizedName);
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  const getFirstName = (name: string) => {
    return name.split(' ')[0];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center transition-transform hover:scale-105">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="text-sm font-medium">Back</span>
          </Link>
          <img 
            src="/lovable-uploads/3ad45411-4019-40bd-b405-dea680df3c25.png"
            alt="Taskly"
            className="h-12 w-auto object-contain cursor-pointer"
            onClick={() => window.location.href = '/'}
          />
        </div>
      </header>

      {/* Page Title */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Account</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="space-y-6">
          
          {/* Profile Section */}
          <Card className="glass border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-16 w-16 cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage src="" alt={userName} />
                    <AvatarFallback className="text-lg font-semibold bg-primary/20 text-primary">
                      {userName ? userName.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-background border-2"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Hello, {getFirstName(userName) || 'User'}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>

          {/* Account Settings */}
          <Card className="glass border-border/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Edit Profile</p>
                    <p className="text-sm text-muted-foreground">Update your name and preferences</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-sm text-muted-foreground">Manage your notification preferences</p>
                  </div>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Privacy & Security</p>
                    <p className="text-sm text-muted-foreground">Control your data and security settings</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sign Out */}
          <Card className="glass border-border/20">
            <CardContent className="pt-6">
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
