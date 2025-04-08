
import React from 'react';
import { CommentProps } from '@/utils/types';
import { MessageSquare, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CommentForm from './CommentForm';

const Comment: React.FC<CommentProps> = ({
  comment,
  onReply,
  onReport,
  activeReplyId,
  onSubmitReply,
  onCancelReply
}) => {
  const isReplyActive = activeReplyId === comment.id;
  const formattedDate = new Date(comment.timestamp).toLocaleString();

  return (
    <div className="comment-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-anonymous-accent flex items-center justify-center text-white font-semibold mr-2">
            {comment.username.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium">{comment.username}</span>
        </div>
        <time className="text-xs text-anonymous-text/70">{formattedDate}</time>
      </div>

      <div className="mt-2 whitespace-pre-wrap break-words">{comment.text}</div>

      <div className="mt-4 flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs"
          onClick={() => onReply(comment.id)}
        >
          <MessageSquare className="h-3.5 w-3.5 mr-1" />
          Reply
        </Button>

        {!comment.isReported ? (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs text-red-400 hover:text-red-500 hover:bg-red-500/10"
            onClick={() => onReport(comment.id)}
          >
            <Flag className="h-3.5 w-3.5 mr-1" />
            Report
          </Button>
        ) : (
          <Badge variant="outline" className="text-xs bg-red-500/10 text-red-400 border-red-400/20">
            Reported
          </Badge>
        )}
      </div>

      {isReplyActive && (
        <CommentForm 
          onSubmit={(text, username) => onSubmitReply(text, username, comment.id)}
          isReply={true}
          onCancel={onCancelReply}
        />
      )}

      {comment.replies.length > 0 && (
        <div className="reply-indent">
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onReport={onReport}
              activeReplyId={activeReplyId}
              onSubmitReply={onSubmitReply}
              onCancelReply={onCancelReply}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
