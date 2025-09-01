
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { TopAppBar } from "@/components/TopAppBar";
import { TasklyBot } from "@/components/TasklyBot";
import { WelcomeSection } from "@/components/WelcomeSection";
import { TodaysTasks } from "@/components/TodaysTasks";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { addTaskForUser } from "@/utils/taskUtils";

const Index = () => {
  const { user, loading } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [voiceHistory, setVoiceHistory] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Remove auto-show suggestions - only show when user clicks the floating robot

  const handleVoiceCommand = async (command: string) => {
    console.log('Voice command received:', command);
    setVoiceHistory(prev => [...prev, command]);
    
    // Parse the voice command to see if it's a task creation request
    try {
      const response = await supabase.functions.invoke('voice-command-parser', {
        body: { command }
      });

      if (response.error) {
        console.error('Error parsing voice command:', response.error);
        return;
      }

      const parsedCommand = response.data;
      
      if (parsedCommand.isTask && parsedCommand.title && user) {
        const result = await addTaskForUser(
          user.id, 
          parsedCommand.title, 
          parsedCommand.scheduledTime
        );
        
        if (result.success) {
          // Trigger a refresh of the task list
          setRefreshTrigger(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
    }
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
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen w-full">
        {/* Sidebar - hidden by default, controlled by state */}
        {sidebarOpen && <AppSidebar />}
        
        <SidebarInset>
          <TopAppBar onLogoClick={() => setSidebarOpen(!sidebarOpen)} />
          
          <div className="max-w-4xl mx-auto p-4 space-y-6">
            {/* Welcome & Slogan */}
            <WelcomeSection />

            {/* Robot - Main Focus */}
            <TasklyBot 
              onVoiceCommand={handleVoiceCommand}
              onRecordFlow={handleRecordFlow}
              voiceHistory={voiceHistory}
            />

            {/* Today's Tasks */}
            <TodaysTasks refreshTrigger={refreshTrigger} />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
