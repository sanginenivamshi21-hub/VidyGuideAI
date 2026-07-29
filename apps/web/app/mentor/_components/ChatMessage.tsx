'use client';

import { memo, useState } from 'react';
import { Copy, RefreshCw, Volume2, ChevronDown, Check, Clock, CircleCheck } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { ChatMessage as ChatMessageType } from '../types';

interface ChatMessageProps {
  message: ChatMessageType;
  isLast: boolean;
  isStreaming: boolean;
  onRegenerate?: () => void;
  onContinue?: () => void;
  onSpeak?: (text: string) => void;
  onCopy?: (text: string) => void;
}

const MarkdownRenderer = dynamic(() => import('@/components/MarkdownRenderer'), { ssr: false });

const ChatMessage = memo(function ChatMessage({
  message,
  isLast,
  isStreaming,
  onRegenerate,
  onContinue,
  onSpeak,
  onCopy,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.(message.content);
  };

  const sendState = message.sendState || (message.role === 'assistant' ? (message.content ? 'sent' : isStreaming ? 'streaming' : 'sending') : 'sent');

  return (
    <div className={`mb-3 message-enter flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] sm:max-w-[80%] min-w-0 ${message.role === 'assistant' ? '' : ''}`}
        style={{
          backgroundColor: message.role === 'user' ? 'var(--accent-10)' : 'var(--bg-card)',
          border: message.role === 'user' ? '1px solid var(--accent-20)' : '1px solid var(--border-default)',
          borderRadius: message.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          padding: '12px 16px',
        }}
      >
        {message.role === 'user' ? (
          <div>
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {message.attachments.map((att, ai) => (
                  <div
                    key={ai}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px]"
                    style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-default)' }}
                  >
                    <span style={{ color: att.type.startsWith('image/') ? '#3b82f6' : 'var(--text-tertiary)' }}>
                      {att.type.startsWith('image/') ? '🖼️' : att.type === 'application/pdf' ? '📄' : '📎'}
                    </span>
                    <span className="truncate max-w-[120px]" style={{ color: 'var(--text-secondary)' }}>{att.name}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--text-primary)' }}>{message.content}</p>
          </div>
        ) : (
          <div className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {message.content ? (
              <>
                <MarkdownRenderer content={message.content} />
                {isStreaming && <span className="streaming-cursor" />}
              </>
            ) : sendState === 'streaming' ? (
              <div className="flex items-center gap-1.5 py-1">
                <span className="w-2 h-2 rounded-full thinking-dot" style={{ backgroundColor: 'var(--accent)' }} />
                <span className="w-2 h-2 rounded-full thinking-dot" style={{ backgroundColor: 'var(--accent)' }} />
                <span className="w-2 h-2 rounded-full thinking-dot" style={{ backgroundColor: 'var(--accent)' }} />
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>...</span>
            )}
          </div>
        )}
        <div className="flex items-center justify-end gap-1.5 mt-1.5">
          {message.timestamp && (
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{message.timestamp}</span>
          )}
          {message.role === 'user' && sendState === 'sending' && (
            <span className="text-[10px] status-enter flex items-center gap-1" style={{ color: 'var(--text-tertiary)' }}>
              <Clock size={10} /> Sending...
            </span>
          )}
          {message.role === 'user' && sendState === 'sent' && (
            <CircleCheck size={10} style={{ color: 'var(--accent)' }} />
          )}
        </div>
        {message.role === 'assistant' && message.content && isLast && !isStreaming && (
          <div
            className="flex items-center gap-1 mt-2 pt-2"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg transition-colors touch-manipulation"
              style={{ color: 'var(--text-tertiary)' }}
              title="Copy response"
            >
              {copied ? <Check size={13} style={{ color: 'var(--accent)' }} /> : <Copy size={13} />}
            </button>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-lg transition-colors touch-manipulation"
                style={{ color: 'var(--text-tertiary)' }}
                title="Regenerate"
              >
                <RefreshCw size={13} />
              </button>
            )}
            {onContinue && (
              <button
                onClick={onContinue}
                className="p-1.5 rounded-lg transition-colors touch-manipulation"
                style={{ color: 'var(--text-tertiary)' }}
                title="Continue"
              >
                <ChevronDown size={13} />
              </button>
            )}
            {onSpeak && (
              <button
                onClick={() => onSpeak(message.content)}
                className="p-1.5 rounded-lg transition-colors touch-manipulation"
                style={{ color: 'var(--text-tertiary)' }}
                title="Read aloud"
              >
                <Volume2 size={13} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default ChatMessage;
