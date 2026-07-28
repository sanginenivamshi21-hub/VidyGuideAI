'use client';

import { Plus, X } from 'lucide-react';
import { Language } from './types';

interface Props {
  data: Language[];
  onChange: (data: Language[]) => void;
}

export default function LanguagesSection({ data, onChange }: Props) {
  const add = () => {
    onChange([...data, { id: crypto.randomUUID(), name: '', proficiency: 'intermediate' }]);
  };
  const update = (id: string, field: keyof Language, value: string) => {
    onChange(data.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };
  const remove = (id: string) => {
    onChange(data.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-bold text-white">Languages</h3>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-all">
          <Plus size={14} /> Add Language
        </button>
      </div>
      {data.length === 0 && <p className="text-sm text-slate-500 italic">No languages added yet.</p>}
      <div className="flex flex-wrap gap-2">
        {data.map((item) => (
          <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-full">
            <input value={item.name} onChange={(e) => update(item.id, 'name', e.target.value)} placeholder="Language" className="w-24 bg-transparent text-white text-xs outline-none" />
            <select value={item.proficiency} onChange={(e) => update(item.id, 'proficiency', e.target.value)} className="bg-transparent text-slate-400 text-xs outline-none cursor-pointer">
              <option value="native">Native</option>
              <option value="fluent">Fluent</option>
              <option value="intermediate">Intermediate</option>
              <option value="basic">Basic</option>
            </select>
            <button onClick={() => remove(item.id)} className="text-slate-500 hover:text-red-400 transition-all"><X size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}
