
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Send, X } from 'lucide-react';
import { CommentFormProps } from '@/utils/types';

const CommentForm: React.FC<CommentFormProps> = ({ 
  onSubmit, 
  isReply = false,
  onCancel
}) => {
  const [text, setText] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    onSubmit(text, username || 'Anonymous');
    setText('');
    setUsername('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className={isReply ? "mt-4" : "comment-form"}>
      <div className="space-y-4">
        <div>
          <Textarea
            placeholder="Share your thoughts anonymously..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError('');
            }}
            className="resize-none"
            rows={3}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        
        <div>
          <Input
            placeholder="Username (optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mb-4"
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          {isReply && onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              size="sm"
            >
              <X className="mr-1 h-4 w-4" /> Cancel
            </Button>
          )}
          <Button type="submit" size="sm">
            <Send className="mr-1 h-4 w-4" /> {isReply ? 'Reply' : 'Post Comment'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
