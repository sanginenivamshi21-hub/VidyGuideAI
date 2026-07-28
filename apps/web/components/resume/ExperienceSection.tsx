'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Experience } from './types';

interface Props {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

export default function ExperienceSection({ data, onChange }: Props) {
  const add = () => {
    onChange([...data, { id: crypto.randomUUID(), company: '', role: '', location: '', startDate: '', endDate: '', current: false, description: '' }]);
  };

  const update = (id: string, field: keyof Experience, value: string | boolean) => {
    onChange(data.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const remove = (id: string) => {
    onChange(data.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-bold text-white">Experience</h3>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-all">
          <Plus size={14} /> Add Experience
        </button>
      </div>
      {data.length === 0 && (
        <p className="text-sm text-slate-500 italic">No experience entries added yet.</p>
      )}
      {data.map((item) => (
        <div key={item.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={item.company} onChange={(e) => update(item.id, 'company', e.target.value)} placeholder="Company" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.role} onChange={(e) => update(item.id, 'role', e.target.value)} placeholder="Role" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.location} onChange={(e) => update(item.id, 'location', e.target.value)} placeholder="Location" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <div className="flex gap-2 items-center">
              <input value={item.startDate} onChange={(e) => update(item.id, 'startDate', e.target.value)} placeholder="Start date" className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
              {!item.current && (
                <input value={item.endDate} onChange={(e) => update(item.id, 'endDate', e.target.value)} placeholder="End date" className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
              )}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input type="checkbox" checked={item.current} onChange={(e) => update(item.id, 'current', e.target.checked)} className="accent-emerald-500" />
            I currently work here
          </label>
          <textarea value={item.description} onChange={(e) => update(item.id, 'description', e.target.value)} placeholder="Describe your responsibilities and achievements..." rows={3} className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm resize-none" />
          <button onClick={() => remove(item.id)} className="self-end p-1.5 text-slate-500 hover:text-red-400 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
