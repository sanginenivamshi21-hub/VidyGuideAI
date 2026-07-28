'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { API_BASE } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import ChatHeader from './_components/ChatHeader';
import ChatMessages from './_components/ChatMessages';
import ChatComposer from './_components/ChatComposer';
import ConversationDrawer from './_components/ConversationDrawer';
import ToolPalette from './_components/ToolPalette';
import VoiceRecorder from './_components/VoiceRecorder';
import type { ChatMessage, Conversation } from './types';

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export default function MentorPage() {
  const { settings, updateSettings } = useSettings();
  const { isAuthenticated } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentPreviews, setAttachmentPreviews] = useState<Record<number, string>>({});
  const [fileError, setFileError] = useState('');
  const [toolPaletteOpen, setToolPaletteOpen] = useState(false);
  const [voiceRecorderOpen, setVoiceRecorderOpen] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (isAuthenticated) fetchConversations();
  }, [isAuthenticated]);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${API_BASE}/conversations`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
      }
    } catch { /* ignore */ }
  };

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setActiveConvId(null);
    setInput('');
    setAttachments([]);
    setAttachmentPreviews({});
    setFileError('');
    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
      streamAbortRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const loadConversation = useCallback(async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/conversations/${id}`, { credentials: 'include' });
      if (res.ok) {
        const conv = await res.json();
        setActiveConvId(conv.id);
        setMessages(
          (conv.messages || []).map((m: any) => ({
            role: m.role,
            content: m.content,
            timestamp: m.createdAt,
          }))
        );
      }
    } catch { /* ignore */ }
  }, []);

  const deleteConversation = useCallback(async (id: number) => {
    try {
      await fetch(`${API_BASE}/conversations/${id}`, { method: 'DELETE', credentials: 'include' });
      if (activeConvId === id) {
        setActiveConvId(null);
        setMessages([]);
      }
      fetchConversations();
    } catch { /* ignore */ }
  }, [activeConvId]);

  const togglePin = useCallback(async (conv: Conversation) => {
    try {
      await fetch(`${API_BASE}/conversations/${conv.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pinned: !conv.pinned }),
      });
      fetchConversations();
    } catch { /* ignore */ }
  }, []);

  const renameConversation = useCallback(async (id: number, title: string) => {
    try {
      await fetch(`${API_BASE}/conversations/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      fetchConversations();
    } catch { /* ignore */ }
  }, []);

  const saveMessage = useCallback(async (role: string, content: string) => {
    if (!activeConvId) return;
    try {
      await fetch(`${API_BASE}/conversations/${activeConvId}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, content }),
      });
    } catch { /* ignore */ }
  }, [activeConvId]);

  const scrollToBottom = useCallback(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    const handleScroll = () => {
      setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 300);
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const insertToolResult = useCallback((text: string) => {
    setMessages((prev) => [...prev, {
      role: 'assistant',
      content: text,
      timestamp: getTimestamp(),
    }]);
    if (activeConvId && settings.chatHistory) saveMessage('assistant', text);
  }, [activeConvId, settings.chatHistory]);

  const stopStreaming = useCallback(() => {
    if (streamAbortRef.current) {
      streamAbortRef.current.abort();
      streamAbortRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const toggleAutoSpeak = () => updateSettings({ autoSpeak: !settings.autoSpeak });

  useKeyboardShortcuts([
    { key: '/', ctrl: true, handler: () => setShowShortcuts((s) => !s), description: 'Toggle shortcuts' },
    { key: 'Escape', handler: () => { stopStreaming(); setShowShortcuts(false); }, description: 'Stop/Close' },
    { key: 'Enter', ctrl: true, handler: () => { if (input.trim() && !isStreaming) sendMessage(input.trim()); }, description: 'Send message' },
    { key: 'm', ctrl: true, shift: true, handler: () => toggleAutoSpeak(), description: 'Toggle speech' },
    { key: 'k', ctrl: true, handler: () => document.querySelector<HTMLTextAreaElement>('textarea')?.focus(), description: 'Focus input' },
    { key: 'n', ctrl: true, shift: true, handler: () => handleNewChat(), description: 'New chat' },
  ]);

  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*\[\]()>|`\-\\]/g, '').slice(0, 2000);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = settings.speechRate;
    utterance.pitch = settings.speechPitch;
    if (settings.voiceName) {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.name === settings.voiceName);
      if (voice) utterance.voice = voice;
    }
    window.speechSynthesis.speak(utterance);
  }, [settings.speechRate, settings.speechPitch, settings.voiceName]);

  const copyToClipboard = useCallback((text: string) => navigator.clipboard.writeText(text), []);

  const getTimestamp = useCallback(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), []);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) return `${file.name} exceeds the 20MB limit`;
    return null;
  }, []);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const errors: string[] = [];
      const validFiles: File[] = [];

      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) errors.push(error);
        else validFiles.push(file);
      }

      if (errors.length > 0) setFileError(errors.join('\n'));
      if (validFiles.length > 0) {
        setAttachments((prev) => {
          const previews: Record<number, string> = {};
          validFiles.forEach((file, idx) => {
            if (file.type.startsWith('image/')) {
              previews[prev.length + idx] = URL.createObjectURL(file);
            }
          });
          setAttachmentPreviews((p) => ({ ...p, ...previews }));
          return [...prev, ...validFiles];
        });
      }
    },
    []
  );

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  }, [addFiles]);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => {
      const removed = prev[index];
      if (removed?.type.startsWith('image/')) {
        URL.revokeObjectURL(attachmentPreviews[index]);
      }
      return prev.filter((_, i) => i !== index);
    });
    setAttachmentPreviews((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  }, [attachmentPreviews]);

  const processAttachments = async (): Promise<string> => {
    if (attachments.length === 0) return '';
    let extraText = '\n\n[Attachments:\n';
    for (const file of attachments) {
      if (
        file.type === 'application/pdf' ||
        file.type.startsWith('image/') ||
        file.type.startsWith('text/')
      ) {
        const fd = new FormData();
        fd.append('file', file);
        try {
          const res = await fetch(`${API_BASE}/ocr/scan`, { method: 'POST', body: fd });
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
        extraText += `--- ${file.name} ---\n(attached file: ${file.name}, ${file.size} bytes)\n`;
      }
    }
    extraText += ']';
    return extraText;
  };

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() && attachments.length === 0) return;
      if (isStreaming) return;

      const attachmentText = await processAttachments();
      const fullText = text + attachmentText;
      if (!fullText.trim()) return;

      const fileInfo = attachments.map((f) => ({ name: f.name, type: f.type, size: f.size }));

      let convId = activeConvId;
      if (!convId) {
        try {
          const res = await fetch(`${API_BASE}/conversations`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: text.slice(0, 50) }),
          });
          if (res.ok) {
            const conv = await res.json();
            convId = conv.id;
            setActiveConvId(conv.id);
            fetchConversations();
          }
        } catch { /* ignore */ }
      }

      const userMessage: ChatMessage = {
        role: 'user',
        content: fullText,
        timestamp: getTimestamp(),
        attachments: fileInfo.length > 0 ? fileInfo : undefined,
      };
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
      setAttachments([]);
      setAttachmentPreviews({});
      setFileError('');

      if (convId && settings.chatHistory) saveMessage('user', fullText);

      setIsStreaming(true);
      const controller = new AbortController();
      streamAbortRef.current = controller;

      try {
        const historyMessages = messages.map((m) => ({ role: m.role, content: m.content }));
        const res = await fetch(`${API_BASE}/mentor/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: fullText,
            reply_language: settings.language,
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
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '', timestamp: getTimestamp() },
        ]);
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
                  setMessages((prev) => {
                    const next = [...prev];
                    next[next.length - 1] = {
                      role: 'assistant',
                      content: fullContent,
                      timestamp: next[next.length - 1].timestamp,
                    };
                    return next;
                  });
                }
              } catch { /* skip malformed */ }
            }
          }
        }

        if (convId && fullContent && settings.chatHistory) {
          saveMessage('assistant', fullContent);
        }

        if (settings.autoSpeak && fullContent) speakText(fullContent);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = {
              role: 'assistant',
              content:
                '❌ **Unable to generate response.**\n\nPossible reasons: network issue, API quota exceeded, or service unavailable.\n\n> Try again or check your connection.',
              timestamp: next[next.length - 1]?.timestamp,
            };
            return next;
          });
        }
      }
      setIsStreaming(false);
      streamAbortRef.current = null;
    },
    [messages, attachments, activeConvId, isStreaming, settings]
  );

  const startVoiceInput = useCallback(() => {
    setVoiceRecorderOpen(true);
  }, []);

  const handleVoiceResult = useCallback((text: string) => {
    setInput((prev) => prev + ' ' + text);
    setTimeout(() => document.querySelector<HTMLTextAreaElement>('textarea')?.focus(), 100);
  }, []);

  const regenerateLast = useCallback(() => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      setMessages((prev) => prev.slice(0, prev.length - 1));
      sendMessage(lastUserMsg.content);
    }
  }, [messages, sendMessage]);

  const continueLast = useCallback(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'assistant' && lastMsg.content) {
        setInput('... continue from the previous response');
      }
    }
  }, [messages]);

  return (
    <>
      <ConversationDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        conversations={conversations}
        activeConvId={activeConvId}
        onSelect={loadConversation}
        onDelete={deleteConversation}
        onPin={togglePin}
        onNewChat={handleNewChat}
        onRename={renameConversation}
      />

      <div className="flex h-full overflow-hidden lg:-mx-8 lg:w-[calc(100%+4rem)]">
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          <ChatHeader
            onToggleDrawer={() => setDrawerOpen((s) => !s)}
            onNewChat={handleNewChat}
            onToggleShortcuts={() => setShowShortcuts((s) => !s)}
            hasMessages={messages.length > 0}
          />

          <div
            ref={chatRef}
            className="flex-1 overflow-y-auto scrollbar-thin"
            onDragOver={(e) => { e.preventDefault(); }}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
            }}
          >
            <ChatMessages
              messages={messages}
              isStreaming={isStreaming}
              showScrollBtn={showScrollBtn}
              onScrollToBottom={scrollToBottom}
              onSuggestionSelect={(q) => sendMessage(q)}
              onRegenerate={regenerateLast}
              onContinue={continueLast}
              onSpeak={speakText}
            />
          </div>

          <ChatComposer
            input={input}
            onInputChange={setInput}
            onSend={() => sendMessage(input)}
            onStop={stopStreaming}
            isStreaming={isStreaming}
            attachments={attachments}
            attachmentPreviews={attachmentPreviews}
            onAttachmentsChange={setAttachments}
            onAttachmentRemove={removeAttachment}
            onFileSelect={handleFileSelect}
            onVoiceInput={startVoiceInput}
            fileError={fileError}
            fileInputRef={fileInputRef}
            toolPaletteOpen={toolPaletteOpen}
            onToolPaletteToggle={() => setToolPaletteOpen((s) => !s)}
          />

          <ToolPalette
            onResult={insertToolResult}
            isOpen={toolPaletteOpen}
            onClose={() => setToolPaletteOpen(false)}
            onOpen={() => setToolPaletteOpen(true)}
          />
        </div>
      </div>

      {showShortcuts && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center"
          onClick={() => setShowShortcuts(false)}
        >
          <div
            className="surface-modal p-6 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-white mb-4">Keyboard Shortcuts</h3>
            <div className="space-y-2.5">
              {[
                { keys: 'Ctrl + /', label: 'Toggle shortcuts' },
                { keys: 'Ctrl + Enter', label: 'Send message' },
                { keys: 'Ctrl + Shift + N', label: 'New chat' },
                { keys: 'Ctrl + K', label: 'Focus input' },
                { keys: 'Esc', label: 'Stop generation' },
                { keys: 'Ctrl + Shift + M', label: 'Toggle auto-speak' },
                { keys: 'Shift + Enter', label: 'New line' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{s.label}</span>
                  <kbd
                    className="px-2 py-0.5 border border-slate-800 rounded text-slate-300 font-mono text-[10px] bg-slate-800"
                  >
                    {s.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <VoiceRecorder
        open={voiceRecorderOpen}
        onClose={() => setVoiceRecorderOpen(false)}
        onResult={handleVoiceResult}
        lang={settings.language}
      />
    </>
  );
}
