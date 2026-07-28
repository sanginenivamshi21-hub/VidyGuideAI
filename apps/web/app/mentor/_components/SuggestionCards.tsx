import { FileText, ScanSearch, Compass, Briefcase, Code } from 'lucide-react';

const SUGGESTIONS = [
  { icon: FileText, label: 'Resume Review', query: 'Can you review my resume and give feedback on how to improve it for ATS systems?', color: 'text-indigo-400', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' },
  { icon: ScanSearch, label: 'ATS Analysis', query: 'What makes a resume ATS-friendly? How can I optimize my resume for applicant tracking systems?', color: 'text-pink-400', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.2)' },
  { icon: Compass, label: 'Career Guidance', query: 'What career path would be best for someone with my skills and background?', color: 'text-emerald-400', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
  { icon: Briefcase, label: 'Interview Practice', query: 'Can you give me some common interview questions and tips for a software engineering role?', color: 'text-violet-400', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' },
  { icon: Code, label: 'Coding Help', query: 'Can you help me understand data structures and algorithms for coding interviews?', color: 'text-cyan-400', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.2)' },
];

interface SuggestionCardsProps {
  onSelect: (query: string) => void;
}

export default function SuggestionCards({ onSelect }: SuggestionCardsProps) {
  return (
    <div className="flex items-center justify-center h-full px-4">
      <div className="text-center max-w-xl mx-auto w-full">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--accent-10)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--accent)' }}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white mb-1">AI Mentor</h2>
        <p className="text-sm text-slate-400 mb-6">Ask anything about careers, resumes, interviews, or coding</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {SUGGESTIONS.map((s, i) => {
            const Icon = s.icon;
            return (
              <button
                key={i}
                onClick={() => onSelect(s.query)}
                className="flex flex-col items-center gap-2 p-3.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: s.bg, borderColor: s.border }}
              >
                <Icon size={22} className={s.color} />
                <span className="text-xs font-medium text-slate-300">{s.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-600 mt-6">
          Drop files or paste images to attach. Press Enter to send.
        </p>
      </div>
    </div>
  );
}
