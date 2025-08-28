import { ArrowLeft, Mail, MessageCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function Help() {
  const navigate = useNavigate();

  const faqItems = [
    {
      question: "How do I record a workflow?",
      answer: "Tap the 'Record' button on the home screen to start capturing your screen actions. Stop sharing to end the recording."
    },
    {
      question: "How does voice recognition work?",
      answer: "Click the robot or use the 'Speak' button to give voice commands. Make sure microphone permissions are enabled."
    },
    {
      question: "Where are my tasks stored?",
      answer: "All tasks are stored locally on your device for privacy. You can export your data from Settings > Account."
    },
    {
      question: "How do I set up automation?",
      answer: "Record workflows, then Taskly will learn patterns and suggest automation opportunities on your Dashboard."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="h-14 border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between h-full px-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="font-semibold">Help & Support</h1>
          <div></div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Chat Support</CardTitle>
              <CardDescription>Get help from our team</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Email Us</CardTitle>
              <CardDescription>support@taskly.app</CardDescription>
            </CardHeader>
          </Card>

          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardHeader className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Documentation</CardTitle>
              <CardDescription>Learn how to use Taskly</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>Quick answers to common questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {faqItems.map((item, index) => (
              <div key={index} className="space-y-2">
                <h3 className="font-semibold text-lg">{item.question}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                {index < faqItems.length - 1 && <div className="border-b border-border/40 pt-4"></div>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Version Info */}
        <Card>
          <CardHeader>
            <CardTitle>App Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>Version: 1.0.0</div>
            <div>Build: 2024.1</div>
            <div>Last Updated: January 2024</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}