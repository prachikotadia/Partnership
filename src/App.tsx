import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { NotificationToastManager } from "@/components/notifications/NotificationToastManager";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { MinimalApp } from "@/components/MinimalApp";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Use minimal app as fallback to avoid cache issues
  return <MinimalApp />;
};

export default App;
