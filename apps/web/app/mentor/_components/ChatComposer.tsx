'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Mic, Paperclip, Square, SendHorizonal, Plus } from 'lucide-react';
import AttachmentCard from '@/components/AttachmentCard';

interface ChatComposerProps {
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  isStreaming: boolean;
  attachments: File[];
  attachmentPreviews: Record<number, string>;
  onAttachmentsChange: (files: File[]) => void;
  onAttachmentRemove: (index: number) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVoiceInput: () => void;
  fileError: string;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  toolPaletteOpen?: boolean;
  onToolPaletteToggle?: () => void;
}

export default function ChatComposer({
  input,
  onInputChange,
  onSend,
  onStop,
  isStreaming,
  attachments,
  attachmentPreviews,
  onAttachmentsChange,
  onAttachmentRemove,
  onFileSelect,
  onVoiceInput,
  fileError,
  fileInputRef,
  toolPaletteOpen,
  onToolPaletteToggle,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming) onSend();
    }
  };

  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) imageFiles.push(file);
      }
    }
    if (imageFiles.length > 0) {
      e.preventDefault();
      onAttachmentsChange([...attachments, ...imageFiles]);
    }
  }, [attachments, onAttachmentsChange]);

  const hasContent = input.trim().length > 0 || attachments.length > 0;

  return (
    <div
      className="shrink-0 safe-area-bottom z-20"
      style={{ borderTop: '1px solid var(--border-default)', backgroundColor: 'var(--bg-primary)' }}
    >
      {fileError && (
        <div className="px-4 py-2" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
          <p className="text-xs" style={{ color: '#ef4444' }}>{fileError}</p>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="px-4 py-2.5 flex gap-2 overflow-x-auto scrollbar-thin" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
          {attachments.map((file, i) => (
            <AttachmentCard
              key={`${file.name}-${i}`}
              file={file}
              index={i}
              onRemove={onAttachmentRemove}
              preview={attachmentPreviews[i]}
            />
          ))}
        </div>
      )}

      <div className="px-3 sm:px-4 py-3 max-w-3xl mx-auto">
        <div
          className="flex items-end gap-2 rounded-2xl px-3 py-2 transition-colors border"
          style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-default)' }}
        >
          <button
            type="button"
            onClick={onVoiceInput}
            className="p-2 rounded-xl shrink-0 transition-colors touch-manipulation hidden sm:block"
            style={{ color: 'var(--text-tertiary)' }}
            aria-label="Voice input"
          >
            <Mic size={19} />
          </button>

          <label className="p-2 rounded-xl shrink-0 cursor-pointer transition-colors touch-manipulation hidden sm:block" style={{ color: 'var(--text-tertiary)' }}>
            <Paperclip size={19} />
            <input
              type="file"
              multiple
              onChange={onFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.py,.js,.ts,.java,.cpp,.c,.png,.jpg,.jpeg,.csv,.md,.html,.css,.rs,.go,.rb"
              ref={fileInputRef}
            />
          </label>

          {onToolPaletteToggle && (
            <button
              type="button"
              onClick={onToolPaletteToggle}
              className="p-2 rounded-xl shrink-0 transition-colors touch-manipulation"
              style={{ color: toolPaletteOpen ? 'var(--accent)' : 'var(--text-tertiary)', backgroundColor: toolPaletteOpen ? 'var(--accent-10)' : 'transparent' }}
              aria-label="Open tools"
            >
              <Plus size={19} />
            </button>
          )}

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            rows={1}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent text-sm outline-none resize-none max-h-[160px] py-1.5 px-1 leading-relaxed"
            style={{ color: 'var(--text-primary)', scrollbarWidth: 'thin' }}
          />

          <button
            type="button"
            onClick={isStreaming ? onStop : onSend}
            disabled={!isStreaming && !hasContent}
            className="p-2 rounded-xl transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation active:scale-90"
            style={{
              backgroundColor: isStreaming ? 'rgba(239,68,68,0.15)' : hasContent ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: isStreaming ? '#ef4444' : hasContent ? 'white' : 'var(--text-muted)',
            }}
            aria-label={isStreaming ? 'Stop generating' : 'Send message'}
          >
            {isStreaming ? <Square size={16} /> : <SendHorizonal size={17} />}
          </button>
        </div>
        <p className="text-[10px] mt-1.5 text-center" style={{ color: 'var(--text-muted)' }}>
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
