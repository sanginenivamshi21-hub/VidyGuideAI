'use client';

import { useState, useRef, useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useRouter } from 'next/navigation';
import { API_BASE } from '@/lib/api';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

interface Conversation {
  id: number;
  title: string;
  pinned: boolean;
  archived?: boolean;
  _count?: { messages: number };
  updatedAt: string;
  createdAt: string;
}

export default function MentorPage() {
  const { settings, updateSettings } = useSettings();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [editingTitle, setEditingTitle] = useState<number | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showAttachments, setShowAttachments] = useState(false);
  const [uploading, setUploading] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamAbortRef = useRef<AbortController | null>(null);
  const speechRecRef = useRef<any>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) fetchConversations();
    if (settings.notifications && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [settings.notifications]);

  useEffect(() => {
    const chatEl = chatRef.current;
    if (!chatEl) return;
    const handleScroll = () => {
      setShowScrollBtn(chatEl.scrollHeight - chatEl.scrollTop - chatEl.clientHeight > 200);
    };
    chatEl.addEventListener('scroll', handleScroll);
    return () => chatEl.removeEventListener('scroll', handleScroll);
  }, []);

  useKeyboardShortcuts([
    { key: '/', ctrl: true, handler: () => setShowShortcuts(s => !s), description: 'Toggle shortcuts' },
    { key: 'Escape', handler: () => { stopStreaming(); setShowShortcuts(false); }, description: 'Stop/Close' },
    { key: 'Enter', ctrl: true, handler: () => { if (input.trim() && !isStreaming) sendMessage(input.trim()); }, description: 'Send message' },
    { key: 'm', ctrl: true, shift: true, handler: () => toggleAutoSpeak(), description: 'Toggle speech' },
    { key: 'k', ctrl: true, handler: () => inputRef.current?.focus(), description: 'Search' },
    { key: 'n', ctrl: true, shift: true, handler: () => handleNewChat(), description: 'New chat' },
    { key: ',', ctrl: true, handler: () => router.push('/settings'), description: 'Open settings' },
  ]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('${API_BASE}/conversations', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
      }
    } catch {}
  };

  const handleNewChat = () => {
    setMessages([]);
    setActiveConvId(null);
    setInput('');
    setAttachments([]);
    setShowAttachments(false);
    if (streamAbortRef.current) { streamAbortRef.current.abort(); streamAbortRef.current = null; }
    setIsStreaming(false);
  };

  const createConversation = async () => {
    try {
      const res = await fetch('${API_BASE}/conversations', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' }),
      });
      if (res.ok) {
        const conv = await res.json();
        setActiveConvId(conv.id);
        setMessages([]);
        fetchConversations();
      }
    } catch {}
  };

  const loadConversation = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/conversations/${id}`, { credentials: 'include' });
      if (res.ok) {
        const conv = await res.json();
        setActiveConvId(conv.id);
        setMessages((conv.messages || []).map((m: any) => ({
          role: m.role,
          content: m.content,
          timestamp: m.createdAt,
        })));
        if (window.innerWidth < 768) setShowSidebar(false);
      }
    } catch {}
  };

  const deleteConversation = async (id: number) => {
    try {
      await fetch(`${API_BASE}/conversations/${id}`, { method: 'DELETE', credentials: 'include' });
      if (activeConvId === id) { setActiveConvId(null); setMessages([]); }
      fetchConversations();
    } catch {}
  };

  const togglePin = async (conv: Conversation) => {
    try {
      await fetch(`${API_BASE}/conversations/${conv.id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: !conv.pinned }),
      });
      fetchConversations();
    } catch {}
  };

  const renameConversation = async (id: number, title: string) => {
    try {
      await fetch(`${API_BASE}/conversations/${id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      fetchConversations();
    } catch {}
    setEditingTitle(null);
  };

  const saveMessage = async (role: string, content: string) => {
    if (!activeConvId) return;
    try {
      await fetch(`${API_BASE}/conversations/${activeConvId}/messages`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, content }),
      });
    } catch {}
  };

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const stopStreaming = () => {
    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
      streamAbortRef.current = null;
    }
    setIsStreaming(false);
  };

  const toggleAutoSpeak = () => {
    updateSettings({ autoSpeak: !settings.autoSpeak });
  };

  const regenerateMessage = async () => {
    if (messages.length < 2) return;
    const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      setMessages(prev => prev.slice(0, -1));
      sendMessage(lastUserMsg.content);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getTimestamp = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
    setShowAttachments(true);
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    if (attachments.length <= 1) setShowAttachments(false);
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return '🖼️';
    if (['py', 'js', 'ts', 'java', 'cpp', 'c'].includes(ext)) return '💻';
    if (['csv', 'xlsx', 'xls'].includes(ext)) return '📊';
    if (['zip', 'tar', 'gz'].includes(ext)) return '📦';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const processAttachments = async (): Promise<string> => {
    if (attachments.length === 0) return '';
    let extraText = '\n\n[Attachments:\n';
    for (const file of attachments) {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        const fd = new FormData();
        fd.append('file', file);
        try {
          const res = await fetch('${API_BASE}/ocr/scan', { method: 'POST', body: fd });
          if (res.ok) {
            const data = await res.json();
            extraText += `--- ${file.name} ---\n${data.text || '(no text extracted)'}\n`;
          } else {
            extraText += `--- ${file.name} ---\n(upload failed)\n`;
          }
        } catch {
          extraText += `--- ${file.name} ---\n(upload error)\n`;
        }
      } else {
        extraText += `--- ${file.name} ---\n(attached file: ${file.name}, ${formatFileSize(file.size)})\n`;
      }
    }
    extraText += ']';
    setAttachments([]);
    setShowAttachments(false);
    return extraText;
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() && attachments.length === 0) return;
    if (isStreaming) return;

    const attachmentText = await processAttachments();
    const fullText = text + attachmentText;
    if (!fullText.trim()) return;

    let convId = activeConvId;
    if (!convId) {
      try {
        const res = await fetch('${API_BASE}/conversations', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: text.slice(0, 50) }),
        });
        if (res.ok) {
          const conv = await res.json();
          convId = conv.id;
          setActiveConvId(conv.id);
          fetchConversations();
        }
      } catch {}
    }

    const userMessage: ChatMessage = { role: 'user', content: fullText, timestamp: getTimestamp() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    if (convId && settings.chatHistory) {
      saveMessage('user', fullText);
    }

    setIsStreaming(true);
    const controller = new AbortController();
    streamAbortRef.current = controller;

    try {
      const historyMessages = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch('${API_BASE}/mentor/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: fullText,
          reply_language: settings.language,
          model: settings.model,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
          messages: historyMessages,
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error('Stream failed');

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let fullContent = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '', timestamp: getTimestamp() }]);
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) break;
              if (data.error) throw new Error(data.error);
              if (data.content) {
                fullContent += data.content;
                setMessages(prev => {
                  const newMsgs = [...prev];
                  newMsgs[newMsgs.length - 1] = { role: 'assistant', content: fullContent, timestamp: newMsgs[newMsgs.length - 1].timestamp };
                  return newMsgs;
                });
              }
            } catch {}
          }
        }
      }

      if (convId && fullContent && settings.chatHistory) {
        saveMessage('assistant', fullContent);
      }

      if (settings.autoSpeak && fullContent) {
        speakText(fullContent);
      }

      if (settings.notifications && fullContent && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('AI Mentor Response', { body: fullContent.slice(0, 120) + (fullContent.length > 120 ? '...' : '') });
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev => {
          const newMsgs = [...prev];
          newMsgs[newMsgs.length - 1] = {
            role: 'assistant',
            content: '❌ **Unable to generate response.**\n\nPossible reasons: network issue, API quota exceeded, or service unavailable.\n\n> Try again or check your connection.',
            timestamp: newMsgs[newMsgs.length - 1]?.timestamp,
          };
          return newMsgs;
        });
      }
    }
    setIsStreaming(false);
    streamAbortRef.current = null;
    scrollToBottom();
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*\[\]()>|`\-\\]/g, '').slice(0, 2000);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = settings.speechRate;
    utterance.pitch = settings.speechPitch;
    if (settings.voiceName) {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.name === settings.voiceName);
      if (voice) utterance.voice = voice;
    }
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceInput = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ **Speech recognition not supported.** Please use Chrome, Edge, or Safari.',
        timestamp: getTimestamp(),
      }]);
      return;
    }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    const langMap: Record<string, string> = { en: 'en-US', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN', ml: 'ml-IN', mr: 'mr-IN', bn: 'bn-IN', gu: 'gu-IN' };
    recognition.lang = langMap[settings.language] || 'en-US';
    recognition.onresult = (event: any) => {
      setInput(prev => prev + ' ' + event.results[0][0].transcript);
      inputRef.current?.focus();
    };
    recognition.onerror = () => {};
    recognition.start();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isStreaming) sendMessage(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isStreaming) sendMessage(input.trim());
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const pinnedConvs = filteredConversations.filter(c => c.pinned);
  const otherConvs = filteredConversations.filter(c => !c.pinned);

  return (
    <div className="flex h-full overflow-hidden">
      {showSidebar && (
        <div className="w-72 flex-shrink-0 border-r flex flex-col" style={{ backgroundColor: 'rgba(15,23,42,0.8)', borderColor: 'rgba(51,65,85,0.5)' }}>
          <div className="p-3 border-b" style={{ borderColor: 'rgba(51,65,85,0.5)' }}>
            <button onClick={createConversation}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-white"
              style={{ backgroundColor: 'var(--accent)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
              New Chat
            </button>
            <div className="relative mt-2">
              <svg className="absolute left-2.5 top-2.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'rgba(100,116,139,1)' }}>
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search chats..."
                className="w-full text-xs rounded-lg pl-8 pr-3 py-2 outline-none border transition-colors"
                style={{ backgroundColor: 'rgba(30,41,59,1)', color: 'rgba(226,232,240,1)', borderColor: 'rgba(51,65,85,0.5)' }} />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            {pinnedConvs.length > 0 && (
              <div className="px-2 pt-2">
                <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-2 py-1">Pinned</div>
                {pinnedConvs.map(conv => (
                  <ConvItem key={conv.id} conv={conv} active={activeConvId === conv.id}
                    onClick={() => loadConversation(conv.id)}
                    onDelete={() => deleteConversation(conv.id)}
                    onPin={() => togglePin(conv)}
                    editing={editingTitle === conv.id}
                    editValue={editTitleValue}
                    onStartEdit={() => { setEditingTitle(conv.id); setEditTitleValue(conv.title); }}
                    onEditChange={v => setEditTitleValue(v)}
                    onSaveEdit={() => renameConversation(conv.id, editTitleValue)}
                    onCancelEdit={() => setEditingTitle(null)} />
                ))}
              </div>
            )}
            <div className="px-2 pt-2">
              {pinnedConvs.length > 0 && <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-2 py-1">Recent</div>}
              {otherConvs.map(conv => (
                <ConvItem key={conv.id} conv={conv} active={activeConvId === conv.id}
                  onClick={() => loadConversation(conv.id)}
                  onDelete={() => deleteConversation(conv.id)}
                  onPin={() => togglePin(conv)}
                  editing={editingTitle === conv.id}
                  editValue={editTitleValue}
                  onStartEdit={() => { setEditingTitle(conv.id); setEditTitleValue(conv.title); }}
                  onEditChange={v => setEditTitleValue(v)}
                  onSaveEdit={() => renameConversation(conv.id, editTitleValue)}
                  onCancelEdit={() => setEditingTitle(null)} />
              ))}
              {filteredConversations.length === 0 && (
                <div className="text-xs text-slate-600 text-center py-8 px-4">
                  {searchQuery ? 'No matching conversations' : 'No conversations yet'}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ backgroundColor: 'rgba(15,23,42,0.5)', borderColor: 'rgba(51,65,85,0.5)' }}>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSidebar(s => !s)} className="p-1.5 rounded hover:bg-slate-800 text-slate-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </button>
            <h1 className="text-sm font-bold text-white">AI Mentor</h1>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setShowShortcuts(s => !s)} className="p-1.5 rounded hover:bg-slate-800 text-slate-400" title="Shortcuts">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M6 16h.01M10 16h.01M14 16h.01M18 16h.01"/></svg>
            </button>
            <button onClick={handleNewChat} className="p-1.5 rounded hover:bg-slate-800 text-slate-400" title="New Chat (Ctrl+Shift+N)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
            </button>
          </div>
        </div>

        <div ref={chatRef} className="flex-1 overflow-y-auto scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-lg mx-auto px-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--accent-10)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)' }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-white mb-1">AI Mentor</h2>
                <p className="text-sm text-slate-400 mb-6">Ask anything about careers, resumes, interviews, or education</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'What career path is right for my skills?',
                    'How to prepare for software interviews?',
                    'Best courses for data science?',
                    'How to switch from IT to product management?',
                  ].map((q, i) => (
                    <button key={i} onClick={() => sendMessage(q)}
                      className="text-left text-xs text-slate-400 rounded-lg p-2.5 border transition-colors hover:text-slate-200"
                      style={{ backgroundColor: 'rgba(30,41,59,0.5)', borderColor: 'rgba(51,65,85,0.5)' }}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-4 px-4">
              {messages.map((msg, i) => (
                <div key={i} className={`mb-4 message-enter flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[85%] min-w-0" style={{
                    backgroundColor: msg.role === 'user' ? 'var(--accent-10)' : 'rgba(30,41,59,0.3)',
                    border: msg.role === 'user' ? '1px solid var(--accent-20)' : '1px solid rgba(51,65,85,0.3)',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '10px 14px',
                  }}>
                    {msg.role === 'user' ? (
                      <p className="text-sm text-slate-200 whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="text-sm text-slate-200">
                        {msg.content ? <MarkdownRenderer content={msg.content} /> : (
                          <div className="flex items-center gap-1.5 py-1">
                            <span className="w-2 h-2 rounded-full thinking-dot" style={{ backgroundColor: 'var(--accent)' }} />
                            <span className="w-2 h-2 rounded-full thinking-dot" style={{ backgroundColor: 'var(--accent)' }} />
                            <span className="w-2 h-2 rounded-full thinking-dot" style={{ backgroundColor: 'var(--accent)' }} />
                          </div>
                        )}
                      </div>
                    )}
                    {msg.timestamp && (
                      <div className="text-[10px] text-slate-500 mt-1 text-right">{msg.timestamp}</div>
                    )}
                    {msg.role === 'assistant' && msg.content && i === messages.length - 1 && !isStreaming && (
                      <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t" style={{ borderColor: 'rgba(51,65,85,0.3)' }}>
                        <button onClick={() => speakText(msg.content)} className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300" title="Read aloud">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                        </button>
                        <button onClick={regenerateMessage} className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300" title="Regenerate">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16"/></svg>
                        </button>
                        <button onClick={() => copyToClipboard(msg.content)} className="p-1 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300" title="Copy">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isStreaming && messages[messages.length - 1]?.content === '' && (
                <div className="flex justify-start mb-4 message-enter">
                  <div className="px-4 py-3 rounded-2xl rounded-bl-md" style={{ backgroundColor: 'rgba(30,41,59,0.3)', border: '1px solid rgba(51,65,85,0.3)' }}>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full thinking-dot" style={{ backgroundColor: 'var(--accent)' }} />
                      <span className="w-2 h-2 rounded-full thinking-dot" style={{ backgroundColor: 'var(--accent)' }} />
                      <span className="w-2 h-2 rounded-full thinking-dot" style={{ backgroundColor: 'var(--accent)' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {showScrollBtn && (
          <button onClick={scrollToBottom}
            className="absolute bottom-28 right-6 p-2 rounded-full shadow-lg border transition-all z-10"
            style={{ backgroundColor: 'rgba(30,41,59,1)', borderColor: 'rgba(51,65,85,0.5)', color: 'rgba(148,163,184,1)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
          </button>
        )}

        {showAttachments && attachments.length > 0 && (
          <div className="px-4 py-2 border-t flex gap-2 overflow-x-auto scrollbar-thin" style={{ backgroundColor: 'rgba(15,23,42,0.8)', borderColor: 'rgba(51,65,85,0.5)' }}>
            {attachments.map((file, i) => (
              <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs shrink-0"
                style={{ backgroundColor: 'rgba(30,41,59,0.5)', borderColor: 'rgba(51,65,85,0.5)' }}>
                <span>{getFileIcon(file.name)}</span>
                <span className="text-slate-300 max-w-[100px] truncate">{file.name}</span>
                <span className="text-slate-500">{formatFileSize(file.size)}</span>
                <button onClick={() => removeAttachment(i)} className="text-slate-500 hover:text-red-400 ml-1">&times;</button>
              </div>
            ))}
          </div>
        )}

        <div className="px-4 py-3 border-t" style={{ backgroundColor: 'rgba(15,23,42,0.8)', borderColor: 'rgba(51,65,85,0.5)' }}>
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 rounded-2xl px-4 py-2 border transition-colors"
              style={{ backgroundColor: 'rgba(30,41,59,1)', borderColor: 'rgba(51,65,85,0.5)' }}>
              <button type="button" onClick={startVoiceInput} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </button>
              <label className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 cursor-pointer shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                </svg>
                <input type="file" multiple onChange={handleFileSelect} className="hidden" accept=".pdf,.doc,.docx,.txt,.py,.js,.ts,.java,.cpp,.c,.png,.jpg,.jpeg,.csv,.zip" />
              </label>
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                rows={1} placeholder="Ask anything about careers, resumes, interviews or education..."
                className="flex-1 bg-transparent text-sm text-slate-200 outline-none resize-none max-h-32 py-1 placeholder:text-slate-500" />
              {isStreaming ? (
                <button type="button" onClick={stopStreaming} className="p-1.5 rounded-lg transition-colors shrink-0"
                  style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: 'rgba(239,68,68,1)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                </button>
              ) : (
                <button type="submit" disabled={!input.trim()}
                  className="p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 text-white"
                  style={{ backgroundColor: input.trim() ? 'var(--accent)' : 'rgba(51,65,85,0.5)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {showShortcuts && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setShowShortcuts(false)}>
          <div className="border rounded-2xl p-6 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}
            style={{ backgroundColor: 'rgba(15,23,42,1)', borderColor: 'rgba(51,65,85,0.5)' }}>
            <h3 className="text-sm font-bold text-white mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-2">
              {[
                { keys: 'Ctrl + /', label: 'Toggle shortcuts' },
                { keys: 'Ctrl + Enter', label: 'Send message' },
                { keys: 'Ctrl + Shift + N', label: 'New chat' },
                { keys: 'Ctrl + K', label: 'Focus search / input' },
                { keys: 'Ctrl + Shift + M', label: 'Toggle auto-speak' },
                { keys: 'Esc', label: 'Stop generation' },
                { keys: 'Shift + Enter', label: 'New line in input' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{s.label}</span>
                  <kbd className="px-2 py-0.5 border rounded text-slate-300 font-mono"
                    style={{ backgroundColor: 'rgba(30,41,59,1)', borderColor: 'rgba(51,65,85,0.5)' }}>{s.keys}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ConvItem({ conv, active, onClick, onDelete, onPin, editing, editValue, onStartEdit, onEditChange, onSaveEdit, onCancelEdit }: {
  conv: Conversation; active: boolean; onClick: () => void; onDelete: () => void; onPin: () => void;
  editing: boolean; editValue: string; onStartEdit: () => void; onEditChange: (v: string) => void; onSaveEdit: () => void; onCancelEdit: () => void;
}) {
  return (
    <div className={`flex items-center gap-1 px-2 py-1.5 rounded-lg group text-xs mb-0.5 ${active ? 'text-emerald-400' : 'text-slate-400 hover:bg-slate-800/60'}`}
      style={active ? { backgroundColor: 'var(--accent-10)', color: 'var(--accent)' } : {}}>
      {editing ? (
        <input value={editValue} onChange={e => onEditChange(e.target.value)}
          onBlur={onSaveEdit} onKeyDown={e => { if (e.key === 'Enter') onSaveEdit(); if (e.key === 'Escape') onCancelEdit(); }}
          autoFocus className="flex-1 bg-slate-700 text-xs text-white rounded px-1 py-0.5 outline-none" />
      ) : (
        <button onClick={onClick} className="flex-1 text-left truncate">{conv.title}</button>
      )}
      <button onClick={onPin} className={`p-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${conv.pinned ? 'opacity-100' : ''}`}
        style={{ color: conv.pinned ? 'var(--accent)' : 'rgba(71,85,105,1)' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill={conv.pinned ? 'var(--accent)' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z"/>
        </svg>
      </button>
      {!editing && (
        <button onClick={onStartEdit} className="p-0.5 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-slate-400 transition-opacity">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
      )}
      <button onClick={onDelete} className="p-0.5 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-opacity">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>
    </div>
  );
}
