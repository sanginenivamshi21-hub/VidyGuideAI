'use client';

import { useState } from 'react';
import { Briefcase, Sparkles, RefreshCw, Send, CheckCircle2, ChevronRight } from 'lucide-react';

export default function InterviewPrepPage() {
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!role.trim()) {
      setError('Please enter a target job role.');
      return;
    }

    setError('');
    setLoading(true);
    setQuestions([]);
    setFeedback('');
    setAnswers(['', '', '', '', '']);

    try {
      const resp = await fetch('http://localhost:8000/mentor/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role, company }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Failed to fetch interview questions.');
      }

      setQuestions(data.questions || []);
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (index: number, val: string) => {
    const updated = [...answers];
    updated[index] = val;
    setAnswers(updated);
  };

  const handleSubmitAnswers = async () => {
    setError('');
    setSubmitting(true);
    setFeedback('');

    const items = questions.map((q, idx) => ({
      question: q,
      answer: answers[idx] || 'Candidate skipped answering.',
    }));

    try {
      const resp = await fetch('http://localhost:8000/mentor/interview/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ items }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Failed to analyze answers.');
      }

      setFeedback(data.feedback);

      // Save to user history database
      const user = localStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        if (parsedUser.id !== null) {
          await fetch('http://localhost:8000/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              actionType: 'interview',
              title: `Interview Prep - ${role} at ${company || 'General'}`,
              payload: { role, company },
              result: data.feedback,
            }),
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-violet-400 text-2xl">
          💼
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Interview Preparation</h1>
          <p className="text-slate-400 text-sm">
            Simulate realistic mock interviews for Indian companies and get custom grading score reviews.
          </p>
        </div>
      </div>

      {/* Role & Company form inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md items-end">
        <div className="flex flex-col gap-1.5 col-span-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Job Role</label>
          <input
            type="text"
            required
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g. Software Engineer, Bank PO"
            className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5 col-span-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Company (optional)</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. TCS, Infosys, SBI"
            className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-lg shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 h-[42px]"
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin" size={14} />
              Generating questions...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Start Mock Interview
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg font-medium text-center max-w-xl mx-auto w-full">
          {error}
        </div>
      )}

      {/* Questions list form */}
      {questions.length > 0 && !feedback && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <h3 className="text-lg font-bold text-white border-b border-slate-850 pb-3 flex items-center gap-2">
            <span>📝</span> Answer Mock Questions
          </h3>

          <div className="flex flex-col gap-5">
            {questions.map((q, idx) => (
              <div key={idx} className="p-5 bg-slate-900/60 border border-slate-850 rounded-xl flex flex-col gap-3">
                <div className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-extrabold text-sm shrink-0">Q{idx + 1}.</span>
                  <h4 className="text-sm font-semibold text-slate-200 leading-normal">{q}</h4>
                </div>
                <textarea
                  value={answers[idx]}
                  onChange={(e) => handleAnswerChange(idx, e.target.value)}
                  placeholder="Type your detailed interview answer response here..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-750 focus:border-emerald-500 text-white text-xs rounded-lg p-3 outline-none resize-none transition-all"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmitAnswers}
            disabled={submitting}
            className="w-full md:w-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-lg shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 w-fit mx-auto"
          >
            {submitting ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                Analyzing responses...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Submit Responses for Evaluation
              </>
            )}
          </button>
        </div>
      )}

      {/* Evaluation review report */}
      {feedback && (
        <div className="flex flex-col gap-6 animate-fadeIn mt-4 border-t border-slate-850 pt-8">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📊</span> Evaluation Feedback Report
          </h3>
          <div className="p-8 bg-slate-900/60 border border-slate-850 rounded-2xl text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {feedback}
          </div>

          <button
            onClick={handleGenerate}
            className="w-full md:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-white font-bold text-xs rounded-lg transition-all w-fit mx-auto"
          >
            Restart Mock Interview
          </button>
        </div>
      )}
    </div>
  );
}
