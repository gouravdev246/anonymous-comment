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
          event: 'INSERT', 
          schema: 'public', 
          table: 'comments' 
        }, 
        (payload) => {
          console.log('INSERT event received:', payload);
          fetchLatestComments();
        }
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'comments' 
        }, 
        (payload) => {
          console.log('UPDATE event received:', payload);
          fetchLatestComments();
        }
      )
      .on('postgres_changes', 
        { 
          event: 'DELETE', 
          schema: 'public', 
          table: 'comments' 
        }, 
        (payload) => {
          console.log('DELETE event received:', payload);
          // Force a complete refresh to ensure all clients get updated
          fetchLatestComments();
          
          // Also manually remove the deleted comment from the UI for immediate feedback
          if (payload.old) {
            const deletedId = payload.old.id;
            setComments(prevComments => {
              const removeComment = (comments: CommentType[]): CommentType[] => {
                return comments.filter(comment => {
                  if (comment.id === deletedId) {
                    return false;
                  }
                  
                  // Also filter the replies recursively
                  if (comment.replies && comment.replies.length > 0) {
                    comment.replies = removeComment(comment.replies);
                  }
                  
                  return true;
                });
              };
              
              return removeComment([...prevComments]);
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('Supabase subscription status:', status);
      });
    
    console.log('Supabase realtime subscription set up');
    
    // Clean up subscription on component unmount
    return () => {
      console.log('Cleaning up Supabase subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddComment = async (text: string, username: string, imageUrl?: string) => {
    const newComment = await commentStore.addComment(text, username, imageUrl);
    
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

  const handleAddReply = async (text: string, username: string, parentId: string, imageUrl?: string) => {
    const success = await commentStore.addReply(parentId, text, username, imageUrl);
    
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

  const handleDelete = async (commentId: string) => {
    try {
      console.log('Handling delete for comment:', commentId);
      
      // Show loading toast
      toast({
        title: "Deleting comment...",
        description: "Please wait while we delete the comment.",
      });
      
      const success = await commentStore.deleteComment(commentId);
      
      if (success) {
        console.log('Delete operation successful, updating UI');
        
        // Manually update the UI state by removing the deleted comment
        setComments(prevComments => {
          const removeComment = (comments: CommentType[]): CommentType[] => {
            return comments.filter(comment => {
              if (comment.id === commentId) {
                return false;
              }
              
              // Also filter the replies recursively
              if (comment.replies && comment.replies.length > 0) {
                comment.replies = removeComment(comment.replies);
              }
              
              return true;
            });
          };
          
          return removeComment([...prevComments]);
        });
        
        // Force a refresh of comments after a short delay
        setTimeout(() => {
          console.log('Fetching latest comments after delete');
          fetchLatestComments();
        }, 1000); // Increased timeout to ensure Supabase has time to process
        
        toast({
          title: "Comment deleted",
          description: "The comment has been successfully deleted.",
        });
      } else {
        console.error('Delete operation failed');
        toast({
          title: "Error deleting comment",
          description: "Could not delete the comment. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
      toast({
        title: "Error deleting comment",
        description: "An unexpected error occurred. Please try again.",
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
                onDelete={handleDelete}
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
