'use client';

import { useState, useRef } from 'react';
import { API_BASE } from '@/lib/api';
import { ScanLine, Upload, Loader2, AlertCircle, Trash2 } from 'lucide-react';

interface OcrToolProps {
  onComplete: (text: string) => void;
}

export default function OcrTool({ onComplete }: OcrToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const resp = await fetch(`${API_BASE}/ocr/scan`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || 'OCR failed');
      const text = data.text || '(No text extracted)';
      const header = `## 🔍 OCR Results: ${file.name}\n\nI scanned your document. Here's the extracted text:\n\n---\n\n\`\`\`\n${text}\n\`\`\`\n\n---\n\nWant me to analyze this text or help you format it into a resume?`;
      onComplete(header);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-tertiary leading-relaxed">
        Upload a scanned resume, document, or image. I'll extract the text using OCR.
      </p>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-slate-700 hover:border-amber-500/40 bg-slate-950/50 rounded-xl p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer active:scale-[0.99]"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-full text-tertiary">
          {loading ? <Loader2 className="animate-spin" size={24} /> : <ScanLine size={24} />}
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-primary">{file ? file.name : 'Tap to select file'}</p>
          <p className="text-xs text-muted mt-0.5">PDF, JPG, PNG, WebP</p>
        </div>
      </div>
      {file && !loading && (
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl">
          <span className="flex-1 text-xs text-tertiary truncate">{file.name}</span>
          <button onClick={() => setFile(null)} className="p-1 rounded hover:bg-slate-800 text-muted hover:text-red-400">
            <Trash2 size={14} />
          </button>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={loading || !file}
        className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-primary text-sm font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> Scanning...</>
        ) : (
          <><Upload size={16} /> Extract Text</>
        )}
      </button>
    </div>
  );
}
