'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mic, X, Loader2, CheckCircle2, AlertCircle, Volume2, StopCircle } from 'lucide-react';

type VoiceState = 'idle' | 'requesting' | 'recording' | 'transcribing' | 'done' | 'error' | 'no-speech' | 'denied';

interface VoiceRecorderProps {
  open: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
  lang?: string;
}

const BAR_COUNT = 28;

function WaveformBars({ amplitude }: { amplitude: number }) {
  return (
    <div className="flex items-center gap-[2px] h-14 justify-center">
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const center = BAR_COUNT / 2;
        const dist = Math.abs(i - center);
        const maxDist = BAR_COUNT / 2;
        const baseHeight = 4;
        const maxHeight = 48;
        const amp = amplitude * (1 - dist / maxDist * 0.5);
        const height = Math.max(baseHeight, Math.min(maxHeight, baseHeight + amp * (maxHeight - baseHeight)));
        return (
          <motion.div
            key={i}
            className="w-[3px] rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
            animate={{ height }}
            transition={{
              duration: 0.08 + Math.random() * 0.06,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}

const LANG_MAP: Record<string, string> = {
  en: 'en-US', hi: 'hi-IN', te: 'te-IN', ta: 'ta-IN', kn: 'kn-IN',
  ml: 'ml-IN', mr: 'mr-IN', bn: 'bn-IN', gu: 'gu-IN',
};

function tryHaptic() {
  try {
    if (navigator.vibrate) navigator.vibrate(10);
  } catch { }
}

export default function VoiceRecorder({ open, onClose, onResult, lang }: VoiceRecorderProps) {
  const [state, setState] = useState<VoiceState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [amplitude, setAmplitude] = useState(0.3);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ampIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (ampIntervalRef.current) { clearInterval(ampIntervalRef.current); ampIntervalRef.current = null; }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch { }
      recognitionRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setState('idle');
      setElapsed(0);
      setErrorMsg('');
      setAmplitude(0.3);
      cleanup();
      return;
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setErrorMsg('Speech recognition not supported in this browser');
      setState('error');
      return;
    }

    tryHaptic();
    setState('requesting');

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = LANG_MAP[lang || 'en'] || 'en-US';

    recognition.onstart = () => {
      setState('recording');
      setElapsed(0);
      tryHaptic();
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
      ampIntervalRef.current = setInterval(() => {
        setAmplitude(0.15 + Math.random() * 0.75);
      }, 100);
    };

    recognition.onresult = (event: any) => {
      cleanup();
      setState('transcribing');
      setAmplitude(0.2);
      const transcript = event.results[0][0].transcript;
      setTimeout(() => {
        setState('done');
        tryHaptic();
        setTimeout(() => {
          onResult(transcript);
          onClose();
        }, 600);
      }, 500);
    };

    recognition.onerror = (event: any) => {
      cleanup();
      setAmplitude(0.1);
      const err = event.error;
      if (err === 'no-speech') {
        setState('no-speech');
        setErrorMsg('No speech detected');
      } else if (err === 'not-allowed') {
        setState('denied');
        setErrorMsg('Microphone access denied');
      } else {
        setState('error');
        setErrorMsg(`Error: ${err}`);
      }
    };

    recognition.onend = () => {
      cleanup();
      if (state === 'requesting') {
        setState('error');
        setErrorMsg('Could not start recording');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();

    return cleanup;
  }, [open]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const getMicGlow = () => {
    if (state === 'recording') return { boxShadow: `0 0 ${20 + amplitude * 30}px ${10 + amplitude * 15}px rgba(16,185,129,${0.15 + amplitude * 0.25})` };
    return {};
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
          style={{ backgroundColor: 'var(--overlay)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300, mass: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-7 flex flex-col items-center gap-5 safe-area-bottom"
            style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-default)' }}
          >
            <button
              onClick={onClose}
              className="absolute top-3.5 right-3.5 p-2 rounded-full transition-colors touch-manipulation"
              style={{ color: 'var(--text-tertiary)' }}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {state === 'idle' && <div className="h-6" />}

            {state === 'requesting' && (
              <div className="flex flex-col items-center gap-2 py-4">
                <Loader2 size={22} className="animate-spin" style={{ color: 'var(--accent)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Starting microphone...</span>
              </div>
            )}

            {state === 'recording' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-2"
              >
                <motion.div
                  className="flex items-center gap-2"
                  animate={{ opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#ef4444' }} />
                  <span className="text-2xl font-mono font-bold tracking-widest" style={{ color: 'var(--text-primary)' }}>
                    {formatTime(elapsed)}
                  </span>
                </motion.div>
                <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                  Recording
                </span>
              </motion.div>
            )}

            {state === 'transcribing' && (
              <div className="flex flex-col items-center gap-2 py-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 size={22} style={{ color: 'var(--accent)' }} />
                </motion.div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Transcribing...
                </span>
              </div>
            )}

            {state === 'done' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-2 py-2"
              >
                <CheckCircle2 size={28} style={{ color: 'var(--accent)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>Done!</span>
              </motion.div>
            )}

            {(state === 'error' || state === 'no-speech' || state === 'denied') && (
              <div className="flex flex-col items-center gap-2 py-2">
                <AlertCircle size={24} className="text-red-400" />
                <span className="text-xs font-semibold text-red-400">{errorMsg}</span>
              </div>
            )}

            <div className="relative flex items-center justify-center my-1">
              {state === 'recording' && (
                <>
                  <motion.div
                    className="absolute rounded-full"
                    style={{ width: 110, height: 110, backgroundColor: `rgba(16,185,129,${0.04 + amplitude * 0.08})` }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 1.6 + (1 - amplitude) * 0.8, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute rounded-full"
                    style={{ width: 84, height: 84, backgroundColor: `rgba(16,185,129,${0.06 + amplitude * 0.1})` }}
                    animate={{ scale: [1, 1.25, 1], opacity: [0.25, 0, 0.25] }}
                    transition={{ duration: 1.3 + (1 - amplitude) * 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
                  />
                </>
              )}

              <motion.div
                className="p-5 rounded-full relative z-10"
                style={{
                  backgroundColor:
                    state === 'error' || state === 'no-speech' || state === 'denied'
                      ? 'rgba(239,68,68,0.12)'
                      : 'rgba(16,185,129,0.12)',
                  ...getMicGlow(),
                }}
                animate={
                  state === 'recording'
                    ? {
                        scale: [1, 1.04 + amplitude * 0.04, 1],
                      }
                    : { scale: 1 }
                }
                transition={
                  state === 'recording'
                    ? { duration: 0.8 + (1 - amplitude) * 0.6, repeat: Infinity, ease: 'easeInOut' }
                    : {}
                }
              >
                {state === 'recording' || state === 'requesting' ? (
                  <Volume2 size={26} style={{ color: 'var(--accent)' }} />
                ) : state === 'transcribing' || state === 'done' ? (
                  <CheckCircle2 size={26} style={{ color: 'var(--accent)' }} />
                ) : (
                  <Mic
                    size={26}
                    className={
                      state === 'error' || state === 'no-speech' || state === 'denied' ? 'text-red-400' : ''
                    }
                    style={{ color: state === 'error' || state === 'no-speech' || state === 'denied' ? undefined : 'var(--accent)' }}
                  />
                )}
              </motion.div>
            </div>

            {state === 'recording' && <WaveformBars amplitude={amplitude} />}

            {state === 'recording' && (
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    cleanup();
                    onClose();
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => {
                    cleanup();
                    setState('transcribing');
                    setTimeout(() => {
                      setState('done');
                      setTimeout(() => {
                        onResult('[Recording stopped]');
                        onClose();
                      }, 600);
                    }, 500);
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
                  style={{ color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <StopCircle size={16} />
                  Stop
                </motion.button>
              </div>
            )}

            {(state === 'error' || state === 'no-speech' || state === 'denied') && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)' }}
              >
                Dismiss
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
