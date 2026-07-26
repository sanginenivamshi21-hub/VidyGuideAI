'use client';

import { useState } from 'react';
import { API_BASE } from '@/lib/api';
import { Map, ArrowRight, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';

export default function CareerRoadmapPage() {
  const [text, setText] = useState('');
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState(false);

  const handleParse = async () => {
    if (!text.trim()) {
      setError('Please paste career advice or timeline text first.');
      return;
    }

    setError('');
    setLoading(true);
    setParsed(false);
    setMilestones([]);

    try {
      const resp = await fetch(`${API_BASE}/career/roadmap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Failed to parse roadmap');
      }

      setMilestones(data.milestones || []);
      setParsed(true);
      if (data.milestones.length === 0) {
        setError('No timeline milestones detected in the text. Make sure it contains markers like "Month 1:", "Step 2:", or numbered lists.');
      }
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto py-4">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400 text-2xl">
          🗺️
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Career Roadmap</h1>
          <p className="text-slate-400 text-sm">
            Convert any text plan, guidance advice or chronological timeline into a visual roadmap.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Paste Career Plan / Timeline Text
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your career guidance text here. (e.g. Month 1: Learn HTML/CSS. Month 2: Build a portfolio. Month 3: Apply for front-end developer internships.)"
            rows={8}
            className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-purple-500 text-white rounded-lg p-3 outline-none text-sm transition-all resize-none"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg font-medium flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleParse}
          disabled={loading}
          className="flex items-center justify-center gap-2 py-2.5 bg-purple-500 hover:bg-purple-600 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-lg shadow-lg shadow-purple-500/25 transition-all w-fit px-6"
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin" size={16} />
              Generating Timeline Roadmap...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Visualize Roadmap
            </>
          )}
        </button>
      </div>

      {parsed && milestones.length > 0 && (
        <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 flex flex-col gap-6 shadow-inner animate-fadeIn">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🗺️</span>
              <div>
                <h4 className="text-sm font-bold text-white font-sans">Visual Career Roadmap</h4>
                <p className="text-[10px] text-slate-400">Chronological step-by-step career milestone timeline</p>
              </div>
            </div>
            <div className="text-xs font-bold text-purple-400 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
              📍 {milestones.length} Milestones
            </div>
          </div>
          
          <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800 flex gap-4 pr-4">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex items-center shrink-0">
                <div className="w-[200px] bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 relative hover:border-slate-700 transition-all">
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded w-fit"
                    style={{ backgroundColor: `${m.color}15`, color: m.color, border: `1px solid ${m.color}25` }}
                  >
                    {m.label}
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg mt-0.5">{m.icon}</span>
                    <div className="text-xs font-semibold text-slate-200 leading-normal line-clamp-3">
                      {m.title}
                    </div>
                  </div>
                </div>
                {idx < milestones.length - 1 && (
                  <ArrowRight size={18} className="text-slate-700 shrink-0 mx-2" />
                )}
              </div>
            ))}
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-900 pt-4 text-[10px] text-slate-500 font-semibold font-mono">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#5B9BD5]" /> Learn</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#3DDC84]" /> Job</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#F0A500]" /> Build</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#2ECC71]" /> Salary</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#E74C3C]" /> Exam</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#C07FF0]" /> Intern</div>
          </div>
        </div>
      )}
    </div>
  );
}
