import React, { useEffect } from 'react';
import { useMobile } from '@/hooks/useMobile';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { DragDropProvider } from '@/components/drag-drop/DragDropProvider';
import { AnimationProvider } from '@/components/animations/AnimationProvider';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthPage } from '@/components/auth/AuthPage';
import { IOSDashboard } from '@/components/layout/IOSDashboard';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const queryClient = new QueryClient();

export const MobileApp: React.FC = () => {
  const { isNative, isOnline, appState, triggerHaptic } = useMobile();

  useEffect(() => {
    // Add haptic feedback for native interactions
    if (isNative) {
      // Trigger haptic feedback on app launch
      triggerHaptic();
    }
  }, [isNative, triggerHaptic]);

  useEffect(() => {
    // Handle network status changes
    if (!isOnline) {
      console.log('App is offline');
      // You could show an offline indicator here
    }
  }, [isOnline]);

  useEffect(() => {
    // Handle app state changes
    console.log('App state changed to:', appState);
    if (appState === 'active' && isNative) {
      // App came to foreground
      triggerHaptic();
    }
  }, [appState, isNative, triggerHaptic]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <DragDropProvider>
            <AnimationProvider>
              <Router>
                <div className={`min-h-screen ${isNative ? 'mobile-app' : ''}`}>
                  <Routes>
                    <Route 
                      path="/" 
                      element={
                        <ProtectedRoute>
                          <IOSDashboard userName="Person1" partnerName="Person2" />
                        </ProtectedRoute>
                      } 
                    />
                    <Route path="/login" element={<AuthPage />} />
                  </Routes>
                  <Toaster />
                </div>
              </Router>
            </AnimationProvider>
          </DragDropProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};
