
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { TasklyBot } from "@/components/TasklyBot";
import { TaskList } from "@/components/TaskList";
import { CompletedTasks } from "@/components/CompletedTasks";
import { AISuggestionsCards } from "@/components/AISuggestionsCards";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [voiceHistory, setVoiceHistory] = useState<string[]>([]);

  useEffect(() => {
    // Show suggestions after 3 seconds if user is authenticated
    if (user) {
      const timer = setTimeout(() => {
        setShowSuggestions(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleVoiceCommand = (command: string) => {
    setVoiceHistory(prev => [...prev, command]);
    // Here you could add logic to process voice commands and create tasks
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRecordFlow = (recordingBlob?: Blob, duration?: string) => {
    // Handle workflow recording
    console.log('Workflow recorded:', { recordingBlob, duration });
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-12 w-12 border-b-2 border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
              <p className="text-muted-foreground">
                Here's what's happening with your tasks today.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:gap-8 lg:grid-cols-4">
            <div className="col-span-full lg:col-span-3">
              <TaskList refreshTrigger={refreshTrigger} />
            </div>
            <div className="lg:col-span-1 space-y-4">
              <CompletedTasks />
            </div>
          </div>

          <TasklyBot 
            onVoiceCommand={handleVoiceCommand}
            onRecordFlow={handleRecordFlow}
            suggestionCount={0}
            onShowSuggestions={() => setShowSuggestions(true)}
            voiceHistory={voiceHistory}
          />
          
          <AISuggestionsCards 
            isVisible={showSuggestions}
            onClose={() => setShowSuggestions(false)}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Index;
