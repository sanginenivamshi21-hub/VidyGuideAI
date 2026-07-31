'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Languages, RefreshCw, Copy, Check, Trash2, ArrowDownUp } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAnimationsEnabled } from '@/hooks/useAnimations';

const SUPPORTED_LANGUAGES: Record<string, string> = {
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
  const { t } = useI18n();
  const animationsEnabled = useAnimationsEnabled();

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError(t('translator.emptyError'));
      return;
    }
    setError('');
    setLoading(true);
    setTranslatedText('');
    try {
      const data = await api('/translator', {
        method: 'POST',
        body: {
          text,
          source_lang: SUPPORTED_LANGUAGES[sourceLang] || 'en',
          target_lang: SUPPORTED_LANGUAGES[targetLang] || 'te',
        },
      });
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
    <motion.div
      initial={animationsEnabled ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-6 max-w-5xl mx-auto py-4"
    >
      <div className="flex items-center gap-4">
        <div className="icon-box" style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-10)' }}>
          <Languages size={20} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-h1">{t('translator.title')}</h1>
          <p className="text-caption mt-0.5">{t('translator.subtitle')}</p>
        </div>
      </div>

      <div className="glass surface-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 gap-3 max-w-2xl">
        <select
          value={sourceLang}
          onChange={(e) => setSourceLang(e.target.value)}
          className="select-field text-xs font-semibold cursor-pointer flex-1"
          aria-label={t('translator.source')}
        >
          {Object.keys(SUPPORTED_LANGUAGES).map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <motion.button
          whileTap={animationsEnabled ? { scale: 0.9, rotate: 180 } : undefined}
          onClick={handleSwap}
          className="btn btn-secondary p-2.5 self-center"
          title={t('translator.swap')}
          aria-label={t('translator.swap')}
        >
          <ArrowDownUp size={15} />
        </motion.button>

        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          className="select-field text-xs font-semibold cursor-pointer flex-1"
          aria-label={t('translator.translated')}
        >
          {Object.keys(SUPPORTED_LANGUAGES).map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass surface-card flex flex-col gap-3 p-5">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            <span>{t('translator.source')} ({sourceLang})</span>
            {text && (
              <button onClick={handleClear} className="btn btn-ghost p-1" title={t('translator.clearInput')} aria-label={t('translator.clearInput')}>
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('translator.placeholder')}
            rows={10}
            className="input-field text-sm resize-none"
            aria-label={t('translator.source')}
          />
        </div>

        <div className="glass surface-card flex flex-col gap-3 p-5">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            <span>{t('translator.translated')} ({targetLang})</span>
            {translatedText && (
              <button onClick={handleCopy} className="btn btn-ghost gap-1 text-xs normal-case font-semibold" title={t('translator.copyTranslation')}>
                {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                <span>{copied ? t('common.copied') : t('common.copy')}</span>
              </button>
            )}
          </div>
          <div
            className="input-field min-h-[224px] text-sm whitespace-pre-wrap leading-relaxed select-text overflow-y-auto"
            style={{ color: 'var(--text-primary)' }}
            aria-live="polite"
          >
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={animationsEnabled ? { opacity: 0 } : false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-xs font-semibold"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <RefreshCw className="animate-spin" size={14} style={{ color: 'var(--accent)' }} />
                  {t('translator.translating')}
                </motion.div>
              ) : (
                <motion.div
                  key="result"
                  initial={animationsEnabled ? { opacity: 0, y: 4 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {translatedText || <span className="italic" style={{ color: 'var(--text-muted)' }}>{t('translator.outputHint')}</span>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={animationsEnabled ? { opacity: 0, y: -6 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="alert alert-error max-w-xl mx-auto w-full"
            role="alert"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileTap={animationsEnabled ? { scale: 0.97 } : undefined}
        onClick={handleTranslate}
        disabled={loading || !text.trim()}
        className="btn btn-primary w-full md:w-auto px-8 py-3 text-sm"
      >
        {loading ? <RefreshCw className="animate-spin" size={15} /> : <Languages size={15} />}
        {loading ? t('translator.translating') : t('translator.translate')}
      </motion.button>
    </motion.div>
  );
}
