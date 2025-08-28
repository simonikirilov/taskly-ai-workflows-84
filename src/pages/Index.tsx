import { useState, useEffect } from 'react';
import { Navigate, Link, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { TasklyBot } from "@/components/TasklyBot";
import { TaskList } from "@/components/TaskList";
import { AISuggestionsCards } from "@/components/AISuggestionsCards";
import { WorkflowAnalysis } from "@/components/WorkflowAnalysis";
import { TodaysFocus } from "@/components/TodaysFocus";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Search, Menu, Lightbulb, Home, BarChart3, User, Settings, Mic } from "lucide-react";
import { ConsciousnessStatus } from "@/components/os/ConsciousnessStatus";
import { PlanSection } from "@/components/os/PlanSection";
import { SmartSuggestions } from "@/components/os/SmartSuggestions";
import { DashboardMetrics } from "@/components/os/DashboardMetrics";
import { SystemStatus } from "@/components/SystemStatus";
import { CompletedTasks } from "@/components/CompletedTasks";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const Index = () => {
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
            user_id: 'local-user', // Use a default user ID for local storage
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
            <div className="flex h-16 items-center justify-between px-4">
              {/* Left Side - Logo */}
              <div className="flex items-center">
                <button 
                  onClick={() => window.location.href = '/'}
                  className="transition-transform hover:scale-105"
                >
                  <img 
                    src="/lovable-uploads/3ad45411-4019-40bd-b405-dea680df3c25.png"
                    alt="Taskly"
                    className="h-24 w-auto object-contain p-0 m-0 max-w-full cursor-pointer"
                  />
                </button>
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
              
              {/* Right Side - Consciousness Status + Menu */}
      <div className="flex items-center gap-3">
        <ConsciousnessStatus />
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
              <Link to="/workflows" className={cn(
                "flex items-center w-full",
                location.pathname === "/workflows" && "bg-primary/10 text-primary"
              )}>
                <Search className="h-4 w-4 mr-2" />
                Workflows
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

          {/* Hero Section - Mobile Optimized */}
          <div className="w-full px-4 py-1 max-w-lg mx-auto">
            <section className="text-center space-y-1">
               {/* Welcome Text */}
               <div className="space-y-6">
                   <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight">
                     Welcome {userName || 'User'}
                   </h1>
                  <p className="text-lg md:text-xl text-muted-foreground font-light leading-tight">
                    Record. Label. Automate.
                  </p>
               </div>
              
                {/* Robot and Buttons */}
                <TasklyBot 
                  onVoiceCommand={handleVoiceCommand}
                  onRecordFlow={handleRecordFlow}
                  suggestionCount={3}
                  onShowSuggestions={() => setShowSuggestions(true)}
                  voiceHistory={voiceHistory}
                />
                
              </section>
            </div>

            {/* AI Operating System Layout */}
            <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
              
              {/* Today's Plan (Auto) Section */}
              <div className="bg-card/30 rounded-2xl p-6 border border-border/20 backdrop-blur-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Today's Plan (Auto)</h3>
                  <p className="text-sm text-muted-foreground">Repetitive tasks that will be automatically executed today</p>
                </div>
                <PlanSection />
              </div>

              {/* Today's Tasks Section */}
              <div className="bg-card/30 rounded-2xl p-6 border border-border/20 backdrop-blur-sm">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">Today's Tasks</h3>
                  <p className="text-sm text-muted-foreground">Your one-time tasks — check them off as you go</p>
                </div>
                <TaskList refreshTrigger={refreshTrigger} />
              </div>

              {/* Completed Tasks Section */}
              <div className="bg-card/30 rounded-2xl p-6 border border-border/20 backdrop-blur-sm">
                <CompletedTasks />
              </div>

              {/* System Status Section */}
              <div className="bg-card/30 rounded-2xl p-6 border border-border/20 backdrop-blur-sm">
                <SystemStatus />
              </div>

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
        />
      </div>
    </SidebarProvider>
  );
};

export default Index;
