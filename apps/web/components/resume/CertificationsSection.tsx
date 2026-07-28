'use client';

import { Plus, Trash2 } from 'lucide-react';
import { Certification } from './types';

interface Props {
  data: Certification[];
  onChange: (data: Certification[]) => void;
}

export default function CertificationsSection({ data, onChange }: Props) {
  const add = () => {
    onChange([...data, { id: crypto.randomUUID(), name: '', issuer: '', date: '', link: '' }]);
  };

  const update = (id: string, field: keyof Certification, value: string) => {
    onChange(data.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const remove = (id: string) => {
    onChange(data.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-bold text-white">Certifications</h3>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-all">
          <Plus size={14} /> Add Certification
        </button>
      </div>
      {data.length === 0 && (
        <p className="text-sm text-slate-500 italic">No certifications added yet.</p>
      )}
      {data.map((item) => (
        <div key={item.id} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex flex-col gap-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={item.name} onChange={(e) => update(item.id, 'name', e.target.value)} placeholder="Certification name" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.issuer} onChange={(e) => update(item.id, 'issuer', e.target.value)} placeholder="Issuing organization" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.date} onChange={(e) => update(item.id, 'date', e.target.value)} placeholder="Date obtained" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.link} onChange={(e) => update(item.id, 'link', e.target.value)} placeholder="Credential link (optional)" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
          </div>
          <button onClick={() => remove(item.id)} className="self-end p-1.5 text-slate-500 hover:text-red-400 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
