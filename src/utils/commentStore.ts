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
    isReported: row.is_reported
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

  async addComment(text: string, username: string): Promise<CommentType | null> {
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
            is_reported: false
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

  async addReply(parentId: string, text: string, username: string): Promise<boolean> {
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
            is_reported: false
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
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (error) {
        console.error('Error deleting comment:', error);
        return false;
      }
      
      // Update last modified time
      lastModified = Date.now();
      return true;
    } catch (error) {
      console.error('Error in deleteComment:', error);
      return false;
    }
  }
}

export const commentStore = new CommentStore();
