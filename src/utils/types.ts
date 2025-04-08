
export interface CommentType {
  id: string;
  text: string;
  timestamp: Date;
  username: string;
  replies: CommentType[];
  isReported: boolean;
}

export interface CommentFormProps {
  onSubmit: (text: string, username: string) => void;
  isReply?: boolean;
  parentId?: string;
  onCancel?: () => void;
}

export interface CommentProps {
  comment: CommentType;
  onReply: (parentId: string) => void;
  onReport: (commentId: string) => void;
  activeReplyId: string | null;
  onSubmitReply: (text: string, username: string, parentId: string) => void;
  onCancelReply: () => void;
}
