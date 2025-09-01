
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { TopAppBar } from "@/components/TopAppBar";
import { TasklyBot } from "@/components/TasklyBot";
import { AISuggestionsCards } from "@/components/AISuggestionsCards";
import { WelcomeSection } from "@/components/WelcomeSection";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [voiceHistory, setVoiceHistory] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Remove auto-show suggestions - only show when user clicks the floating robot

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
              suggestionCount={3}
              onShowSuggestions={() => setShowSuggestions(true)}
              voiceHistory={voiceHistory}
            />
          
            <AISuggestionsCards 
              isVisible={showSuggestions}
              onClose={() => setShowSuggestions(false)}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Index;
