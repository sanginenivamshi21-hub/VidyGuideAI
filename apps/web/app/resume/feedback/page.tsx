'use client';

import { useState } from 'react';
import { API_BASE } from '@/lib/api';
import { 
  ShieldAlert, 
  Sparkles, 
  RefreshCw, 
  Upload, 
  FileText, 
  Trash2, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Download, 
  Copy, 
  Check 
} from 'lucide-react';
import MarkdownRenderer from '../../../components/MarkdownRenderer';

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

export default function ResumeFeedbackPage() {
  const [resumeText, setResumeText] = useState('');
  const [language, setLanguage] = useState('English');
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState('');
  const [error, setError] = useState('');
  const [scanMessage, setScanMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setScanMessage('');
    setFeedbackResult('');
    setScanning(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setScanMessage(`Scanning and extracting text from ${selectedFile.name}...`);
      const resp = await fetch(`${API_BASE}/ocr/scan`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'OCR processing failed.');
      }

      setResumeText(data.text);
      setScanMessage(`Successfully scanned! Automatically starting analysis...`);
      
      // Auto trigger analysis immediately after OCR extraction
      await analyzeTextDirectly(data.text, selectedFile);
    } catch (err: any) {
      setError(err.message || 'Failed to scan resume file. Try copy-pasting text manually.');
      setScanMessage('');
    } finally {
      setScanning(false);
    }
  };

  const analyzeTextDirectly = async (text: string, currentFile: File | null) => {
    setError('');
    setLoading(true);

    try {
      const resp = await fetch(`${API_BASE}/resume/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          resume: text,
          reply_language: SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES] || 'en',
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Analysis failed.');
      }

      setFeedbackResult(data.feedback);
      setScanMessage('');

      // Save to user history database
      const user = localStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        if (parsedUser.id !== null) {
          await fetch(`${API_BASE}/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              actionType: 'analysis',
              title: `ATS Feedback - ${currentFile ? currentFile.name.substring(0, 30) : 'Text Input'}`,
              payload: {
                hasFile: !!currentFile,
                filename: currentFile ? currentFile.name : '',
                language,
              },
              result: data.feedback,
            }),
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Connection error during AI analysis.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume text or upload a file first.');
      return;
    }
    await analyzeTextDirectly(resumeText, file);
  };

  const handleClear = () => {
    setResumeText('');
    setFeedbackResult('');
    setFile(null);
    setScanMessage('');
    setError('');
  };

  // Helper parser utilities
  const parseAtsScore = (text: string): number => {
    const match = text.match(/ATS Score:\s*(\d+)\/100/i) || 
                  text.match(/Score:\s*(\d+)\/100/i) || 
                  text.match(/(\d+)\s*\/\s*100/);
    if (match) {
      return Math.min(Math.max(parseInt(match[1], 10), 0), 100);
    }
    return 78; // Default fallback score
  };

  const extractImprovedResume = (text: string): string => {
    const match = text.match(/```resume\s*([\s\S]*?)\s*```/i);
    return match ? match[1].trim() : '';
  };

  const improvedResume = extractImprovedResume(feedbackResult);
  const cleanFeedback = feedbackResult.replace(/```resume\s*[\s\S]*?\s*```/gi, '').trim();
  const atsScore = parseAtsScore(feedbackResult);

  const handleCopyImprovedText = () => {
    if (!improvedResume) return;
    navigator.clipboard.writeText(improvedResume);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!improvedResume) return;
    setError('');
    setDownloadingPdf(true);

    try {
      const lines = improvedResume.split('\n').map(l => l.trim()).filter(Boolean);
      const candidateName = lines[0] || 'Candidate';

      const resp = await fetch(`${API_BASE}/resume/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          resume_text: improvedResume,
          name: candidateName,
        }),
      });

      if (!resp.ok) {
        throw new Error('PDF compilation failed. Check parameters and try again.');
      }

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${candidateName.replace(/\s+/g, '_')}_VidyGuide_Improved.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err: any) {
      setError(err.message || 'Failed to download ReportLab PDF.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto py-4 select-none">
      {/* Header section */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-2xl text-pink-400 text-2xl shadow-inner">
          📄
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            AI Resume Coach <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider">All-in-One Scan</span>
          </h1>
          <p className="text-slate-400 text-xs">
            Upload images or PDFs to perform OCR text extraction, score ATS matching, and download polished PDFs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Upload & Text input column */}
        <div className="md:col-span-2 flex flex-col gap-6 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
          {/* File Upload drag area */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Upload Resume File (PDF, Image, or TXT)
            </label>
            <div className="border-2 border-dashed border-slate-850 hover:border-slate-700 bg-slate-950/50 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 relative transition-all group">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.txt,.webp"
                onChange={handleFileUpload}
                disabled={scanning || loading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:pointer-events-none"
              />
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-full text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all shadow-inner">
                {scanning ? <RefreshCw className="animate-spin" size={24} /> : <Upload size={24} />}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">
                  {file ? file.name : 'Click to select or drag resume file'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto leading-normal">
                  EasyOCR extracts text from scanned documents, immediately launching AI analysis.
                </p>
              </div>
            </div>
            {scanMessage && (
              <p className="text-xs text-emerald-400 font-bold text-center leading-none mt-2 animate-pulse">
                ⏳ {scanMessage}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 my-1">
            <div className="flex-1 h-px bg-slate-850" />
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">or paste plaintext</span>
            <div className="flex-1 h-px bg-slate-850" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Resume Plaintext Content
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste the plain text of your resume here to analyze manually..."
              rows={8}
              className="w-full bg-slate-950/80 border border-slate-855 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-4 outline-none text-xs font-mono leading-relaxed transition-all resize-none"
            />
          </div>
        </div>

        {/* OCR Scan checklist & tips info */}
        <div className="flex flex-col gap-4 col-span-1">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            📑 Coach Checklist
          </h3>
          <div className="p-5 bg-slate-900/60 border border-slate-850 rounded-2xl flex flex-col gap-4">
            <div className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-[10px] text-emerald-400 mt-0.5 shrink-0">✓</div>
              <p className="text-xs text-slate-400 leading-normal">
                Reads PDF structures and OCR scanned image templates natively.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-[10px] text-emerald-400 mt-0.5 shrink-0">✓</div>
              <p className="text-xs text-slate-400 leading-normal">
                Calculates keyword density matches against target Indian MNC filters.
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-[10px] text-emerald-400 mt-0.5 shrink-0">✓</div>
              <p className="text-xs text-slate-400 leading-normal">
                Generates a completely corrected, parsed version available for PDF export.
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center justify-center gap-2 max-w-xl mx-auto w-full">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Action button row */}
      <div className="flex flex-col md:flex-row items-center gap-6 border-t border-slate-850 pt-6">
        <div className="w-full md:w-auto flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">🌐 Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-950 border border-slate-855 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg px-4 py-2 outline-none text-xs transition-all font-semibold cursor-pointer"
          >
            {Object.keys(SUPPORTED_LANGUAGES).map((langName) => (
              <option key={langName} value={langName}>
                {langName}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleManualAnalyze}
          disabled={loading || scanning || !resumeText.trim()}
          className="flex-1 w-full md:w-auto flex items-center justify-center gap-2 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin" size={16} />
              Evaluating ATS metrics...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Analyze Resume & Score ATS
            </>
          )}
        </button>
      </div>

      {/* ATS score and recommendation feedback output */}
      {feedbackResult && (
        <div className="flex flex-col gap-8 mt-6 border-t border-slate-850 pt-10 animate-fadeIn">
          {/* Top Score Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Circle ATS Score */}
            <div className="bg-slate-900/40 border border-slate-855 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">ATS Match Score</span>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    className="stroke-slate-850 fill-transparent"
                    strokeWidth="10"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    className="stroke-emerald-500 fill-transparent"
                    strokeWidth="10"
                    strokeDasharray={351.8}
                    strokeDashoffset={351.8 - (351.8 * atsScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-white">{atsScore}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">out of 100</span>
                </div>
              </div>
            </div>

            {/* Recruiter metrics & Action banner */}
            <div className="bg-slate-900/40 border border-slate-855 rounded-3xl p-6 col-span-2 flex flex-col justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-855 pb-2 block">Quick Coach Review</span>
                <p className="text-sm text-slate-200 mt-3 font-semibold leading-relaxed">
                  {cleanFeedback.split('\n').find(l => l.includes('Review'))?.replace(/^[#*-]*\s*Recruiter Review\s*[:\-]*/i, '').trim() || 
                   'Your resume exhibits solid fundamentals but needs targeted keyword injections to clear automated filters.'}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Analysis target language: {language}</span>
                <button
                  onClick={handleClear}
                  className="px-4 py-2 bg-slate-950 border border-slate-855 hover:border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold transition-all"
                >
                  Reset Coach
                </button>
              </div>
            </div>
          </div>

          {/* Feedback details breakdown */}
          <div className="flex flex-col gap-6">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              Detailed Critique Report
            </h3>

            <div className="p-8 bg-slate-900/60 border border-slate-855 rounded-3xl text-slate-200 text-sm leading-relaxed font-sans">
              <MarkdownRenderer content={cleanFeedback} />
            </div>
          </div>

          {/* Improved Resume Copy & Export panel */}
          {improvedResume && (
            <div className="flex flex-col gap-4 mt-4 border-t border-slate-850 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-md font-bold text-white flex items-center gap-2">
                    <Sparkles size={16} className="text-emerald-400 animate-pulse" />
                    ATS-Optimized Improved Version
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Copy or compile this layout immediately into an exportable PDF.</p>
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={handleCopyImprovedText}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-950 border border-slate-855 hover:border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="text-emerald-400" />
                        <span>Copied text</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copy layout</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    {downloadingPdf ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} />
                        <span>Compiling...</span>
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Improved Resume clean block code display */}
              <div className="p-6 bg-slate-950 border border-slate-855 rounded-2xl text-slate-300 font-mono text-xs leading-relaxed whitespace-pre select-text overflow-x-auto shadow-inner">
                {improvedResume}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
