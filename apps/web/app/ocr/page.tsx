'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, RefreshCw, Upload, Copy, Check, ArrowRight, Trash2, FileText, FileUp } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import { useI18n } from '@/lib/i18n';
import { useAnimationsEnabled } from '@/hooks/useAnimations';

export default function OcrScannerPage() {
  const router = useRouter();
  const { t } = useI18n();
  const animationsEnabled = useAnimationsEnabled();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (selectedFile: File) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setError('');
    setExtractedText('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const resp = await fetchWithAuth('/ocr/scan', { method: 'POST', body: formData });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || 'OCR processing failed.');
      setExtractedText(data.text);
    } catch (err: any) {
      setError(err.message || 'Failed to scan file. Ensure tesseract-ocr system package is installed.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processFile(dropped);
  }, [processFile]);

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToFeedback = () => {
    localStorage.setItem('temp_ocr_text', extractedText);
    router.push(ROUTES.RESUME_REVIEW);
  };

  const handleClear = () => {
    setFile(null);
    setExtractedText('');
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
          <ScanLine size={20} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-h1">{t('ocr.title')}</h1>
          <p className="text-caption mt-0.5">{t('ocr.subtitle')}</p>
        </div>
      </div>

      <div className="surface-card flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="ocr-file" className="label">{t('ocr.uploadLabel')}</label>
          <motion.div
            animate={{
              scale: dragging ? 1.01 : 1,
              borderColor: dragging ? 'var(--accent)' : 'var(--border-default)',
            }}
            transition={{ duration: 0.15 }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-8 sm:p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors relative"
            style={{ backgroundColor: dragging ? 'var(--accent-10)' : 'var(--bg-input)', borderColor: dragging ? 'var(--accent)' : 'var(--border-default)' }}
            role="button"
            tabIndex={0}
            aria-label={t('ocr.selectFile')}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
          >
            <input
              ref={inputRef}
              id="ocr-file"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.txt,.webp"
              onChange={handleFileUpload}
              className="hidden"
            />
            <motion.div
              animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={loading ? { repeat: Infinity, duration: 1, ease: 'linear' } : { duration: 0.2 }}
              className="p-3.5 rounded-full"
              style={{ backgroundColor: 'var(--accent-10)', color: 'var(--accent)' }}
            >
              {loading ? <RefreshCw size={26} /> : <FileUp size={26} />}
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {loading ? t('ocr.uploading') : file ? file.name : t('ocr.selectFile')}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {t('ocr.hint')}
              </p>
            </div>
          </motion.div>
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
      </div>

      <AnimatePresence>
        {extractedText && (
          <motion.div
            initial={animationsEnabled ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={animationsEnabled ? { opacity: 0 } : undefined}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h3 className="text-h3 flex items-center gap-2">
                <FileText size={16} style={{ color: 'var(--accent)' }} />
                {t('ocr.extracted')}
              </h3>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopy}
                  className="btn btn-secondary flex-1 sm:flex-initial px-3 py-2 text-xs"
                >
                  {copied ? <Check size={14} style={{ color: 'var(--success)' }} /> : <Copy size={14} />}
                  {copied ? t('common.copied') : t('ocr.copyText')}
                </button>
                <button
                  onClick={handleSendToFeedback}
                  className="btn btn-primary flex-1 sm:flex-initial px-4 py-2 text-xs"
                >
                  {t('ocr.scoreAts')}
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={handleClear}
                  className="btn btn-danger p-2"
                  title={t('common.clear')}
                  aria-label={t('common.clear')}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <pre
              className="p-5 rounded-2xl text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-[480px] overflow-y-auto scrollbar-thin"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
            >
              {extractedText}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
