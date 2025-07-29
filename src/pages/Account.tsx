import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Calendar, LogOut } from 'lucide-react';
import { format } from 'date-fns';

export default function Account() {
  const { user, signOut } = useAuth();

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
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Your account details and authentication method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Authentication Method</label>
                <div className="p-3 bg-muted rounded-md flex items-center justify-between">
                  <span className="text-sm">Connected via</span>
                  {getProviderBadge()}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Account Created
                </label>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm">
                    {format(new Date(user.created_at), 'PPP')}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Account Status</label>
                <div className="p-3 bg-muted rounded-md">
                  <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                    {user.email_confirmed_at ? "Verified" : "Pending Verification"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>
              Manage your account settings and data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="flex-1">
                Export Data
              </Button>
              <Button variant="outline" className="flex-1">
                Privacy Settings
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

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