
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/Sidebar";
import { TopAppBar } from "@/components/TopAppBar";
import { WelcomeSection } from "@/components/WelcomeSection";
import { useAuth } from "@/hooks/useAuth";
import { useLocalTaskly } from "@/hooks/useLocalTaskly";
import { RobotTapToSpeak } from "@/components/RobotTapToSpeak";
import { NewTaskSheet } from "@/components/NewTaskSheet";
import { TaskCard } from "@/components/TaskCard";
import { parseSpokenTask, ParsedTask } from "@/utils/parseSpokenTask";
import { toast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const [parsedTask, setParsedTask] = useState<ParsedTask | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const { 
    tasks, 
    addTask, 
    completeTask, 
    scheduleTask, 
    updateTask, 
    deleteTask 
  } = useLocalTaskly();

  // Get user name from onboarding data
  useEffect(() => {
    const userData = localStorage.getItem('taskly-user-data');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUserName(parsed.name || '');
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleTranscript = (transcript: string) => {
    console.log('Transcript received:', transcript);
    const parsed = parseSpokenTask(transcript);
    setParsedTask(parsed);
    setEditingTaskId(null);
    setSheetOpen(true);
  };

  const handleSaveTask = (title: string, scheduledFor?: string) => {
    if (editingTaskId) {
      updateTask(editingTaskId, { title, scheduledFor, status: scheduledFor ? 'scheduled' : 'pending' });
      toast({
        title: "Task updated",
        description: title,
      });
    } else {
      addTask(title, scheduledFor);
      toast({
        title: "Task created",
        description: title,
      });
    }
    setParsedTask(null);
    setEditingTaskId(null);
  };

  const handleScheduleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setParsedTask({
        title: task.title,
        when: task.scheduledFor || null,
        rawTranscript: task.title
      });
      setEditingTaskId(taskId);
      setSheetOpen(true);
    }
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setParsedTask({
        title: task.title,
        when: task.scheduledFor || null,
        rawTranscript: task.title
      });
      setEditingTaskId(taskId);
      setSheetOpen(true);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
    toast({
      title: "Task deleted",
    });
  };

  const handleQuickAdd = () => {
    setParsedTask({
      title: '',
      when: null,
      rawTranscript: ''
    });
    setEditingTaskId(null);
    setSheetOpen(true);
  };

  const todayTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');

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
          
          <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-24">
            {/* Welcome & Slogan */}
            <WelcomeSection />

            {/* Robot - Main Focus */}
            <div className="flex flex-col items-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-8 text-center drop-shadow-lg font-sans">
                Welcome{userName ? `, ${userName}` : ''}
              </h1>
              
              <RobotTapToSpeak onTranscript={handleTranscript} />
            </div>

            {/* Today's Tasks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-foreground">Today's Tasks</h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleQuickAdd}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              {todayTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-lg mb-2">No tasks yet</p>
                  <p className="text-sm">Tap the robot to create your first task</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={completeTask}
                      onSchedule={handleScheduleTask}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Completed</h2>
                <div className="space-y-2">
                  {completedTasks.slice(0, 5).map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={completeTask}
                      onSchedule={handleScheduleTask}
                      onEdit={handleEditTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </SidebarInset>
      </div>

      <NewTaskSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        parsedTask={parsedTask}
        onSave={handleSaveTask}
      />
    </SidebarProvider>
  );
};

export default Index;
