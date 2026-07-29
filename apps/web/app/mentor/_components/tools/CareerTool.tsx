'use client';

import { useState } from 'react';
import { API_BASE } from '@/lib/api';
import { Compass, Loader2, AlertCircle } from 'lucide-react';

interface CareerToolProps {
  onComplete: (text: string) => void;
}

export default function CareerTool({ onComplete }: CareerToolProps) {
  const [skills, setSkills] = useState('');
  const [education, setEducation] = useState('');
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!skills.trim() || !education.trim()) return;
    setLoading(true);
    setError('');
    try {
      const resp = await fetch(`${API_BASE}/career`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          skills,
          interests: goal,
          education,
          education_level: education,
          goal,
          reply_language: 'en',
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || 'Career guidance failed');
      const result = data.career_suggestions || data.response || '';
      const header = '## 💼 Career Guidance Report\n\nBased on your profile, here\'s a personalized career roadmap:\n\n---\n\n';
      onComplete(header + result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-tertiary leading-relaxed">
        Tell me about your background and goals, and I'll create a personalized career roadmap.
      </p>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Your Skills</label>
        <input
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="e.g., Python, JavaScript, Communication, Leadership"
          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-primary rounded-xl p-3 outline-none text-sm transition-all placeholder:text-muted"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Education</label>
        <input
          value={education}
          onChange={(e) => setEducation(e.target.value)}
          placeholder="e.g., B.Tech Computer Science, Class 12 PCM"
          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-primary rounded-xl p-3 outline-none text-sm transition-all placeholder:text-muted"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-semibold text-muted uppercase tracking-wider">Career Goal</label>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g., Want to become a software engineer at Google"
          rows={2}
          className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-primary rounded-xl p-3 outline-none text-sm transition-all resize-none placeholder:text-muted"
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={loading || !skills.trim() || !education.trim()}
        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-primary text-sm font-bold rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> Generating Roadmap...</>
        ) : (
          <><Compass size={16} /> Get Career Guidance</>
        )}
      </button>
    </div>
  );
}
