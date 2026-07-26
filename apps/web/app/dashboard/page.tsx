'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Compass,
  Map,
  FileText,
  FileEdit,
  ScanLine,
  Bot,
  Mic,
  Languages,
  Briefcase,
  Clock,
  User,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface Stats {
  career_count: number;
  resume_count: number;
  mentor_count: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [stats, setStats] = useState<Stats>({ career_count: 0, resume_count: 0, mentor_count: 0 });
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push('/auth');
      return;
    }

    const user = JSON.parse(userStr);
    setUserName(user.fullName || user.username || 'Candidate');
    if (user.id === null) {
      setIsGuest(true);
      setLoading(false);
    } else {
      // Fetch profile stats
      fetch('http://localhost:8000/users/profile')
        .then((r) => {
          if (r.status === 401) {
            setIsGuest(true);
            return null;
          }
          return r.json();
        })
        .then((data) => {
          if (data && data.stats) {
            setStats(data.stats);
          }
        })
        .catch((e) => console.error('Stats fetch error:', e))
        .finally(() => setLoading(false));
    }
  }, [router]);

  const cards = [
    {
      icon: Compass,
      title: 'Career Guidance',
      desc: 'Get tailored career recommendations for intermediate, diploma, ITI, or graduates.',
      href: '/career',
      color: 'bg-emerald-500/10 text-emerald-455 border-emerald-500/20 hover:border-emerald-500/40',
    },
    {
      icon: Map,
      title: 'Career Roadmap',
      desc: 'Visualize your academic and career step milestones chronologically in a scrolling timeline.',
      href: '/career/roadmap',
      color: 'bg-purple-500/10 text-purple-455 border-purple-500/20 hover:border-purple-500/40',
    },
    {
      icon: FileText,
      title: 'Resume Builder',
      desc: 'Input academic parameters to build ATS-compatible resumes and download ReportLab PDFs.',
      href: '/resume',
      color: 'bg-indigo-500/10 text-indigo-455 border-indigo-500/20 hover:border-indigo-500/40',
    },
    {
      icon: FileEdit,
      title: 'Resume Feedback',
      desc: 'Score ATS compliance levels and get section feedback instructions for improvements.',
      href: '/resume/feedback',
      color: 'bg-pink-500/10 text-pink-455 border-pink-500/20 hover:border-pink-500/40',
    },
    {
      icon: ScanLine,
      title: 'Resume Scanner (OCR)',
      desc: 'Extract raw textual paragraphs recursively from image or PDF documents.',
      href: '/ocr',
      color: 'bg-amber-500/10 text-amber-455 border-amber-500/20 hover:border-amber-500/40',
    },
    {
      icon: Bot,
      title: 'AI Mentor Advice',
      desc: 'Get specialized counseling and interview suggestions in your regional language.',
      href: '/mentor',
      color: 'bg-cyan-500/10 text-cyan-455 border-cyan-500/20 hover:border-cyan-500/40',
    },
    {
      icon: Mic,
      title: 'Voice Mentor',
      desc: 'Speak questions to our speech synthesizer and listen to real-time audio guidance replies.',
      href: '/voice-mentor',
      color: 'bg-red-500/10 text-red-455 border-red-500/20 hover:border-red-500/40',
    },
    {
      icon: Languages,
      title: 'Translator',
      desc: 'Translate career articles between English and 10+ regional Indian dialects.',
      href: '/translator',
      color: 'bg-orange-500/10 text-orange-455 border-orange-500/20 hover:border-orange-500/40',
    },
    {
      icon: Briefcase,
      title: 'Interview Prep',
      desc: 'Practice mock technical & behavioral questions for specific Indian companies.',
      href: '/interview-prep',
      color: 'bg-violet-500/10 text-violet-455 border-violet-500/20 hover:border-violet-500/40',
    },
  ];

  return (
    <div className="flex flex-col gap-10 max-w-6xl mx-auto py-4">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/20 border border-slate-800 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="flex flex-col gap-2 relative z-10">
          <span className="text-3xl">🌿</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-emerald-400">{userName}</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg">
            Empowering students with localized AI career counseling, visual roadmaps, and ATS resume verification logs.
          </p>
        </div>

        {/* Dynamic statistics overview */}
        {!isGuest && !loading && (
          <div className="flex items-center gap-4 relative z-10 shrink-0">
            <div className="flex flex-col items-center bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 min-w-[90px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Roadmaps</span>
              <span className="text-xl font-extrabold text-white mt-1.5">{stats.career_count}</span>
            </div>
            <div className="flex flex-col items-center bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 min-w-[90px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Resumes</span>
              <span className="text-xl font-extrabold text-white mt-1.5">{stats.resume_count}</span>
            </div>
            <div className="flex flex-col items-center bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 min-w-[90px]">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Mentor</span>
              <span className="text-xl font-extrabold text-white mt-1.5">{stats.mentor_count}</span>
            </div>
          </div>
        )}
      </div>

      {/* Bento quick launch modules */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <TrendingUp className="text-emerald-400" size={18} />
          Explore counseling tools
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`p-6 border rounded-2xl flex flex-col gap-4 group hover:-translate-y-1 transition-all duration-300 backdrop-blur-md cursor-pointer ${card.color}`}
              >
                <div className="flex justify-between items-center">
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl">
                    <Icon size={20} />
                  </div>
                  <div className="p-1.5 rounded-full bg-slate-950 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <ArrowRight size={14} className="text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-bold text-white group-hover:text-emerald-400 transition-all text-sm tracking-wide">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {card.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
