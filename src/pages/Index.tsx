import { useState, useEffect } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
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
import { Search, Menu, Lightbulb, Home, BarChart3, User, Settings, Mic } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const Index = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showWorkflowAnalysis, setShowWorkflowAnalysis] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [recordingData, setRecordingData] = useState<{
    duration: string;
    type: 'voice' | 'screen';
  } | null>(null);
  const [voiceHistory, setVoiceHistory] = useState<string[]>([]);

  // Get user name from localStorage (stored during onboarding)
  useEffect(() => {
    const storedUserName = localStorage.getItem('taskly_user_name');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

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
    // Add to voice history
    setVoiceHistory(prev => [...prev, command]);
    
    try {
      // Extract tasks using AI analysis
      const extractedTasks = extractTasksFromVoice(command);
      
      // Create tasks in database
      for (const taskData of extractedTasks) {
        const { error } = await supabase
          .from('tasks')
          .insert({
            user_id: user.id,
            title: taskData.title,
            status: false,
            scheduled_time: taskData.scheduledTime
          });

        if (error) throw error;
      }
      
      setRefreshTrigger(prev => prev + 1);
      
      toast({
        title: "Tasks created successfully!",
        description: `Added ${extractedTasks.length} task(s) from your voice command.`,
      });
      
    } catch (error) {
      console.error('Error processing voice command:', error);
      toast({
        title: "Error processing command",
        description: "Failed to process your voice command. Please try again.",
        variant: "destructive",
      });
    }
  };

  // AI function to extract structured tasks from voice command
  const extractTasksFromVoice = (command: string) => {
    const tasks = [];
    const lowerCommand = command.toLowerCase();
    
    // Simple AI logic to extract tasks and times
    if (lowerCommand.includes('post') && lowerCommand.includes('reels')) {
      const times = command.match(/(\d{1,2})\s*(am|pm)/gi) || [];
      const projectMatch = command.match(/for\s+([^,\s]+(?:\s+[^,\s]+)*)/i);
      const project = projectMatch ? projectMatch[1] : 'Project';
      
      if (times.length > 0) {
        times.forEach((time, index) => {
          const today = new Date();
          const [hour, period] = time.toLowerCase().split(/\s*(am|pm)/);
          let hourNum = parseInt(hour);
          if (period === 'pm' && hourNum !== 12) hourNum += 12;
          if (period === 'am' && hourNum === 12) hourNum = 0;
          
          today.setHours(hourNum, 0, 0, 0);
          
          tasks.push({
            title: `Post reel ${index + 1} for ${project}`,
            scheduledTime: today.toISOString()
          });
        });
      } else {
        tasks.push({
          title: `Post reels for ${project}`,
          scheduledTime: null
        });
      }
    } else {
      // Generic task creation
      tasks.push({
        title: command,
        scheduledTime: null
      });
    }
    
    return tasks;
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
        
        
        <main className="flex-1 overflow-auto relative">
          {/* Header with Logo and Navigation */}
          <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <div className="flex h-16 items-center justify-between px-6">
              {/* Left Side - Logo Only */}
              <div className="flex items-center">
                <Link to="/" className="flex items-center">
                   <img 
                     src="/lovable-uploads/d6ce5d45-f66c-43ab-9c0b-b20a8aee2675.png"
                     alt="Taskly"
                     className="w-24 h-24 object-contain"
                   />
                </Link>
              </div>
              
              {/* Center - Search Bar */}
              <div className="flex-1 flex justify-center max-w-md mx-auto">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-12 glass border-0"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-primary/10"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Right Side - Hamburger Menu */}
              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 glass bg-card/95 backdrop-blur-xl border-border/20">
                    <DropdownMenuItem asChild>
                      <Link to="/" className={cn(
                        "flex items-center w-full",
                        location.pathname === "/" && "bg-primary/10 text-primary"
                      )}>
                        <Home className="h-4 w-4 mr-2" />
                        Home
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className={cn(
                        "flex items-center w-full",
                        location.pathname === "/dashboard" && "bg-primary/10 text-primary"
                      )}>
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/account" className={cn(
                        "flex items-center w-full",
                        location.pathname === "/account" && "bg-primary/10 text-primary"
                      )}>
                        <User className="h-4 w-4 mr-2" />
                        Account
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className={cn(
                        "flex items-center w-full",
                        location.pathname === "/settings" && "bg-primary/10 text-primary"
                      )}>
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowSuggestions(true)}>
                      <Lightbulb className="mr-2 h-4 w-4" />
                      AI Tips & Shortcuts
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Littlebird.ai inspired layout */}
          <div className="container mx-auto px-8 py-12 max-w-5xl">
            {/* Hero Section - Center-aligned with tight spacing */}
            <section className="text-center space-y-8 mb-20">
              <div className="space-y-6">
                 <h1 className="text-5xl font-bold text-foreground tracking-tight">
                   Welcome {userName ? userName : 'to Taskly'}
                 </h1>
                 <p className="text-xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed mb-0">
                   Record. Learn. Automate.
                 </p>
              </div>
              
              <TasklyBot 
                onVoiceCommand={handleVoiceCommand}
                onRecordFlow={handleRecordFlow}
                suggestionCount={3}
                onShowSuggestions={() => setShowSuggestions(true)}
                voiceHistory={voiceHistory}
              />
            </section>

            {/* Tasks Section - Elevated design */}
            <section className="space-y-8">
              <div className="text-center space-y-4 mb-12">
                <h2 className="text-3xl font-semibold text-foreground">Today's Focus</h2>
                <p className="text-muted-foreground font-light">Keep track of your priorities and accomplish more</p>
              </div>
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
