'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Project } from './types';

interface Props {
  data: Project[];
  onChange: (data: Project[]) => void;
}

export default function ProjectsSection({ data, onChange }: Props) {
  const add = () => {
    onChange([...data, { id: crypto.randomUUID(), title: '', description: '', technologies: '', link: '', startDate: '', endDate: '' }]);
  };

  const update = (id: string, field: keyof Project, value: string) => {
    onChange(data.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const remove = (id: string) => {
    onChange(data.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-bold text-white">Projects</h3>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-all">
          <Plus size={14} /> Add Project
        </button>
      </div>
      {data.length === 0 && (
        <p className="text-sm text-slate-500 italic">No projects added yet.</p>
      )}
      {data.map((item) => (
        <div key={item.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={item.title} onChange={(e) => update(item.id, 'title', e.target.value)} placeholder="Project title" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.technologies} onChange={(e) => update(item.id, 'technologies', e.target.value)} placeholder="Technologies used" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.link} onChange={(e) => update(item.id, 'link', e.target.value)} placeholder="Project link (optional)" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <div className="flex gap-2">
              <input value={item.startDate} onChange={(e) => update(item.id, 'startDate', e.target.value)} placeholder="Start" className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
              <input value={item.endDate} onChange={(e) => update(item.id, 'endDate', e.target.value)} placeholder="End" className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            </div>
          </div>
          <textarea value={item.description} onChange={(e) => update(item.id, 'description', e.target.value)} placeholder="Describe the project, your role, and key outcomes..." rows={2} className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm resize-none" />
          <button onClick={() => remove(item.id)} className="self-end p-1.5 text-slate-500 hover:text-red-400 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
