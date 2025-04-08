
import React, { useState, useEffect, useRef } from 'react';
import { CommentType } from '@/utils/types';
import CommentForm from './CommentForm';
import Comment from './Comment';
import { commentStore } from '@/utils/commentStore';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

const CommentSection: React.FC = () => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  
  // Function to fetch the latest comments
  const fetchLatestComments = async () => {
    setIsLoading(true);
    try {
      const latestComments = await commentStore.getAllComments();
      setComments(latestComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error loading comments",
        description: "Could not load comments. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial load of comments
    fetchLatestComments();
    
    // Set up Supabase realtime subscription
    const channel = supabase
      .channel('public:comments')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'comments' 
        }, 
        () => {
          fetchLatestComments();
        }
      )
      .subscribe();
    
    // Clean up subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddComment = async (text: string, username: string) => {
    const newComment = await commentStore.addComment(text, username);
    
    if (newComment) {
      toast({
        title: "Comment posted!",
        description: "Your comment has been added successfully.",
      });
    } else {
      toast({
        title: "Error posting comment",
        description: "Could not post your comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddReply = async (text: string, username: string, parentId: string) => {
    const success = await commentStore.addReply(parentId, text, username);
    
    if (success) {
      setActiveReplyId(null);
      
      toast({
        title: "Reply posted!",
        description: "Your reply has been added successfully.",
      });
    } else {
      toast({
        title: "Error posting reply",
        description: "Could not post your reply. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReport = async (commentId: string) => {
    const success = await commentStore.reportComment(commentId);
    
    if (success) {
      toast({
        title: "Comment reported",
        description: "Thank you for helping keep our community safe.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error reporting comment",
        description: "Could not report the comment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container px-4 mx-auto max-w-3xl">
      <CommentForm onSubmit={handleAddComment} />
      
      <div className="comments">
        {isLoading ? (
          <div className="p-8 text-center text-anonymous-text/60">
            Loading comments...
          </div>
        ) : (
          <>
            {comments.map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                onReply={setActiveReplyId}
                onReport={handleReport}
                activeReplyId={activeReplyId}
                onSubmitReply={handleAddReply}
                onCancelReply={() => setActiveReplyId(null)}
              />
            ))}
            
            {comments.length === 0 && (
              <div className="p-8 text-center text-anonymous-text/60">
                No comments yet. Be the first to share your thoughts!
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
