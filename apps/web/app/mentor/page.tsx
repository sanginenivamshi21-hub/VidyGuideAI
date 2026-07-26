'use client';

import { useState } from 'react';
import { Bot, RefreshCw, Send, Trash2, ArrowRight } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SUPPORTED_LANGUAGES = {
  English: 'en',
  Telugu: 'te',
  Hindi: 'hi',
  Tamil: 'ta',
  Kannada: 'kn',
  Malayalam: 'ml',
  Marathi: 'mr',
  Bengali: 'bn',
  Gujarati: 'gu',
};

const SUGGESTIONS = [
  { label: '💻 Software Interview', text: 'How do I prepare for a software engineer interview in India?' },
  { label: '🎓 Lateral Entry Study', text: 'Should I pursue lateral entry to B.Tech after my polytechnic diploma?' },
  { label: '⚡ ITI Apprenticeships', text: 'What are the top NAPS apprenticeship companies for ITI fitters?' },
  { label: '🔄 Career Transition', text: 'How can I switch from non-technical sales into a software development role?' },
];

export default function MentorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Namaste! I am your VidyGuide AI Academic Mentor. Ask me anything about career paths, degree options, college selections, domain switches, or interview preparations.',
    },
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    if (!textToSend) {
      setInput('');
    }

    const newMessages = [...messages, { role: 'user', content: text } as Message];
    setMessages(newMessages);
    setLoading(true);

    try {
      const resp = await fetch('http://localhost:8000/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          reply_language: SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES] || 'en',
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Failed to get mentor response.');
      }

      setMessages([...newMessages, { role: 'assistant', content: data.response }]);

      // Save to user history database
      const user = localStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        if (parsedUser.id !== null) {
          await fetch('http://localhost:8000/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              actionType: 'mentor',
              title: `Mentor - ${text.substring(0, 45)}...`,
              payload: {
                question: text,
                language,
              },
              result: data.response,
            }),
          });
        }
      }
    } catch (err: any) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: `⚠️ Error: ${err.message || 'Could not communicate with mentor.'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: '👋 Conversation cleared! Ask me anything about your academic or career goals.',
      },
    ]);
    setInput('');
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto h-[85vh] py-2">
      {/* Header section */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400 text-xl">
            🤖
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-white tracking-tight">AI Mentor Chat</h1>
            <p className="text-slate-500 text-xs">
              Localized academic & career guidance counseling.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg px-3 py-1.5 outline-none text-xs transition-all font-semibold cursor-pointer"
          >
            {Object.keys(SUPPORTED_LANGUAGES).map((langName) => (
              <option key={langName} value={langName}>
                {langName}
              </option>
            ))}
          </select>

          <button
            onClick={handleClear}
            className="p-2 rounded-lg bg-slate-950 border border-slate-850 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-all duration-200"
            title="Clear Chat Log"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Suggested Questions</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SUGGESTIONS.map((item) => (
              <button
                key={item.label}
                onClick={() => handleSend(item.text)}
                className="text-left p-3.5 bg-slate-900/50 hover:bg-slate-900 border border-slate-850 hover:border-cyan-500/30 text-xs font-semibold text-slate-350 hover:text-white rounded-xl flex items-center justify-between group transition-all"
              >
                <span>{item.label}</span>
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Log View */}
      <div className="flex-1 overflow-y-auto bg-slate-950/40 border border-slate-850 rounded-2xl p-6 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3.5 max-w-[85%] ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`p-2 rounded-full text-sm shrink-0 mt-1 select-none ${
                msg.role === 'user' ? 'bg-emerald-600/20 text-emerald-400' : 'bg-cyan-600/20 text-cyan-400'
              }`}
            >
              {msg.role === 'user' ? '👤' : '🌿'}
            </div>
            <div
              className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-emerald-600/10 border border-emerald-500/20 text-white rounded-tr-sm font-medium'
                  : 'bg-slate-900 border border-slate-800/80 text-slate-200 rounded-tl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-start gap-3.5 max-w-[85%]">
            <div className="p-2 rounded-full bg-cyan-605/20 text-cyan-450 text-sm select-none">
              🌿
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 text-slate-450 text-xs font-semibold rounded-2xl rounded-tl-sm flex items-center gap-2">
              <RefreshCw className="animate-spin text-cyan-400" size={14} />
              Mentor is composing advice...
            </div>
          </div>
        )}
      </div>

      {/* Input panel */}
      <div className="flex gap-3 bg-slate-900/60 border border-slate-850 p-3 rounded-xl backdrop-blur-md">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything about careers, interviews, skills, or life decisions..."
          className="flex-1 bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-cyan-500 text-white text-sm rounded-lg px-4 py-2.5 outline-none transition-all"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="p-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-sm rounded-lg active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all shrink-0"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
