'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, FileText, MessageSquare, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  const cards = [
    {
      title: 'Career Guidance',
      desc: 'Discover streams, diplomas, government options, and corporate routes customized for Indian students.',
      icon: Compass,
      color: 'text-blue-400',
      href: '/career',
    },
    {
      title: 'Resume Builder',
      desc: 'Create ATS-compliant plaintext resumes and export print-ready ReportLab PDFs.',
      icon: FileText,
      color: 'text-purple-400',
      href: '/resume',
    },
    {
      title: 'AI Mentor Chat',
      desc: 'Converse with our localized academic advisor about college switches and exam preparations.',
      icon: MessageSquare,
      color: 'text-emerald-400',
      href: '/mentor',
    },
    {
      title: 'OCR Resume Scanner',
      desc: 'Scan PDF or image resumes to calculate ATS keyword matching scores and improvements.',
      icon: ShieldAlert,
      color: 'text-amber-400',
      href: '/ocr',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-12 mt-10">
      {/* Hero Welcome Intro */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit text-emerald-400 text-sm">
          <Sparkles size={14} />
          <span>VidyGuideAI V3 Foundation Active</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Welcome to VidyGuideAI
        </h1>
        <p className="text-slate-400 max-w-2xl text-lg">
          Transforming career counseling for Indian students through localized, context-aware AI mentorship. Select a service from the sidebar or choose a panel below to begin.
        </p>

        <div className="mt-2">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
            >
              Go to Candidate Dashboard
              <ArrowRight size={16} />
            </Link>
          ) : (
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-lg shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
            >
              Get Started / Sign In
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>

      {/* Services Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              onClick={() => router.push(card.href)}
              className="p-6 bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl flex flex-col justify-between gap-4 hover:border-slate-700 transition-all group cursor-pointer"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded bg-slate-800 group-hover:bg-slate-700 ${card.color}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-all">
                    {card.title}
                  </h3>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed font-medium">
                  {card.desc}
                </p>
              </div>
              <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mt-2 group-hover:translate-x-1.5 transition-all">
                Launch Module &rarr;
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
