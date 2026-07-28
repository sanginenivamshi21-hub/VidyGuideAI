'use client';

import { ResumeTemplate } from './types';

interface Props {
  value: ResumeTemplate;
  onChange: (t: ResumeTemplate) => void;
}

const TEMPLATES: { id: ResumeTemplate; label: string; desc: string }[] = [
  { id: 'professional', label: 'Professional', desc: 'Clean, traditional layout suitable for most industries' },
  { id: 'modern', label: 'Modern', desc: 'Contemporary design with a sidebar for skills and contact' },
  { id: 'minimal', label: 'Minimal', desc: 'Simple, ATS-optimized plain text format' },
];

export default function TemplateSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-md font-bold text-white">Resume Template</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`p-4 rounded-xl border text-left transition-all ${
              value === t.id
                ? 'border-emerald-500 bg-emerald-500/10'
                : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
            }`}
          >
            <div className={`text-sm font-bold mb-1 ${value === t.id ? 'text-emerald-400' : 'text-white'}`}>
              {t.label}
            </div>
            <p className="text-xs text-slate-400">{t.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
