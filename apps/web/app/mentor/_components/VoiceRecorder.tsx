'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

type VoiceState = 'idle' | 'recording' | 'transcribing' | 'done' | 'error';

interface VoiceRecorderProps {
  open: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
  lang?: string;
}

function WaveformBars() {
  return (
    <div className="flex items-center gap-[3px] h-12">
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{ backgroundColor: 'var(--accent)' }}
          animate={{
            height: [8, 12 + Math.random() * 28, 8],
          }}
          transition={{
            duration: 0.4 + Math.random() * 0.4,
            repeat: Infinity,
            delay: i * 0.04,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

const LANG_MAP: Record<string, string> = {
  en: 'en-US', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN',
  ml: 'ml-IN', mr: 'mr-IN', bn: 'bn-IN', gu: 'gu-IN',
};

export default function VoiceRecorder({ open, onClose, onResult, lang }: VoiceRecorderProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!open) {
      setState('idle');
      setElapsed(0);
      setErrorMsg('');
      recognitionRef.current?.abort();
      clearInterval(timerRef.current);
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setErrorMsg('Speech recognition not supported in this browser');
      setState('error');
      return;
    }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = LANG_MAP[lang || 'en'] || 'en-US';

    recognition.onstart = () => {
      setState('recording');
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
    };

    recognition.onresult = (event: any) => {
      clearInterval(timerRef.current);
      setState('transcribing');
      const transcript = event.results[0][0].transcript;
      setTimeout(() => {
        setState('done');
        setTimeout(() => {
          onResult(transcript);
          onClose();
        }, 600);
      }, 600);
    };

    recognition.onerror = (event: any) => {
      clearInterval(timerRef.current);
      setState('error');
      setErrorMsg(event.error === 'no-speech' ? 'No speech detected' : `Error: ${event.error}`);
    };

    recognition.onend = () => {
      clearInterval(timerRef.current);
      if (state === 'recording') {
        setState('error');
        setErrorMsg('Recording ended unexpectedly');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();

    return () => {
      recognition.abort();
      clearInterval(timerRef.current);
    };
  }, [open]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const getMicGlow = () => {
    if (state === 'recording') return { boxShadow: '0 0 30px 10px rgba(16,185,129,0.3), 0 0 60px 20px rgba(16,185,129,0.15)' };
    return {};
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-950/70"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-sm bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 flex flex-col items-center gap-6 safe-area-bottom"
          >
            {/* Close button */}
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-800 text-slate-400 transition-colors">
              <X size={18} />
            </button>

            {/* Timer or status */}
            {state === 'idle' && <div className="h-8" />}

            {state === 'recording' && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-mono font-bold text-white tracking-wider">{formatTime(elapsed)}</span>
                <span className="text-xs text-emerald-400 font-semibold">Recording...</span>
              </div>
            )}

            {state === 'transcribing' && (
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Transcribing...
                </span>
              </div>
            )}

            {state === 'done' && (
              <div className="flex flex-col items-center gap-1">
                <CheckCircle2 size={24} className="text-emerald-400" />
                <span className="text-xs text-emerald-400 font-semibold">Done!</span>
              </div>
            )}

            {state === 'error' && (
              <div className="flex flex-col items-center gap-1">
                <AlertCircle size={24} className="text-red-400" />
                <span className="text-xs text-red-400 font-semibold">{errorMsg}</span>
              </div>
            )}

            {/* Animated Mic */}
            <div className="relative flex items-center justify-center">
              {state === 'recording' && (
                <>
                  <motion.div
                    className="absolute rounded-full"
                    style={{ width: 100, height: 100, backgroundColor: 'rgba(16,185,129,0.08)' }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute rounded-full"
                    style={{ width: 76, height: 76, backgroundColor: 'rgba(16,185,129,0.12)' }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                  />
                </>
              )}

              <motion.div
                className="p-5 rounded-full relative z-10"
                style={{
                  backgroundColor: state === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                  ...getMicGlow(),
                }}
                animate={state === 'recording' ? { scale: [1, 1.05, 1] } : { scale: 1 }}
                transition={state === 'recording' ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
              >
                <Mic
                  size={28}
                  className={state === 'error' ? 'text-red-400' : 'text-emerald-400'}
                />
              </motion.div>
            </div>

            {/* Waveform */}
            {(state === 'recording') && <WaveformBars />}

            {/* Cancel / Retry */}
            {state === 'recording' && (
              <button
                onClick={() => {
                  recognitionRef.current?.abort();
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-red-400 bg-red-500/10 border border-red-500/20 transition-all active:scale-[0.97]"
              >
                Cancel
              </button>
            )}

            {state === 'error' && (
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-300 bg-slate-800 border border-slate-700 transition-all active:scale-[0.97]"
              >
                Dismiss
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
