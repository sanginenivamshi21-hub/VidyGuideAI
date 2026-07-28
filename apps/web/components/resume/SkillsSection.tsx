'use client';

import { Plus, X } from 'lucide-react';
import { Skill } from './types';

interface Props {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'DevOps', 'Tools', 'Soft Skills', 'Other'];

export default function SkillsSection({ data, onChange }: Props) {
  const add = () => {
    onChange([...data, { id: crypto.randomUUID(), name: '', level: 'intermediate', category: 'Other' }]);
  };

  const update = (id: string, field: keyof Skill, value: string) => {
    onChange(data.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const remove = (id: string) => {
    onChange(data.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-bold text-white">Skills</h3>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-all">
          <Plus size={14} /> Add Skill
        </button>
      </div>
      {data.length === 0 && (
        <p className="text-sm text-slate-500 italic">No skills added yet.</p>
      )}
      <div className="flex flex-wrap gap-2">
        {data.map((item) => (
          <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-full">
            <select value={item.name} onChange={(e) => update(item.id, 'name', e.target.value)} className="bg-transparent text-white text-xs outline-none cursor-pointer">
              <option value="">Select skill</option>
              <optgroup label="Languages">
                <option value="JavaScript">JavaScript</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
                <option value="Go">Go</option>
                <option value="Rust">Rust</option>
              </optgroup>
              <optgroup label="Frontend">
                <option value="React">React</option>
                <option value="Next.js">Next.js</option>
                <option value="Vue">Vue</option>
                <option value="Tailwind CSS">Tailwind CSS</option>
              </optgroup>
              <optgroup label="Backend">
                <option value="Node.js">Node.js</option>
                <option value="NestJS">NestJS</option>
                <option value="Express">Express</option>
                <option value="Django">Django</option>
              </optgroup>
            </select>
            <select value={item.level} onChange={(e) => update(item.id, 'level', e.target.value)} className="bg-transparent text-slate-400 text-xs outline-none cursor-pointer">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
            <button onClick={() => remove(item.id)} className="text-slate-500 hover:text-red-400 transition-all">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
