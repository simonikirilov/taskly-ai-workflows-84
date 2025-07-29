import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { WelcomeFlow } from "@/components/onboarding/WelcomeFlow";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showWelcome, setShowWelcome] = useState(
    !localStorage.getItem('taskly-welcome-completed')
  );

  const handleWelcomeComplete = (userData: any) => {
    localStorage.setItem('taskly-welcome-completed', 'true');
    localStorage.setItem('taskly-user-preferences', JSON.stringify(userData));
    setShowWelcome(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          {showWelcome && <WelcomeFlow onComplete={handleWelcomeComplete} />}
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/account" element={<Account />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
