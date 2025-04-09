export interface CommentType {
  id: string;
  text: string;
  timestamp: Date;
  username: string;
  replies: CommentType[];
  isReported: boolean;
  imageUrl?: string;
}

export interface CommentFormProps {
  onSubmit: (text: string, username: string) => void;
  isReply?: boolean;
  parentId?: string;
  onCancel?: () => void;
}

export interface CommentProps {
  comment: CommentType;
  onReply: (commentId: string) => void;
  onReport: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  activeReplyId: string | null;
  onSubmitReply: (text: string, username: string, parentId: string) => void;
  onCancelReply: () => void;
}
