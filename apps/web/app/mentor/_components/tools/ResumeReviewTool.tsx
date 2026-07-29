'use client';

import { useState } from 'react';
import { API_BASE } from '@/lib/api';
import { Upload, FileText, Check, AlertCircle, Loader2 } from 'lucide-react';

interface ResumeReviewToolProps {
  onComplete: (text: string) => void;
}

export default function ResumeReviewTool({ onComplete }: ResumeReviewToolProps) {
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!resumeText.trim()) return;
    setLoading(true);
    setError('');
    try {
      const resp = await fetch(`${API_BASE}/resume/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ resume: resumeText, reply_language: 'en' }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || 'Review failed');
      const feedback = data.feedback || data.response || '';
      const header = '## 📄 Resume Review Results\n\nI analyzed your resume. Here\'s the detailed feedback:\n\n---\n\n';
      onComplete(header + feedback);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-tertiary leading-relaxed">
        Paste your resume text below and I'll analyze it for ATS compatibility, keyword density, grammar, and provide an enhanced version.
      </p>
      <textarea
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        placeholder="Paste your resume text here..."
        rows={8}
        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 text-primary rounded-xl p-3 outline-none text-sm transition-all resize-none placeholder:text-muted"
      />
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={loading || !resumeText.trim()}
        className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-primary text-sm font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
        ) : (
          <><FileText size={16} /> Get Resume Feedback</>
        )}
      </button>
    </div>
  );
}
