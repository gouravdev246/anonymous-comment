import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Send, X, Image as ImageIcon, X as XIcon, Loader2 } from 'lucide-react';
import { commentStore } from '@/utils/commentStore';
import { useToast } from "@/components/ui/use-toast";

interface CommentFormProps {
  onSubmit: (text: string, username: string, imageUrl?: string) => void;
  isReply?: boolean;
  onCancel?: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit, isReply = false, onCancel }) => {
  const [text, setText] = useState('');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      let imageUrl = undefined;
      
      // Upload image if selected
      if (image) {
        setIsUploading(true);
        toast({
          title: "Uploading image...",
          description: "Please wait while we upload your image.",
        });
        
        imageUrl = await commentStore.uploadImage(image);
        
        if (!imageUrl) {
          toast({
            title: "Image upload failed",
            description: "Couldn't upload the image. Your comment will be posted without it.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Image uploaded successfully",
            description: "Your image was uploaded and will be included with your comment.",
          });
        }
        
        setIsUploading(false);
      }
      
      onSubmit(text, username, imageUrl || undefined);
      setText('');
      setUsername('');
      setImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Error posting comment",
        description: "Something went wrong while posting your comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setText('');
    setUsername('');
    setImage(null);
    setImagePreview(null);
    if (onCancel) onCancel();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    setImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form bg-anonymous-bg-light p-4 rounded-lg">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={isReply ? "Write a reply..." : "Share your thoughts anonymously..."}
        className="resize-none mb-3"
        required
      />
      
      {imagePreview && (
        <div className="mb-3 relative">
          <img 
            src={imagePreview} 
            alt="Preview" 
            className="h-40 rounded-md object-contain bg-anonymous-bg/50 border border-anonymous-accent/20" 
          />
          <button 
            type="button" 
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 rounded-full p-1 shadow-md"
            disabled={isSubmitting || isUploading}
          >
            <XIcon className="h-4 w-4 text-white" />
          </button>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 items-center">
        <Input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Custom username (default: GhostListener951)"
          className="flex-1 min-w-[200px]"
          disabled={isSubmitting || isUploading}
        />
        
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={isSubmitting || isUploading}
          />
          
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSubmitting || isUploading}
            title="Attach image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          
          {isReply && (
            <Button 
              type="button" 
              variant="outline" 
              size="icon"
              onClick={handleCancel}
              disabled={isSubmitting || isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploading || !text.trim()}
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isUploading ? 'Uploading...' : 'Posting...'}
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {isReply ? 'Reply' : 'Post Comment'}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentForm;
