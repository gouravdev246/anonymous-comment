
import React, { useState, useEffect } from 'react';
import { CommentType } from '@/utils/types';
import CommentForm from './CommentForm';
import Comment from './Comment';
import { commentStore } from '@/utils/commentStore';
import { useToast } from '@/components/ui/use-toast';

const CommentSection: React.FC = () => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load comments (in a real app, this would be an API call)
    setComments(commentStore.getAllComments());
  }, []);

  const handleAddComment = (text: string, username: string) => {
    const newComment = commentStore.addComment(text, username);
    setComments([newComment, ...comments]);
    
    toast({
      title: "Comment posted!",
      description: "Your comment has been added successfully.",
    });
  };

  const handleAddReply = (text: string, username: string, parentId: string) => {
    const success = commentStore.addReply(parentId, text, username);
    
    if (success) {
      setComments(commentStore.getAllComments());
      setActiveReplyId(null);
      
      toast({
        title: "Reply posted!",
        description: "Your reply has been added successfully.",
      });
    }
  };

  const handleReport = (commentId: string) => {
    const success = commentStore.reportComment(commentId);
    
    if (success) {
      setComments(commentStore.getAllComments());
      
      toast({
        title: "Comment reported",
        description: "Thank you for helping keep our community safe.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container px-4 mx-auto max-w-3xl">
      <CommentForm onSubmit={handleAddComment} />
      
      <div className="comments">
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
      </div>
    </div>
  );
};

export default CommentSection;
