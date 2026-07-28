'use client';

import { useState } from 'react';
import { API_BASE } from '@/lib/api';
import { Languages, RefreshCw, Copy, Check, Trash2 } from 'lucide-react';

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
  Punjabi: 'pa',
  Odia: 'or',
  Urdu: 'ur',
};

export default function TranslatorPage() {
  const [text, setText] = useState('');
  const [sourceLang, setSourceLang] = useState('English');
  const [targetLang, setTargetLang] = useState('Telugu');
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError('Please enter text to translate.');
      return;
    }

    setError('');
    setLoading(true);
    setTranslatedText('');

    try {
      const resp = await fetch(`${API_BASE}/translator`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          text,
          source_lang: SUPPORTED_LANGUAGES[sourceLang as keyof typeof SUPPORTED_LANGUAGES] || 'en',
          target_lang: SUPPORTED_LANGUAGES[targetLang as keyof typeof SUPPORTED_LANGUAGES] || 'te',
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Translation failed.');
      }

      setTranslatedText(data.translated);
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    if (translatedText) {
      setText(translatedText);
      setTranslatedText('');
    }
  };

  const handleClear = () => {
    setText('');
    setTranslatedText('');
    setError('');
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto py-4">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-400 text-2xl">
          🌐
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Translator</h1>
          <p className="text-slate-400 text-sm">
            Break language barriers — translate career documents and texts instantly between English and Indian regional languages.
          </p>
        </div>
      </div>

      {/* Language selections selectors */}
      <div className="flex items-center justify-between bg-slate-900/40 border border-slate-800 rounded-xl p-4 gap-4 max-w-xl">
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-white rounded-lg px-3 py-1.5 outline-none text-xs font-semibold cursor-pointer"
        >
          {Object.keys(SUPPORTED_LANGUAGES).map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <button
          onClick={handleSwap}
          className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-white transition-all duration-200"
          title="Swap Languages"
        >
          <Languages size={15} />
        </button>

        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="bg-slate-950 border border-slate-800 hover:border-slate-700 text-white rounded-lg px-3 py-1.5 outline-none text-xs font-semibold cursor-pointer"
        >
          {Object.keys(SUPPORTED_LANGUAGES).map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Translation Panels grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source Text Panel */}
        <div className="flex flex-col gap-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Source text ({sourceLang})</span>
            {text && (
              <button
                onClick={handleClear}
                className="text-slate-500 hover:text-red-400 transition-all"
                title="Clear input text"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text to translate..."
            rows={10}
            className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-3 outline-none text-sm transition-all resize-none"
          />
        </div>

        {/* Target Text Panel */}
        <div className="flex flex-col gap-3 bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Translated text ({targetLang})</span>
            {translatedText && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-slate-500 hover:text-white transition-all"
                title="Copy Translation"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
          <div className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-lg p-3 text-sm min-h-[224px] whitespace-pre-wrap leading-relaxed select-text font-sans">
            {loading ? (
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <RefreshCw className="animate-spin text-emerald-400" size={14} />
                Translating...
              </div>
            ) : (
              translatedText || <span className="text-slate-600 italic">Translation output will appear here...</span>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg font-medium text-center max-w-xl mx-auto w-full">
          {error}
        </div>
      )}

      {/* Action triggers */}
      <button
        onClick={handleTranslate}
        disabled={loading || !text.trim()}
        className="w-full md:w-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-lg shadow-lg shadow-emerald-500/25 transition-all w-fit"
      >
        Translate
      </button>
    </div>
  );
}
