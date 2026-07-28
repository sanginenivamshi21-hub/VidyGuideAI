import { memo, useState } from 'react';
import { Copy, RefreshCw, Volume2, ChevronDown, Check } from 'lucide-react';
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

  return (
    <div className={`mb-3 message-enter flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] sm:max-w-[80%] min-w-0 ${message.role === 'assistant' ? 'bg-slate-800/30 border border-slate-800/30' : ''}`}
        style={{
          backgroundColor: message.role === 'user' ? 'var(--accent-10)' : undefined,
          border: message.role === 'user' ? '1px solid var(--accent-20)' : undefined,
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
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] bg-slate-800/60 border border-slate-800/40"
                  >
                    <span className={att.type.startsWith('image/') ? 'text-blue-400' : 'text-slate-400'}>
                      {att.type.startsWith('image/') ? '🖼️' : att.type === 'application/pdf' ? '📄' : '📎'}
                    </span>
                    <span className="text-slate-400 truncate max-w-[120px]">{att.name}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
        ) : (
          <div className="text-sm text-slate-200 leading-relaxed">
            <MarkdownRenderer content={message.content} />
          </div>
        )}
        {message.timestamp && (
          <div className="text-[10px] text-slate-500 mt-1.5 text-right opacity-60">{message.timestamp}</div>
        )}
        {message.role === 'assistant' && message.content && isLast && !isStreaming && (
          <div
            className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-800/25"
          >
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors touch-manipulation"
              title="Copy response"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors touch-manipulation"
                title="Regenerate"
              >
                <RefreshCw size={13} />
              </button>
            )}
            {onContinue && (
              <button
                onClick={onContinue}
                className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors touch-manipulation"
                title="Continue"
              >
                <ChevronDown size={13} />
              </button>
            )}
            {onSpeak && (
              <button
                onClick={() => onSpeak(message.content)}
                className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-500 hover:text-slate-300 transition-colors touch-manipulation"
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
