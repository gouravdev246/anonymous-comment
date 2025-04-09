import { CommentType } from './types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// In-memory cache of comments
let commentsCache: CommentType[] = [];
let lastModified: number = 0;

// Helper to convert database rows to CommentType objects
const convertRowToComment = (row: any): CommentType => {
  return {
    id: row.id,
    text: row.text,
    timestamp: new Date(row.created_at),
    username: row.username || 'Anonymous',
    replies: [],
    isReported: row.is_reported,
    imageUrl: row.image_url || null
  };
};

// Build a nested comment tree from flat database rows
const buildCommentTree = (rows: any[]): CommentType[] => {
  // Create a map of id -> comment
  const commentMap = new Map<string, CommentType>();
  
  // First pass: create all comment objects
  rows.forEach(row => {
    commentMap.set(row.id, convertRowToComment(row));
  });
  
  // Second pass: build the tree structure
  const rootComments: CommentType[] = [];
  rows.forEach(row => {
    const comment = commentMap.get(row.id);
    if (row.parent_id) {
      const parent = commentMap.get(row.parent_id);
      if (parent) {
        parent.replies.push(comment!);
      }
    } else {
      rootComments.push(comment!);
    }
  });
  
  // Sort root comments by timestamp (newest first)
  return rootComments.sort((a, b) => 
    b.timestamp.getTime() - a.timestamp.getTime()
  );
};

class CommentStore {
  async getAllComments(): Promise<CommentType[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching comments:', error);
        return commentsCache;
      }
      
      commentsCache = buildCommentTree(data || []);
      lastModified = Date.now();
      return commentsCache;
    } catch (error) {
      console.error('Error in getAllComments:', error);
      return commentsCache;
    }
  }

  getLastModifiedTime(): number {
    return lastModified;
  }

  async addComment(text: string, username: string, imageUrl?: string): Promise<CommentType | null> {
    try {
      const id = uuidv4();
      const { data, error } = await supabase
        .from('comments')
        .insert([
          { 
            id,
            text, 
            username: username || 'Anonymous',
            parent_id: null,
            is_reported: false,
            image_url: imageUrl || null
          }
        ])
        .select()
        .single();
      
      if (error) {
        console.error('Error adding comment:', error);
        return null;
      }
      
      // Update last modified time and return the new comment
      lastModified = Date.now();
      return convertRowToComment(data);
    } catch (error) {
      console.error('Error in addComment:', error);
      return null;
    }
  }

  async addReply(parentId: string, text: string, username: string, imageUrl?: string): Promise<boolean> {
    try {
      const id = uuidv4();
      const { error } = await supabase
        .from('comments')
        .insert([
          { 
            id,
            text,
            username: username || 'Anonymous',
            parent_id: parentId,
            is_reported: false,
            image_url: imageUrl || null
          }
        ]);
      
      if (error) {
        console.error('Error adding reply:', error);
        return false;
      }
      
      // Update last modified time
      lastModified = Date.now();
      return true;
    } catch (error) {
      console.error('Error in addReply:', error);
      return false;
    }
  }

  async reportComment(commentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ is_reported: true })
        .eq('id', commentId);
      
      if (error) {
        console.error('Error reporting comment:', error);
        return false;
      }
      
      // Update last modified time
      lastModified = Date.now();
      return true;
    } catch (error) {
      console.error('Error in reportComment:', error);
      return false;
    }
  }

  async deleteComment(commentId: string): Promise<boolean> {
    try {
      console.log('Attempting to delete comment:', commentId);
      
      // Get all comments to find what needs to be deleted
      const { data: allComments, error: fetchError } = await supabase
        .from('comments')
        .select('*');
      
      if (fetchError) {
        console.error('Error fetching comments:', fetchError);
        return false;
      }
      
      // Find all comments to delete (the specified comment and all its descendants)
      const commentsToDelete: string[] = [];
      
      // Function to recursively collect IDs of comments to delete
      const collectCommentIds = (parentId: string) => {
        commentsToDelete.push(parentId);
        
        // Find all direct children
        const childComments = allComments?.filter(c => c.parent_id === parentId) || [];
        
        // Recursively collect descendant IDs
        for (const child of childComments) {
          collectCommentIds(child.id);
        }
      };
      
      // Start collecting from the target comment
      collectCommentIds(commentId);
      
      console.log('Comments to delete:', commentsToDelete);
      
      // Delete all collected comments in a single operation
      if (commentsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('comments')
          .delete()
          .in('id', commentsToDelete);
        
        if (deleteError) {
          console.error('Error deleting comments:', deleteError);
          return false;
        }
      }
      
      console.log('Comments deleted successfully:', commentsToDelete.length);
      
      // Update last modified time
      lastModified = Date.now();
      return true;
    } catch (error) {
      console.error('Error in deleteComment:', error);
      return false;
    }
  }

  // Add a new method to upload an image to Supabase storage
  async uploadImage(file: File): Promise<string | null> {
    try {
      // Check if file is valid
      if (!file || file.size === 0) {
        console.error('Invalid file provided for upload');
        return null;
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `comment-images/${fileName}`;
      
      console.log('Attempting to upload file:', {
        fileName,
        filePath,
        fileSize: file.size,
        fileType: file.type
      });
      
      // Try to get the bucket info first to verify it exists
      const { data: bucketData, error: bucketError } = await supabase.storage
        .getBucket('public');
        
      if (bucketError) {
        console.error('Bucket access error:', bucketError);
        // Try to create the bucket if it doesn't exist
        const { error: createBucketError } = await supabase.storage
          .createBucket('public', {
            public: true
          });
          
        if (createBucketError) {
          console.error('Error creating bucket:', createBucketError);
          return null;
        }
      }
      
      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        return null;
      }
      
      console.log('Upload successful, path:', uploadData?.path);
      
      // Get the public URL for the uploaded image
      const { data } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);
      
      console.log('Generated public URL:', data.publicUrl);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      return null;
    }
  }
}

export const commentStore = new CommentStore();
