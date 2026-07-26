'use client';

import { useState } from 'react';
import { ShieldAlert, Sparkles, RefreshCw, Upload, FileText, Trash2, AlertCircle } from 'lucide-react';

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
  const [feedbackResult, setFeedbackResult] = useState('');
  const [error, setError] = useState('');
  const [scanMessage, setScanMessage] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError('');
    setScanMessage('');
    setScanning(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const resp = await fetch('http://localhost:8000/ocr/scan', {
        method: 'POST',
        body: formData,
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'OCR processing failed.');
      }

      setResumeText(data.text);
      setScanMessage(`Successfully extracted text from ${selectedFile.name}!`);
    } catch (err: any) {
      setError(err.message || 'Failed to scan resume file. Try copy-pasting text manually.');
    } finally {
      setScanning(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      setError('Please paste your resume text or upload a file first.');
      return;
    }

    setError('');
    setLoading(true);
    setFeedbackResult('');

    try {
      const resp = await fetch('http://localhost:8000/resume/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume: resumeText,
          reply_language: SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES] || 'en',
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Analysis failed.');
      }

      setFeedbackResult(data.feedback);

      // Save to user history database
      const user = localStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        if (parsedUser.id !== null) {
          await fetch('http://localhost:8000/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              actionType: 'analysis',
              title: `ATS Feedback - ${file ? file.name.substring(0, 30) : 'Text Input'}`,
              payload: {
                hasFile: !!file,
                filename: file ? file.name : '',
                language,
              },
              result: data.feedback,
            }),
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResumeText('');
    setFeedbackResult('');
    setFile(null);
    setScanMessage('');
    setError('');
  };

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto py-4">
      {/* Header section */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-2xl text-pink-400 text-2xl">
          📄
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Resume Feedback</h1>
          <p className="text-slate-400 text-sm">
            Scan your resume to calculate ATS keyword matching scores and improvements.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Upload & Text input column */}
        <div className="md:col-span-2 flex flex-col gap-6 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          {/* File Upload drag area */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Upload Resume File (PDF, Image, or TXT)
            </label>
            <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/50 rounded-xl p-6 flex flex-col items-center justify-center gap-3 relative transition-all group">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.txt,.webp"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-full text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all">
                {scanning ? <RefreshCw className="animate-spin" size={20} /> : <Upload size={20} />}
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white">
                  {file ? file.name : 'Click to select or drag resume file'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports native PDF text and scanned image OCR (JPEG, PNG)
                </p>
              </div>
            </div>
            {scanMessage && (
              <p className="text-xs text-emerald-400 font-semibold text-center leading-none mt-1 animate-fadeIn">
                {scanMessage}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 my-1">
            <div className="flex-1 h-px bg-slate-850" />
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider font-mono">or paste plaintext</span>
            <div className="flex-1 h-px bg-slate-850" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Resume plain text content
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste the plain text of your resume here..."
              rows={10}
              className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-3 outline-none text-xs font-mono leading-relaxed transition-all resize-none"
            />
          </div>
        </div>

        {/* OCR Scan checklist & tips info */}
        <div className="flex flex-col gap-4">
          <h3 className="text-md font-bold text-white flex items-center gap-1.5">
            📑 Analyzer Checklist
          </h3>
          <div className="p-5 bg-slate-900/60 border border-slate-850 rounded-xl flex flex-col gap-4">
            <div className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-[10px] text-emerald-400 mt-0.5">✓</div>
              <p className="text-xs text-slate-450 leading-relaxed">
                Extracts contact parameters (name, email)
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-[10px] text-emerald-400 mt-0.5">✓</div>
              <p className="text-xs text-slate-450 leading-relaxed">
                Validates sections: Objective, Skills, Projects, Experience
              </p>
            </div>
            <div className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-[10px] text-emerald-400 mt-0.5">✓</div>
              <p className="text-xs text-slate-450 leading-relaxed">
                Scores keyword densities and calculates matching ATS ratios
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg font-medium text-center max-w-2xl mx-auto w-full flex items-center justify-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Action button row */}
      <div className="flex flex-col md:flex-row items-center gap-6 border-t border-slate-850 pt-6">
        <div className="w-full md:w-auto flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">🌐 Response Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg px-4 py-2 outline-none text-xs transition-all font-semibold cursor-pointer"
          >
            {Object.keys(SUPPORTED_LANGUAGES).map((langName) => (
              <option key={langName} value={langName}>
                {langName}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || scanning}
          className="flex-1 w-full md:w-auto flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-lg shadow-lg shadow-emerald-500/25 transition-all"
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
        <div className="flex flex-col gap-6 mt-6 border-t border-slate-850 pt-10 animate-fadeIn">
          <div className="flex justify-between items-center gap-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📊</span> ATS Evaluation Report
            </h3>
            <button
              onClick={handleClear}
              className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-all duration-200"
              title="Clear report"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="p-8 bg-slate-900/60 border border-slate-850 rounded-2xl text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {feedbackResult}
          </div>
        </div>
      )}
    </div>
  );
}
