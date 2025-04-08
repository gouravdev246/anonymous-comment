import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CommentSection from './components/CommentSection';
import MusicPlayer from './components/MusicPlayer';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <div className="min-h-screen bg-anonymous-bg text-anonymous-text">
            <div className="container mx-auto px-4 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h1 className="text-3xl font-bold mb-8">Anonymous Comments</h1>
                  <CommentSection />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-8">Music Player</h2>
                  <MusicPlayer />
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
