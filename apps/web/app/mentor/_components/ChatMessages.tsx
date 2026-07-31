'use client';

import { useEffect, useRef } from 'react';
import { ChevronDown, CircleCheck, Clock, Image as ImageIcon, FileText, Paperclip } from 'lucide-react';
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

function UserGroup({ group }: { group: ChatMessageType[] }) {
  const last = group[group.length - 1];
  return (
    <div className="mb-3 flex justify-end message-enter">
      <div
        className="max-w-[88%] sm:max-w-[80%] min-w-0"
        style={{
          backgroundColor: 'var(--accent-10)',
          border: '1px solid var(--accent-20)',
          borderRadius: '18px 18px 4px 18px',
          padding: '12px 16px',
        }}
      >
        {group.map((msg, i) => (
          <div key={i} className={i > 0 ? 'mt-2.5 pt-2.5' : ''} style={i > 0 ? { borderTop: '1px solid var(--accent-20)' } : undefined}>
            {msg.attachments && msg.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {msg.attachments.map((att, ai) => (
                  <div
                    key={ai}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px]"
                    style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-default)' }}
                  >
                    <span style={{ color: att.type.startsWith('image/') ? 'var(--accent)' : 'var(--text-tertiary)' }}>
                      {att.type.startsWith('image/') ? (
                        <ImageIcon size={12} />
                      ) : att.type === 'application/pdf' ? (
                        <FileText size={12} />
                      ) : (
                        <Paperclip size={12} />
                      )}
                    </span>
                    <span className="truncate max-w-[120px]" style={{ color: 'var(--text-secondary)' }}>{att.name}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>{msg.content}</p>
          </div>
        ))}
        <div className="flex items-center justify-end gap-1.5 mt-1.5">
          {last.timestamp && (
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{last.timestamp}</span>
          )}
          {last.sendState === 'sending' && (
            <span className="text-[10px] status-enter flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
              <Clock size={10} /> Sending...
            </span>
          )}
          {last.sendState === 'sent' && (
            <CircleCheck size={10} style={{ color: 'var(--accent)' }} />
          )}
        </div>
      </div>
    </div>
  );
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

  const groups: ChatMessageType[][] = [];
  for (const msg of messages) {
    const last = groups[groups.length - 1];
    if (last && last[0].role === msg.role) last.push(msg);
    else groups.push([msg]);
  }

  const lastAssistantIndex = (() => {
    for (let i = groups.length - 1; i >= 0; i--) {
      const g = groups[i];
      if (g[0].role === 'assistant') return i;
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
          {groups.map((group, gi) => {
            if (group.length === 1) {
              const msg = group[0];
              return (
                <ChatMessage
                  key={gi}
                  message={msg}
                  isLast={gi === groups.length - 1}
                  isStreaming={isStreaming}
                  onRegenerate={gi === lastAssistantIndex && !isStreaming ? onRegenerate : undefined}
                  onContinue={gi === lastAssistantIndex && !isStreaming ? onContinue : undefined}
                  onSpeak={onSpeak}
                />
              );
            }
            if (group[0].role === 'user') {
              return <UserGroup key={gi} group={group} />;
            }
            return group.map((msg, mi) => (
              <ChatMessage
                key={`${gi}-${mi}`}
                message={msg}
                isLast={gi === groups.length - 1 && mi === group.length - 1}
                isStreaming={isStreaming}
                onRegenerate={gi === lastAssistantIndex && !isStreaming && mi === group.length - 1 ? onRegenerate : undefined}
                onContinue={gi === lastAssistantIndex && !isStreaming && mi === group.length - 1 ? onContinue : undefined}
                onSpeak={onSpeak}
              />
            ));
          })}
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
