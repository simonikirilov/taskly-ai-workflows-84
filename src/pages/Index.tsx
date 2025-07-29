import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { TasklyBot } from "@/components/TasklyBot";
import { TaskList } from "@/components/TaskList";
import { SuggestionsList } from "@/components/SuggestionsList";
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleVoiceCommand = async (command: string) => {
    try {
      // Simple AI processing of voice commands
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
        
        toast({
          title: "Task created!",
          description: `"${command}" has been added to your tasks.`,
        });
        
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
        
        toast({
          title: "Workflow created!",
          description: `"${command}" has been saved as a workflow.`,
        });
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

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center gap-4 px-4">
              <SidebarTrigger>
                <Menu className="h-4 w-4" />
              </SidebarTrigger>
              
              <div className="flex-1 flex items-center gap-4 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search workflows..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button size="icon" variant="outline">
                  <Mic className="h-4 w-4" />
                </Button>
              </div>
              
              <DarkModeToggle />
            </div>
          </header>

          {/* Main Content */}
          <div className="container mx-auto p-6 max-w-6xl space-y-8">
            {/* Taskly Bot Section */}
            <div className="flex justify-center">
              <TasklyBot onVoiceCommand={handleVoiceCommand} />
            </div>

            {/* Tasks and Suggestions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TaskList refreshTrigger={refreshTrigger} />
              <SuggestionsList />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
