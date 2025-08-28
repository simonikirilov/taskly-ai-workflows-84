import { BottomNavigation } from '@/components/BottomNavigation';
import { AppMenu } from '@/components/AppMenu';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function Analytics() {
  const userName = localStorage.getItem('taskly_user_name') || 'User';

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/d9e422aa-ea2c-4619-8ac2-3818edd8bcb3.png"
              alt="Taskly"
              className="w-8 h-8"
            />
            <span className="font-semibold text-lg">Analytics</span>
          </div>
          <AppMenu />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {userName}!</h1>
          <p className="text-muted-foreground">Your productivity insights</p>
        </div>

        {/* AEUW Stats */}
        <Card className="p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">AEUW Performance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Before 12% improvement</span>
                <span className="text-sm text-muted-foreground">12%</span>
              </div>
              <Progress value={12} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">47</div>
                <div className="text-sm text-muted-foreground">Tasks Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">8.5h</div>
                <div className="text-sm text-muted-foreground">Time Saved</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 rounded-xl text-center">
            <div className="text-xl font-bold text-primary">15</div>
            <div className="text-sm text-muted-foreground">Workflows</div>
          </Card>
          <Card className="p-4 rounded-xl text-center">
            <div className="text-xl font-bold text-primary">92%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </Card>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}