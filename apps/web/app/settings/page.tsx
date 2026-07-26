'use client';

import { useState, useEffect } from 'react';
import { Settings, Check, Globe, HelpCircle } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  'English',
  'Telugu',
  'Hindi',
  'Tamil',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Bengali',
  'Gujarati',
  'Punjabi',
  'Odia',
  'Urdu',
];

export default function SettingsPage() {
  const [language, setLanguage] = useState('English');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('ui_language') || 'English';
    setLanguage(saved);
  }, []);

  const handleSave = () => {
    localStorage.setItem('ui_language', language);
    setMessage('Settings saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto py-4">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-350 text-xl">
          ⚙️
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-extrabold text-white tracking-tight">System Settings</h1>
          <p className="text-slate-500 text-xs">
            Configure system language parameters and regional counselor options.
          </p>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-850 pb-3 flex items-center gap-2">
          <Globe size={16} className="text-emerald-400" />
          Language Preferences
        </h3>

        {message && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-lg font-medium text-center flex items-center justify-center gap-1.5 animate-fadeIn">
            <Check size={14} />
            {message}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Default Response Language
          </label>
          <p className="text-[11px] text-slate-500 mb-1 leading-normal">
            Choose the language in which you want AI recommendations, resumes, and mentor advice to be output.
          </p>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full max-w-xs bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-xs transition-all cursor-pointer font-semibold"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
        </div>

        <div className="border-t border-slate-850 pt-4 flex gap-2.5 items-start">
          <HelpCircle size={16} className="text-slate-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 leading-normal">
            Your preferences are synced locally on your current browser environment. If you continue in Guest mode, language configurations remain active.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="w-full sm:w-auto py-2.5 px-6 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-lg shadow-emerald-500/25 active:scale-95 transition-all mt-2 w-fit"
        >
          Save Configuration
        </button>
      </div>
    </div>
  );
}
