
import React from 'react';
import Header from '@/components/Header';
import CommentSection from '@/components/CommentSection';

const Index: React.FC = () => {
  return (
    <div className="min-h-screen pb-12">
      <Header />
      <main>
        <CommentSection />
      </main>
      <div className="fixed bottom-4 right-4 text-xs text-anonymous-text/50">
        Comments refresh automatically every 3 seconds
      </div>
    </div>
  );
};

export default Index;
