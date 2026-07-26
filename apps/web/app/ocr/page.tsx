'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScanLine, RefreshCw, Upload, Copy, Check, ArrowRight, Trash2 } from 'lucide-react';

export default function OcrScannerPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setExtractedText('');
    setLoading(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const resp = await fetch('http://localhost:8000/ocr/scan', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'OCR processing failed.');
      }

      setExtractedText(data.text);
    } catch (err: any) {
      setError(err.message || 'Failed to scan file. Ensure tesseract-ocr system package is installed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToFeedback = () => {
    // Save to session or local storage temporarily and redirect
    localStorage.setItem('temp_ocr_text', extractedText);
    router.push('/resume/feedback');
  };

  const handleClear = () => {
    setFile(null);
    setExtractedText('');
    setError('');
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto py-4">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 text-2xl">
          🔍
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Resume Scanner (OCR)</h1>
          <p className="text-slate-400 text-sm">
            Extract raw plain-text from scanned image or PDF resumes using advanced OCR algorithms.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Upload Scanned PDF or JPG/PNG image
          </label>
          <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/50 rounded-xl p-8 flex flex-col items-center justify-center gap-3 relative transition-all group">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.txt,.webp"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-full text-slate-400 group-hover:text-amber-400 group-hover:border-amber-500/30 transition-all">
              {loading ? <RefreshCw className="animate-spin" size={24} /> : <ScanLine size={24} />}
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-white">
                {file ? file.name : 'Click to select or drag resume file'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Reads native texts & processes scanned image documents recursively
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg font-medium text-center max-w-xl mx-auto w-full">
            {error}
          </div>
        )}
      </div>

      {extractedText && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📄</span> Extracted Plaintext Resume
            </h3>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleCopy}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-slate-350 hover:text-white text-xs font-bold rounded-lg transition-all"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy text'}
              </button>
              <button
                onClick={handleSendToFeedback}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.97] text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-500/25 transition-all"
              >
                Score ATS Match
                <ArrowRight size={14} />
              </button>
              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-850 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-all duration-200"
                title="Clear scanned text"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <pre className="p-6 bg-slate-950 border border-slate-850 rounded-2xl text-slate-350 text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-[500px]">
            {extractedText}
          </pre>
        </div>
      )}
    </div>
  );
}
