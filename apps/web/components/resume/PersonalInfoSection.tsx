'use client';

import { PersonalInfo } from './types';

interface Props {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export default function PersonalInfoSection({ data, onChange }: Props) {
  const update = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-md font-bold text-white flex items-center gap-1.5">
        Personal Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Full Name" value={data.fullName} onChange={(v) => update('fullName', v)} placeholder="Ravi Kumar" />
        <Input label="Professional Title" value={data.title} onChange={(v) => update('title', v)} placeholder="Software Engineer" />
        <Input label="Email" value={data.email} onChange={(v) => update('email', v)} placeholder="you@example.com" type="email" />
        <Input label="Phone" value={data.phone} onChange={(v) => update('phone', v)} placeholder="+91 98765 43210" />
        <Input label="Location" value={data.location} onChange={(v) => update('location', v)} placeholder="Guntur, AP" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Professional Summary</label>
        <textarea
          value={data.summary}
          onChange={(e) => update('summary', e.target.value)}
          placeholder="Brief overview of your career objective and key qualifications..."
          rows={3}
          className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all resize-none"
        />
      </div>
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text' }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
      />
    </div>
  );
}
