'use client';

import { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  isNearBottom: boolean;
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
  isNearBottom,
}: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages]);

  const lastAssistantIndex = (() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return i;
    }
    return -1;
  })();

  return (
    <>
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

      <AnimatePresence>
        {showScrollBtn && (
          <motion.button
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            onClick={onScrollToBottom}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-lg z-10 flex items-center gap-2 touch-manipulation"
            style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
          >
            <ChevronDown size={14} />
            <span className="text-xs font-semibold whitespace-nowrap">New messages</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
