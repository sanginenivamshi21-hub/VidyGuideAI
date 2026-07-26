'use client';

import { useState } from 'react';
import { API_BASE } from '@/lib/api';
import { Mic, Info } from 'lucide-react';

export default function VoiceMentorPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto h-[85vh] py-2">
      {/* Header section */}
      <div className="flex items-center gap-3 border-b border-slate-850 pb-4">
        <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xl">
          🎙️
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-extrabold text-white tracking-tight">Voice Mentor</h1>
          <p className="text-slate-500 text-xs">
            Interact with your academic mentor using real-time voice synthesis and speech recognition.
          </p>
        </div>
      </div>

      <div className="p-4 bg-slate-900/40 border border-slate-850 rounded-xl flex items-start gap-2.5">
        <Info className="text-emerald-400 shrink-0 mt-0.5" size={16} />
        <p className="text-xs text-slate-400 leading-normal">
          Click the **"Start Listening"** button inside the widget, grant microphone permissions in your browser, and speak your career questions. The AI will reply with synthetic audio speech.
        </p>
      </div>

      {/* Voice widget iframe container */}
      <div className="flex-1 w-full bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden shadow-inner relative flex items-center justify-center">
        <iframe
          src={`${API_BASE}/voice/widget`}
          className="w-full h-full border-none"
          title="Voice Mentor Widget"
          allow="microphone"
        />
      </div>
    </div>
  );
}
