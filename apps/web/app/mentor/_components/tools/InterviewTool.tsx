'use client';

import { useState } from 'react';
import { API_BASE } from '@/lib/api';
import { Briefcase, Loader2, AlertCircle } from 'lucide-react';

interface InterviewToolProps {
  onComplete: (text: string) => void;
}

export default function InterviewTool({ onComplete }: InterviewToolProps) {
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [skills, setSkills] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!role.trim() || !skills.trim()) return;
    setLoading(true);
    setError('');
    try {
      const resp = await fetch(`${API_BASE}/mentor/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          role,
          company: company || 'General',
          experience_level: 'Entry Level',
          skills,
          difficulty,
          temperature: 0.8,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || 'Interview prep failed');
      const questions = data.questions || [];
      const formatted = questions.map((q: string, i: number) => `**Q${i + 1}.** ${q}`).join('\n\n');
      const header = `## 🎤 Interview Practice: ${role}\n\nHere are ${difficulty} difficulty questions${company ? ` for ${company}` : ''}:\n\n---\n\n`;
      onComplete(header + formatted + '\n\n---\n\nWant to answer these? Reply with your answers and I\'ll provide feedback!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-tertiary leading-relaxed">
        Configure your interview practice session. I'll generate realistic questions based on your target role.
      </p>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Target Role</label>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g., Software Engineer, Data Analyst"
          className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 text-primary rounded-xl p-3 outline-none text-sm transition-all placeholder:text-muted"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Target Company (optional)</label>
        <input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g., Google, TCS, Microsoft"
          className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 text-primary rounded-xl p-3 outline-none text-sm transition-all placeholder:text-muted"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Key Skills</label>
        <input
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="e.g., React, Python, SQL, System Design"
          className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 text-primary rounded-xl p-3 outline-none text-sm transition-all placeholder:text-muted"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Difficulty</label>
        <div className="flex gap-2">
          {['Easy', 'Medium', 'Hard'].map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border ${
                difficulty === d
                  ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                  : 'bg-slate-950 border-slate-800 text-muted hover:text-secondary'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={loading || !role.trim() || !skills.trim()}
        className="w-full py-3 bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed text-primary text-sm font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> Generating Questions...</>
        ) : (
          <><Briefcase size={16} /> Generate Questions</>
        )}
      </button>
    </div>
  );
}
