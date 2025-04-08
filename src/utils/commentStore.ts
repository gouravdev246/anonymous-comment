
import { CommentType } from './types';
import { v4 as uuidv4 } from 'uuid';

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

// In-memory comment store (would be replaced by API calls in production)
class CommentStore {
  private comments: CommentType[];
  private lastModified: number;

  constructor() {
    this.comments = [...initialComments];
    this.lastModified = Date.now();
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
