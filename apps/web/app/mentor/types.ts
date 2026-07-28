export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  attachments?: { name: string; type: string; size: number }[];
  sendState?: 'sending' | 'sent' | 'streaming' | 'done';
}

export interface Conversation {
  id: number;
  title: string;
  pinned: boolean;
  _count?: { messages: number };
  updatedAt: string;
  createdAt: string;
}
