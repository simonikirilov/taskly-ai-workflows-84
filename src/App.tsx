
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { WelcomeFlow } from "@/components/onboarding/WelcomeFlow";
import Index from "./pages/Index";
import Account from "./pages/Account";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Workflows from "./pages/Workflows";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [isCheckingWelcome, setIsCheckingWelcome] = useState(true);

  useEffect(() => {
    // Set dark mode by default
    document.documentElement.classList.add('dark');
    
    // Check if user has completed welcome flow
    const welcomeCompleted = localStorage.getItem('taskly-welcome-completed');
    const hasUserName = localStorage.getItem('taskly_user_name');
    
    // Show welcome if not completed OR if user has no name stored
    setShowWelcome(!welcomeCompleted || !hasUserName);
    setIsCheckingWelcome(false);
  }, []);

  const handleWelcomeComplete = (userData: any) => {
    console.log('Welcome completed with data:', userData);
    localStorage.setItem('taskly-welcome-completed', 'true');
    localStorage.setItem('taskly-user-preferences', JSON.stringify(userData));
    
    // Store user name for later use in authentication
    if (userData.name) {
      localStorage.setItem('taskly_user_name', userData.name);
    }
    
    setShowWelcome(false);
  };

  // Show loading while checking welcome status
  if (isCheckingWelcome) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-12 w-12 border-b-2 border-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showWelcome && (
            <WelcomeFlow onComplete={handleWelcomeComplete} />
          )}
          {!showWelcome && (
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/account" element={<Account />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/workflows" element={<Workflows />} />
                <Route path="/help" element={<Help />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          )}
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
