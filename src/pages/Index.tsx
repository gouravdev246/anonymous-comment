
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
    </div>
  );
};

export default Index;
