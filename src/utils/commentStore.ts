
import { CommentType } from './types';
import { v4 as uuidv4 } from 'uuid';

// Local storage key
const COMMENTS_STORAGE_KEY = 'anonymous-comments';

// Initial seed data
const initialComments: CommentType[] = [
  {
    id: '1',
    text: 'Welcome to the Anonymous Comment Platform! Feel free to share your thoughts anonymously.',
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    username: 'Admin',
    replies: [
      {
        id: '2',
        text: 'This is really cool! I love being able to share my thoughts without revealing my identity.',
        timestamp: new Date(Date.now() - 43200000), // 12 hours ago
        username: 'Anonymous User',
        replies: [],
        isReported: false
      }
    ],
    isReported: false
  }
];

// Helper function to safely parse JSON from localStorage
const safeJsonParse = <T>(json: string | null, fallback: T): T => {
  if (!json) return fallback;
  try {
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to parse stored comments:', e);
    return fallback;
  }
};

// Helper to convert date strings back to Date objects when loading from localStorage
const restoreDates = (comments: CommentType[]): CommentType[] => {
  const processComment = (comment: CommentType): CommentType => {
    return {
      ...comment,
      timestamp: new Date(comment.timestamp),
      replies: comment.replies.map(processComment)
    };
  };
  
  return comments.map(processComment);
};

// In-memory comment store with localStorage persistence
class CommentStore {
  private comments: CommentType[];
  private lastModified: number;

  constructor() {
    // Try to load comments from localStorage first, fall back to initial data if not available
    const storedCommentsJson = localStorage.getItem(COMMENTS_STORAGE_KEY);
    const storedData = safeJsonParse<{comments: CommentType[], lastModified: number}>(
      storedCommentsJson, 
      { comments: initialComments, lastModified: Date.now() }
    );
    
    this.comments = restoreDates(storedData.comments);
    this.lastModified = storedData.lastModified;
    
    // Save initial state if nothing was stored before
    if (!storedCommentsJson) {
      this.saveToLocalStorage();
    }
  }

  private saveToLocalStorage(): void {
    try {
      localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify({
        comments: this.comments,
        lastModified: this.lastModified
      }));
    } catch (e) {
      console.error('Failed to save comments to localStorage:', e);
    }
  }

  getAllComments(): CommentType[] {
    return [...this.comments];
  }

  getLastModifiedTime(): number {
    return this.lastModified;
  }

  addComment(text: string, username: string): CommentType {
    const newComment: CommentType = {
      id: uuidv4(),
      text,
      timestamp: new Date(),
      username: username || 'Anonymous',
      replies: [],
      isReported: false
    };

    this.comments.unshift(newComment);
    this.lastModified = Date.now();
    this.saveToLocalStorage();
    return newComment;
  }

  addReply(parentId: string, text: string, username: string): boolean {
    const findAndAddReply = (comments: CommentType[]): boolean => {
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].id === parentId) {
          const newReply: CommentType = {
            id: uuidv4(),
            text,
            timestamp: new Date(),
            username: username || 'Anonymous',
            replies: [],
            isReported: false
          };
          comments[i].replies.push(newReply);
          this.lastModified = Date.now();
          this.saveToLocalStorage();
          return true;
        }
        
        if (comments[i].replies.length > 0) {
          const found = findAndAddReply(comments[i].replies);
          if (found) return true;
        }
      }
      return false;
    };

    return findAndAddReply(this.comments);
  }

  reportComment(commentId: string): boolean {
    const findAndReportComment = (comments: CommentType[]): boolean => {
      for (let i = 0; i < comments.length; i++) {
        if (comments[i].id === commentId) {
          comments[i].isReported = true;
          this.lastModified = Date.now();
          this.saveToLocalStorage();
          return true;
        }
        
        if (comments[i].replies.length > 0) {
          const found = findAndReportComment(comments[i].replies);
          if (found) return true;
        }
      }
      return false;
    };

    return findAndReportComment(this.comments);
  }
}

export const commentStore = new CommentStore();
