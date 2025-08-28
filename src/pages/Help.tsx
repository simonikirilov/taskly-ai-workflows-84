import { BottomNavigation } from '@/components/BottomNavigation';
import { AppMenu } from '@/components/AppMenu';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageSquare, Book, Video } from 'lucide-react';

export default function Help() {
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
            <span className="font-semibold text-lg">Help & Support</span>
          </div>
          <AppMenu />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        <div className="text-center">
          <HelpCircle className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">How can we help?</h1>
          <p className="text-muted-foreground">Get support and learn more about Taskly</p>
        </div>

        {/* Help Options */}
        <div className="space-y-3">
          <Card className="p-4 rounded-xl">
            <Button variant="ghost" className="w-full justify-start h-auto p-4">
              <Book className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div className="font-medium">Getting Started Guide</div>
                <div className="text-sm text-muted-foreground">Learn the basics of Taskly</div>
              </div>
            </Button>
          </Card>

          <Card className="p-4 rounded-xl">
            <Button variant="ghost" className="w-full justify-start h-auto p-4">
              <Video className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div className="font-medium">Video Tutorials</div>
                <div className="text-sm text-muted-foreground">Watch step-by-step guides</div>
              </div>
            </Button>
          </Card>

          <Card className="p-4 rounded-xl">
            <Button variant="ghost" className="w-full justify-start h-auto p-4">
              <MessageSquare className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div className="font-medium">Contact Support</div>
                <div className="text-sm text-muted-foreground">Get help from our team</div>
              </div>
            </Button>
          </Card>
        </div>

        {/* FAQ */}
        <Card className="p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3 text-sm">
            <div>
              <div className="font-medium mb-1">How do I record a workflow?</div>
              <div className="text-muted-foreground">Tap the Record button and perform your tasks. Taskly will capture and learn from your actions.</div>
            </div>
            <div>
              <div className="font-medium mb-1">Can I edit my name and preferences?</div>
              <div className="text-muted-foreground">Yes, go to Account in the menu to update your information.</div>
            </div>
            <div>
              <div className="font-medium mb-1">How does voice control work?</div>
              <div className="text-muted-foreground">Tap Speak and tell Taskly what you want to do. It will create tasks and suggestions for you.</div>
            </div>
          </div>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}