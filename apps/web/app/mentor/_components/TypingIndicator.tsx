export default function TypingIndicator() {
  return (
    <div className="flex justify-start mb-4 message-enter">
      <div
        className="px-4 py-3 rounded-2xl rounded-bl-md"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
      >
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="w-2 h-2 rounded-full thinking-dot" style={{ backgroundColor: 'var(--accent)' }} />
          <span className="w-2 h-2 rounded-full thinking-dot" style={{ backgroundColor: 'var(--accent)' }} />
          <span className="w-2 h-2 rounded-full thinking-dot" style={{ backgroundColor: 'var(--accent)' }} />
        </div>
      </div>
    </div>
  );
}
