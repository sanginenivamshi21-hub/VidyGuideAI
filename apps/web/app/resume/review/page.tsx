'use client';

import { useState } from 'react';
import { API_BASE } from '@/lib/api';
import {
  Sparkles, RefreshCw, Upload, AlertCircle, CheckCircle2,
  XCircle, TrendingUp, FileText, Lightbulb, Sword,
  Languages, Copy, Check, Download, Target, Percent,
  Shield, MessageSquare, DownloadCloud
} from 'lucide-react';
import MarkdownRenderer from '../../../components/MarkdownRenderer';

interface ResumeAnalysis {
  atsScore: number;
  summary: string;
  keywords: { present: string[]; missing: string[]; density: string };
  formattingIssues: string[];
  grammarSuggestions: string[];
  missingSkills: string[];
  strengths: string[];
  improvements: string[];
  enhancedResume: string;
  feedbackContent?: string;
}

const SUPPORTED_LANGUAGES: Record<string, string> = {
  English: 'en', Telugu: 'te', Hindi: 'hi', Tamil: 'ta',
  Kannada: 'kn', Malayalam: 'ml', Marathi: 'mr', Bengali: 'bn', Gujarati: 'gu',
};

export default function ResumeReviewPage() {
  const [resumeText, setResumeText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [error, setError] = useState('');
  const [scanMessage, setScanMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'analyze' | 'enhanced' | 'feedback'>('analyze');
  const [language, setLanguage] = useState('English');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setError('');
    setScanMessage('');
    setAnalysis(null);
    setScanning(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setScanMessage(`Extracting text from ${selectedFile.name}...`);
      const resp = await fetch(`${API_BASE}/ocr/scan`, {
        method: 'POST', credentials: 'include', body: formData,
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || 'OCR processing failed.');
      setResumeText(data.text);
      setScanMessage('Text extracted. Analyzing...');
      await runFullReview(data.text);
    } catch (err: any) {
      setError(err.message || 'Failed to scan resume file.');
      setScanMessage('');
    } finally { setScanning(false); }
  };

  const runFullReview = async (text: string) => {
    setError('');
    setLoading(true);
    setActiveTab('analyze');

    try {
      const [analyzeResp, feedbackResp] = await Promise.all([
        fetch(`${API_BASE}/resume/analyze`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ resume: text }),
        }),
        fetch(`${API_BASE}/resume/feedback`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ resume: text, reply_language: SUPPORTED_LANGUAGES[language] || 'en' }),
        }),
      ]);

      const analyzeData = await analyzeResp.json();
      const feedbackData = await feedbackResp.json();

      if (!analyzeResp.ok) throw new Error(analyzeData.message || 'Analysis failed.');
      if (!feedbackResp.ok) throw new Error(feedbackData.message || 'Feedback failed.');

      const merged: ResumeAnalysis = {
        ...analyzeData,
        feedbackContent: feedbackData.feedback,
      };

      setAnalysis(merged as any);
      setScanMessage('');

      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const parsedUser = JSON.parse(userStr);
          if (parsedUser.id !== null) {
            await fetch(`${API_BASE}/history`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
              body: JSON.stringify({
                actionType: 'analysis',
                title: `Resume Review - ${file ? file.name.substring(0, 30) : 'Text Input'}`,
                payload: { hasFile: !!file, filename: file ? file.name : '', language },
                result: JSON.stringify(merged),
              }),
            });
          }
        } catch {}
      }
    } catch (err: any) {
      setError(err.message || 'Connection error during review.');
    } finally { setLoading(false); }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) { setError('Please paste your resume text or upload a file.'); return; }
    await runFullReview(resumeText);
  };

  const handleClear = () => {
    setResumeText(''); setAnalysis(null); setFile(null);
    setScanMessage(''); setError('');
  };

  const handleCopyEnhanced = () => {
    if (!analysis?.enhancedResume) return;
    navigator.clipboard.writeText(analysis.enhancedResume);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!analysis?.enhancedResume) return;
    setDownloadingPdf(true);
    try {
      const lines = analysis.enhancedResume.split('\n').map(l => l.trim()).filter(Boolean);
      const candidateName = lines[0] || 'Candidate';
      const resp = await fetch(`${API_BASE}/resume/pdf`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ resume_text: analysis.enhancedResume, name: candidateName }),
      });
      if (!resp.ok) throw new Error('PDF compilation failed.');
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${candidateName.replace(/\s+/g, '_')}_VidyGuide_Enhanced.pdf`;
      document.body.appendChild(a); a.click(); a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) { setError(err.message || 'Failed to download PDF.'); }
    finally { setDownloadingPdf(false); }
  };

  const gaugeColor = (score: number) => {
    if (score >= 80) return 'stroke-emerald-500';
    if (score >= 60) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };
  const gaugeTextColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const parseAtsScore = (text: string): number => {
    const match = text.match(/ATS Score:\s*(\d+)\/100/i) || text.match(/Score:\s*(\d+)\/100/i) || text.match(/(\d+)\s*\/\s*100/);
    return match ? Math.min(Math.max(parseInt(match[1], 10), 0), 100) : 78;
  };

  const feedbackAtsScore = analysis ? parseAtsScore(analysis.feedbackContent || '') : 0;

  const feedbackContent = analysis?.feedbackContent || '';

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto py-4 select-none">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
          <Target size={28} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Resume Review{' '}
            <span className="text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider">All-in-One</span>
          </h1>
          <p className="text-slate-400 text-xs">
            ATS scoring, keyword analysis, grammar check, formatting review, AI feedback, role matching, and enhanced resume.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 flex flex-col gap-6 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Upload Resume</label>
            <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 relative transition-all group">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.txt,.webp"
                onChange={handleFileUpload} disabled={scanning || loading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:pointer-events-none" />
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-full text-slate-400 group-hover:text-indigo-400 group-hover:border-indigo-500/30 transition-all">
                {scanning ? <RefreshCw className="animate-spin" size={24} /> : <Upload size={24} />}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">{file ? file.name : 'Click to select or drag resume file'}</p>
                <p className="text-[11px] text-slate-500 mt-1">OCR extracts text, then AI returns structured ATS analysis + detailed feedback.</p>
              </div>
            </div>
            {scanMessage && <p className="text-xs text-indigo-400 font-bold text-center animate-pulse">{scanMessage}</p>}
          </div>

          <div className="flex items-center gap-4 my-1">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">or paste plaintext</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resume Text</label>
            <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste the plain text of your resume here..." rows={8}
              className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 text-white rounded-xl p-4 outline-none text-xs font-mono leading-relaxed transition-all resize-none" />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Shield size={14} className="text-indigo-400" /> Review Includes
          </h3>
          <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col gap-4">
            {[
              'ATS Score (0-100) with color gauge',
              'Matched & missing keywords',
              'Formatting & grammar issues',
              'Missing skills for Indian market',
              'Resume strengths identified',
              'Actionable improvement tips',
              'AI coach feedback in any language',
              'Enhanced ATS-optimized resume',
              'PDF export with one click',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-[10px] text-indigo-400 mt-0.5 shrink-0">✓</div>
                <p className="text-xs text-slate-400 leading-normal">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center justify-center gap-2 max-w-xl mx-auto w-full">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center gap-6 border-t border-slate-800 pt-6">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">🌐 Language:</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 text-white rounded-lg px-4 py-2 outline-none text-xs transition-all font-semibold cursor-pointer">
            {Object.keys(SUPPORTED_LANGUAGES).map((langName) => (
              <option key={langName} value={langName}>{langName}</option>
            ))}
          </select>
        </div>
        <button onClick={handleAnalyze} disabled={loading || scanning || !resumeText.trim()}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-indigo-500 hover:bg-indigo-600 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition-all">
          {loading ? <><RefreshCw className="animate-spin" size={16} /> Running full review...</>
            : <><Sparkles size={16} /> Analyze & Review</>}
        </button>
        {analysis && (
          <button onClick={handleClear} className="px-4 py-3.5 bg-slate-950 border border-slate-800 hover:border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all">Clear</button>
        )}
      </div>

      {analysis && (
        <div className="flex flex-col gap-8 mt-2 border-t border-slate-800 pt-10 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ATS Score</span>
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="56" cy="56" r="48" className="stroke-slate-800 fill-transparent" strokeWidth="8" />
                  <circle cx="56" cy="56" r="48" className={`${gaugeColor(analysis.atsScore)} fill-transparent`} strokeWidth="8"
                    strokeDasharray={301.6} strokeDashoffset={301.6 - (301.6 * analysis.atsScore) / 100} strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className={`text-2xl font-extrabold ${gaugeTextColor(analysis.atsScore)}`}>{analysis.atsScore}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">/ 100</span>
                </div>
              </div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3 md:col-span-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Summary</span>
              <p className="text-sm text-slate-200 font-medium leading-relaxed">{analysis.summary}</p>
              <div className="flex items-center gap-4 mt-auto pt-2 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                <span>Keywords: {analysis.keywords.present.length} matched / {analysis.keywords.missing.length} missing</span>
                <span>Issues: {analysis.formattingIssues.length + analysis.grammarSuggestions.length} found</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 border-b border-slate-800 pb-2">
            {(['analyze', 'enhanced', 'feedback'] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === tab
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-500 hover:text-slate-300 border border-transparent'
                }`}>
                {tab === 'analyze' ? 'Analysis Report' : tab === 'enhanced' ? 'Enhanced Resume' : 'AI Coach Feedback'}
              </button>
            ))}
          </div>

          {activeTab === 'analyze' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2"><CheckCircle2 size={14} /> Keywords Present</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.present.length > 0 ? analysis.keywords.present.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[11px] font-mono rounded-lg">{kw}</span>
                  )) : <p className="text-xs text-slate-500 italic">No keywords detected</p>}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">Density: {analysis.keywords.density}</p>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-2"><XCircle size={14} /> Missing Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.missing.length > 0 ? analysis.keywords.missing.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/25 text-red-300 text-[11px] font-mono rounded-lg">{kw}</span>
                  )) : <p className="text-xs text-slate-500 italic">No missing keywords</p>}
                </div>
              </div>
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2"><FileText size={14} /> Formatting Issues</h3>
                {analysis.formattingIssues.length > 0 ? (
                  <ul className="list-disc list-inside text-xs text-slate-300 flex flex-col gap-1.5">
                    {analysis.formattingIssues.map((issue, i) => <li key={i} className="leading-relaxed">{issue}</li>)}
                  </ul>
                ) : <p className="text-xs text-slate-500 italic">No formatting issues</p>}
              </div>
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2"><Languages size={14} /> Grammar Suggestions</h3>
                {analysis.grammarSuggestions.length > 0 ? (
                  <ul className="list-disc list-inside text-xs text-slate-300 flex flex-col gap-1.5">
                    {analysis.grammarSuggestions.map((s, i) => <li key={i} className="leading-relaxed">{s}</li>)}
                  </ul>
                ) : <p className="text-xs text-slate-500 italic">No grammar issues</p>}
              </div>
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-2"><Sword size={14} /> Missing Skills</h3>
                {analysis.missingSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {analysis.missingSkills.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-violet-500/10 border border-violet-500/25 text-violet-300 text-[11px] font-mono rounded-lg">{s}</span>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-500 italic">None identified</p>}
              </div>
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2"><TrendingUp size={14} /> Strengths</h3>
                {analysis.strengths.length > 0 ? (
                  <ul className="list-disc list-inside text-xs text-slate-300 flex flex-col gap-1.5">
                    {analysis.strengths.map((s, i) => <li key={i} className="leading-relaxed">{s}</li>)}
                  </ul>
                ) : <p className="text-xs text-slate-500 italic">None identified</p>}
              </div>
              <div className="md:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex flex-col gap-3">
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2"><Lightbulb size={14} /> Improvements</h3>
                {analysis.improvements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {analysis.improvements.map((imp, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                        <span className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-[10px] text-blue-400 mt-0.5 shrink-0">{i + 1}</span>
                        <p className="text-xs text-slate-300 leading-relaxed">{imp}</p>
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-slate-500 italic">No improvement suggestions</p>}
              </div>
            </div>
          )}

          {activeTab === 'enhanced' && analysis.enhancedResume && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-md font-bold text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-indigo-400 animate-pulse" /> ATS-Optimized Resume
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Copy or export as PDF.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleCopyEnhanced} className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all">
                    {copied ? <><Check size={14} className="text-emerald-400" /> Copied</> : <><Copy size={14} /> Copy</>}
                  </button>
                  <button onClick={handleDownloadPdf} disabled={downloadingPdf}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all">
                    {downloadingPdf ? <><RefreshCw className="animate-spin" size={14} /> Compiling...</>
                      : <><DownloadCloud size={14} /> PDF</>}
                  </button>
                </div>
              </div>
              <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl text-slate-300 font-mono text-xs leading-relaxed whitespace-pre select-text overflow-x-auto shadow-inner max-h-[600px] overflow-y-auto">
                {analysis.enhancedResume}
              </div>
            </div>
          )}

          {activeTab === 'feedback' && (
            <div className="flex flex-col gap-6">
              <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <MessageSquare size={16} className="text-pink-400" /> AI Coach Detailed Feedback
                </h3>
                <p className="text-xs text-slate-500">Language: {language}</p>
                <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-200 text-sm leading-relaxed">
                  {feedbackContent ? <MarkdownRenderer content={feedbackContent} /> : (
                    <p className="text-slate-500 italic">No feedback content available.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
