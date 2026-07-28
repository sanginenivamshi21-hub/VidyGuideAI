'use client';

import { FileText, ScanSearch, Compass, Briefcase, Code } from 'lucide-react';
import Logo from '@/components/Logo';

const SUGGESTIONS = [
  { icon: FileText, label: 'Resume Review', query: 'Can you review my resume and give feedback on how to improve it for ATS systems?', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' },
  { icon: ScanSearch, label: 'ATS Analysis', query: 'What makes a resume ATS-friendly? How can I optimize my resume for applicant tracking systems?', color: '#ec4899', bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.2)' },
  { icon: Compass, label: 'Career Guidance', query: 'What career path would be best for someone with my skills and background?', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
  { icon: Briefcase, label: 'Interview Practice', query: 'Can you give me some common interview questions and tips for a software engineering role?', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' },
  { icon: Code, label: 'Coding Help', query: 'Can you help me understand data structures and algorithms for coding interviews?', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.2)' },
];

interface SuggestionCardsProps {
  onSelect: (query: string) => void;
}

export default function SuggestionCards({ onSelect }: SuggestionCardsProps) {
  return (
    <div className="flex items-center justify-center min-h-full px-4 py-8">
      <div className="text-center max-w-xl mx-auto w-full">
        <div className="mx-auto mb-4">
          <Logo size={48} />
        </div>
        <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>AI Mentor</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Ask anything about careers, resumes, interviews, or coding</p>
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
                <Icon size={22} style={{ color: s.color }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] mt-6" style={{ color: 'var(--text-muted)' }}>
          Drop files or paste images to attach. Press Enter to send.
        </p>
      </div>
    </div>
  );
}
