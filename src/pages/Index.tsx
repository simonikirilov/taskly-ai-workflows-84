import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { TasklyBot } from "@/components/TasklyBot";
import { TaskList } from "@/components/TaskList";
import { AISuggestionsCards } from "@/components/AISuggestionsCards";
import { WorkflowAnalysis } from "@/components/WorkflowAnalysis";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DarkModeToggle } from "@/components/ui/dark-mode-toggle";
import { Search, Mic, Menu } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showWorkflowAnalysis, setShowWorkflowAnalysis] = useState(false);
  const [recordingData, setRecordingData] = useState<{
    duration: string;
    type: 'voice' | 'screen';
  } | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-12 w-12 border-b-2 border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleVoiceCommand = async (command: string, duration: string = '0:00') => {
    try {
      // Analyze the voice session as a potential workflow
      setRecordingData({
        duration,
        type: 'voice'
      });
      setShowWorkflowAnalysis(true);
      
      // Also process as before for simple commands
      const lowerCommand = command.toLowerCase();
      
      if (lowerCommand.includes('remind') || lowerCommand.includes('task')) {
        // Create a task
        const { error } = await supabase
          .from('tasks')
          .insert({
            user_id: user.id,
            title: command,
            status: false
          });

        if (error) throw error;
        
        setRefreshTrigger(prev => prev + 1);
      } else if (lowerCommand.includes('schedule') || lowerCommand.includes('daily') || lowerCommand.includes('weekly')) {
        // Create a workflow
        const { error } = await supabase
          .from('workflows')
          .insert({
            user_id: user.id,
            title: command,
            description: 'Created via voice command',
            category: 'automation'
          });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      toast({
        title: "Error processing command",
        description: "Failed to process your voice command. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRecordFlow = (recordingBlob?: Blob, duration?: string) => {
    if (recordingBlob && duration) {
      // Show workflow analysis for screen recording
      setRecordingData({
        duration,
        type: 'screen'
      });
      setShowWorkflowAnalysis(true);
      
      toast({
        title: "Workflow Recorded",
        description: "Analyzing your workflow...",
      });
    }
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 overflow-auto relative">
          {/* Simplified Header */}
          <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="glass">
                  <Menu className="h-4 w-4" />
                </SidebarTrigger>
                
                <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 glass border-0"
                  />
                </div>
              </div>
              
              <DarkModeToggle />
            </div>
          </header>

          {/* Main Content - Redesigned Layout */}
          <div className="container mx-auto px-6 py-8 max-w-4xl space-y-12">
            {/* Hero Section with Taskly Bot */}
            <section className="text-center space-y-8">
              <TasklyBot 
                onVoiceCommand={handleVoiceCommand}
                onRecordFlow={handleRecordFlow}
                suggestionCount={3}
                onShowSuggestions={() => setShowSuggestions(true)}
              />
            </section>

            {/* Tasks Section */}
            <section className="space-y-6">
              <TaskList refreshTrigger={refreshTrigger} />
            </section>
          </div>
        </main>

        {/* AI Suggestions Overlay */}
        <AISuggestionsCards 
          isVisible={showSuggestions}
          onClose={() => setShowSuggestions(false)}
        />

        {/* Workflow Analysis Overlay */}
        <WorkflowAnalysis
          isVisible={showWorkflowAnalysis}
          onClose={() => setShowWorkflowAnalysis(false)}
          recordingData={recordingData}
        />
      </div>
    </SidebarProvider>
  );
};

export default Index;
