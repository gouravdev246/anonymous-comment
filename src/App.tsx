import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CommentSection from './components/CommentSection';
import StorageDiagnostic from './components/StorageDiagnostic';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotFound from "./pages/NotFound";
import { Button } from '@/components/ui/button';
import { Wrench } from 'lucide-react';

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <div className="min-h-screen bg-anonymous-bg text-anonymous-text">
            <div className="container mx-auto px-4 py-8">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold">Anonymous Comments</h1>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowDiagnostics(!showDiagnostics)}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  {showDiagnostics ? 'Hide Diagnostics' : 'Show Diagnostics'}
                </Button>
              </div>

              {showDiagnostics && (
                <div className="mb-8">
                  <StorageDiagnostic />
                </div>
              )}

              <div className="grid grid-cols-1 gap-8">
                <div>
                  <CommentSection />
                </div>
              </div>
            </div>
          </div>
          <Routes>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
