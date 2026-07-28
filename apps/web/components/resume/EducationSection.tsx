'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Education } from './types';

interface Props {
  data: Education[];
  onChange: (data: Education[]) => void;
}

export default function EducationSection({ data, onChange }: Props) {
  const add = () => {
    onChange([...data, { id: crypto.randomUUID(), degree: '', institution: '', field: '', startYear: '', endYear: '', grade: '' }]);
  };

  const update = (id: string, field: keyof Education, value: string) => {
    onChange(data.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const remove = (id: string) => {
    onChange(data.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-bold text-white">Education</h3>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-all">
          <Plus size={14} /> Add Education
        </button>
      </div>
      {data.length === 0 && (
        <p className="text-sm text-slate-500 italic">No education entries added yet.</p>
      )}
      {data.map((item) => (
        <div key={item.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={item.degree} onChange={(e) => update(item.id, 'degree', e.target.value)} placeholder="Degree (e.g. B.Tech CSE)" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.institution} onChange={(e) => update(item.id, 'institution', e.target.value)} placeholder="Institution" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.field} onChange={(e) => update(item.id, 'field', e.target.value)} placeholder="Field of study" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <div className="flex gap-2">
              <input value={item.startYear} onChange={(e) => update(item.id, 'startYear', e.target.value)} placeholder="Start" className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
              <input value={item.endYear} onChange={(e) => update(item.id, 'endYear', e.target.value)} placeholder="End" className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            </div>
            <input value={item.grade} onChange={(e) => update(item.id, 'grade', e.target.value)} placeholder="Grade / CGPA" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
          </div>
          <button onClick={() => remove(item.id)} className="self-end p-1.5 text-slate-500 hover:text-red-400 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
