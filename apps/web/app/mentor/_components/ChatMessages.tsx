'use client';

import { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import ChatMessage from './ChatMessage';
import SuggestionCards from './SuggestionCards';
import TypingIndicator from './TypingIndicator';
import ThinkingStatus from './ThinkingStatus';
import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessagesProps {
  messages: ChatMessageType[];
  isStreaming: boolean;
  thinking: boolean;
  showScrollBtn: boolean;
  onScrollToBottom: () => void;
  onSuggestionSelect: (query: string) => void;
  onRegenerate?: () => void;
  onContinue?: () => void;
  onSpeak?: (text: string) => void;
}

export default function ChatMessages({
  messages,
  isStreaming,
  thinking,
  showScrollBtn,
  onScrollToBottom,
  onSuggestionSelect,
  onRegenerate,
  onContinue,
  onSpeak,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isStreaming || messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isStreaming]);

  const lastAssistantIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return i;
    }
    return -1;
  })();

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      {messages.length === 0 ? (
        <div className="h-full">
          <SuggestionCards onSelect={onSuggestionSelect} />
        </div>
      ) : (
        <div className="max-w-3xl mx-auto py-4 px-4 pb-2">
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              message={msg}
              isLast={i === messages.length - 1}
              isStreaming={isStreaming}
              onRegenerate={i === lastAssistantIndex && !isStreaming ? onRegenerate : undefined}
              onContinue={i === lastAssistantIndex && !isStreaming ? onContinue : undefined}
              onSpeak={onSpeak}
            />
          ))}
          {thinking && !isStreaming && <ThinkingStatus />}
          {isStreaming && messages[messages.length - 1]?.content === '' && !thinking && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      )}

      {showScrollBtn && (
        <button
          onClick={onScrollToBottom}
          className="fixed bottom-28 right-6 p-2.5 rounded-full shadow-lg z-10 transition-all hover:scale-105 active:scale-95 touch-manipulation"
          style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)', borderColor: 'var(--border-default)' }}
        >
          <ChevronDown size={18} />
        </button>
      )}
    </div>
  );
}
