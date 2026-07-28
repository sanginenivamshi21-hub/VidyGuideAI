import { useRef, useEffect, useCallback } from 'react';
import { Mic, Paperclip, Square, SendHorizonal } from 'lucide-react';
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
      onSend();
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
      className="shrink-0 border-t safe-area-bottom"
      style={{ backgroundColor: 'rgba(15,23,42,0.95)', borderColor: 'rgba(51,65,85,0.5)' }}
    >
      {fileError && (
        <div className="px-4 py-2" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
          <p className="text-xs text-red-400">{fileError}</p>
        </div>
      )}

      {attachments.length > 0 && (
        <div
          className="px-4 py-2.5 flex gap-2 overflow-x-auto scrollbar-thin"
          style={{ borderBottom: '1px solid rgba(51,65,85,0.3)' }}
        >
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
          className="flex items-end gap-2 rounded-2xl px-3 py-2 border transition-colors focus-within:border-slate-600"
          style={{ backgroundColor: 'rgba(30,41,59,1)', borderColor: 'rgba(51,65,85,0.5)' }}
        >
          <button
            type="button"
            onClick={onVoiceInput}
            className="p-2 rounded-xl hover:bg-slate-700/50 text-slate-400 shrink-0 transition-colors touch-manipulation"
            aria-label="Voice input"
          >
            <Mic size={19} />
          </button>

          <label className="p-2 rounded-xl hover:bg-slate-700/50 text-slate-400 cursor-pointer shrink-0 transition-colors touch-manipulation">
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

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            rows={1}
            placeholder="Ask anything..."
            className="flex-1 bg-transparent text-sm text-slate-200 outline-none resize-none max-h-[160px] py-1.5 px-1 placeholder:text-slate-500 leading-relaxed"
            style={{ scrollbarWidth: 'thin' }}
          />

          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              className="p-2 rounded-xl shrink-0 transition-colors touch-manipulation"
              style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: 'rgb(239,68,68)' }}
              aria-label="Stop generating"
            >
              <Square size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSend}
              disabled={!hasContent}
              className="p-2 rounded-xl transition-all shrink-0 disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
              style={{ backgroundColor: hasContent ? 'var(--accent)' : 'rgba(51,65,85,0.4)', color: hasContent ? 'white' : 'rgba(148,163,184,0.5)' }}
              aria-label="Send message"
            >
              <SendHorizonal size={17} />
            </button>
          )}
        </div>
        <p className="text-[10px] text-slate-600 mt-1.5 text-center">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
