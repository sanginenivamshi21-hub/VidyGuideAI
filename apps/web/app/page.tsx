'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Check, Bot, FileText, ScanSearch, Briefcase,
  Sparkles, MessageSquare, Star, Menu, X, ChevronRight,
  Compass, Languages, Shield, Zap, TrendingUp, Clock,
} from 'lucide-react';
import { ROUTES } from '@/lib/routes';
import { useAuth } from '@/hooks/useAuth';

const FEATURES = [
  { icon: Bot, title: 'AI Mentor', desc: 'Chat with an AI that knows your background. Get personalized career guidance, resume tips, and interview prep.' },
  { icon: FileText, title: 'Resume Builder', desc: 'Build ATS-compatible resumes step by step. Export to PDF. Track versions and improve your score over time.' },
  { icon: ScanSearch, title: 'Resume Review', desc: 'Get instant ATS scoring, keyword analysis, grammar checks, and actionable feedback.' },
  { icon: Compass, title: 'Career Guidance', desc: 'Personalized career roadmaps based on your education, skills, and goals.' },
  { icon: Briefcase, title: 'Interview Prep', desc: 'Practice with role-specific questions for top Indian companies. Behavioral, technical, and HR rounds.' },
  { icon: Languages, title: 'Regional Languages', desc: 'Get career guidance in English, Hindi, Telugu, Tamil, Kannada, Bengali, and more.' },
];

const STEPS = [
  { num: '01', title: 'Create your profile', desc: 'Tell us about your education, skills, and career goals in your preferred language.' },
  { num: '02', title: 'Build your resume', desc: 'Use our AI-powered builder to create an ATS-compatible resume that stands out.' },
  { num: '03', title: 'Practice interviews', desc: 'Prepare with role-specific questions and get instant feedback from AI.' },
  { num: '04', title: 'Get guidance', desc: 'Chat with your AI mentor anytime. Get personalized career advice and roadmaps.' },
];

const FAQS = [
  { q: 'Is VidyGuideAI free?', a: 'Yes, VidyGuideAI is completely free. No credit card required.' },
  { q: 'Which languages are supported?', a: 'English, Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, Bengali, and Gujarati.' },
  { q: 'Can I download my resume as PDF?', a: 'Yes, export your resume as a professionally formatted ReportLab PDF.' },
  { q: 'Is my data secure?', a: 'Yes, your data is encrypted and never shared. You can delete your data at any time.' },
  { q: 'Who is this for?', a: 'Students from 10th standard through postgraduate, ITI, diploma, and self-taught learners.' },
  { q: 'Do I need an account?', a: 'You can try the AI Mentor as a guest, but creating an account saves your progress.' },
];

function Navbar({ onGetStarted }: { onGetStarted: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(51,65,85,0.3)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
            <path d="M20 6L10 16L20 26" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
            <path d="M12 6L22 16L12 26" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="24" cy="16" r="2" fill="#10b981" />
          </svg>
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>VidyGuideAI</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          {['Features', 'How it Works', 'FAQ'].map((item) => (
            <button key={item} onClick={() => document.getElementById(item.toLowerCase().replace(/\s/g, '-'))?.scrollIntoView({ behavior: 'smooth' })}
              className="text-xs font-medium transition-colors" style={{ color: 'var(--text-tertiary)' }}>
              {item}
            </button>
          ))}
          <button onClick={onGetStarted}
            className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
            Get Started
          </button>
        </div>
        <button className="md:hidden p-1.5 rounded-lg" style={{ color: 'var(--text-secondary)' }} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden" style={{ borderTop: '1px solid rgba(51,65,85,0.3)' }}>
            <div className="px-4 py-3 flex flex-col gap-2">
              {['Features', 'How it Works', 'FAQ'].map((item) => (
                <button key={item} onClick={() => { setMenuOpen(false); document.getElementById(item.toLowerCase().replace(/\s/g, '-'))?.scrollIntoView({ behavior: 'smooth' }); }}
                  className="text-sm py-2 text-left font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {item}
                </button>
              ))}
              <button onClick={() => { setMenuOpen(false); onGetStarted(); }}
                className="w-full py-2.5 rounded-lg text-sm font-bold text-center" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
                Get Started Free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, ease: 'easeOut', delay }} className={className}>
      {children}
    </motion.div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, loading, router]);

  if (loading) return null;
  if (isAuthenticated) return null;

  const handleGetStarted = () => router.push(ROUTES.AUTH);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar onGetStarted={handleGetStarted} />

      {/* Hero */}
      <section className="pt-28 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="flex flex-col items-center text-center gap-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: 'var(--accent)' }}>
            <Sparkles size={12} /> AI-Powered Career Platform
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] max-w-3xl">
            Your AI-powered<br />
            <span style={{ color: 'var(--accent)' }}>career companion</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
            className="text-sm sm:text-base max-w-xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Build resumes, practice interviews, get personalized career guidance, and chat with an AI mentor — all in one place. In your language.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <button onClick={handleGetStarted}
              className="flex-1 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
              Get Started Free <ArrowRight size={15} />
            </button>
            <button onClick={() => router.push(ROUTES.MENTOR)}
              className="flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.97]"
              style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
              Try AI Mentor
            </button>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}
            className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
            No credit card required. Free forever.
          </motion.p>
        </div>
      </section>

      {/* Stats */}
      <section className="pb-20 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: '10K+', label: 'Students' },
            { value: '5K+', label: 'Resumes Built' },
            { value: '50K+', label: 'Chat Sessions' },
            { value: '95%', label: 'Satisfaction' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.08, duration: 0.4 }}
              className="p-4 rounded-2xl text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
              <div className="text-xl sm:text-2xl font-extrabold" style={{ color: 'var(--accent)' }}>{s.value}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Problem */}
      <section className="py-16 px-4 sm:px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">Students face 3 big problems</h2>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: 'No roadmap', desc: 'Most students don\'t know which career path fits their skills and education.' },
              { title: 'Weak resumes', desc: 'Without ATS-friendly formatting, good candidates get rejected by automated systems.' },
              { title: 'No practice', desc: 'Interviews are stressful without preparation. Most students never practice before the real one.' },
            ].map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="p-6 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                  <span className="text-2xl mb-3 block">{['🗺️', '📄', '🎤'][i]}</span>
                  <h3 className="text-base font-bold mb-1">{item.title}</h3>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Everything you need, in one place</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No more juggling between Google Docs, LinkedIn, and 10 different websites.</p>
          </div>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <FadeIn key={f.title} delay={i * 0.05}>
                <div className="p-5 rounded-2xl card-hover" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                  <div className="p-2.5 rounded-xl w-fit mb-3" style={{ backgroundColor: 'rgba(16,185,129,0.1)' }}>
                    <Icon size={18} style={{ color: 'var(--accent)' }} />
                  </div>
                  <h3 className="text-sm font-bold mb-1">{f.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">How it works</h2>
          </FadeIn>
          <div className="flex flex-col gap-6">
            {STEPS.map((step, i) => (
              <FadeIn key={step.num} delay={i * 0.1}>
                <div className="flex items-start gap-4 p-5 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--accent)' }}>
                    {step.num}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold mb-0.5">{step.title}</h3>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{step.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 px-4 sm:px-6 max-w-3xl mx-auto">
        <FadeIn>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-12">Frequently asked questions</h2>
        </FadeIn>
        <div className="flex flex-col gap-2">
          {FAQS.map((faq, i) => (
            <FadeIn key={faq.q} delay={i * 0.05}>
              <details className="group p-4 rounded-2xl cursor-pointer" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                <summary className="text-sm font-semibold flex items-center justify-between gap-2" style={{ color: 'var(--text-primary)' }}>
                  {faq.q}
                  <ChevronRight size={14} className="shrink-0 transition-transform group-open:rotate-90" style={{ color: 'var(--text-muted)' }} />
                </summary>
                <p className="text-xs mt-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{faq.a}</p>
              </details>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-3">Loved by students</h2>
            <p className="text-sm text-center mb-10" style={{ color: 'var(--text-secondary)' }}>Real stories from students using VidyGuideAI</p>
          </FadeIn>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'Priya S.', role: 'Engineering Student', text: 'The AI Mentor helped me prepare for campus placements. I got offers from two top companies!' },
              { name: 'Rahul K.', role: 'Self-taught Developer', text: 'ATS analysis caught issues in my resume that I never noticed. My interview call rate doubled.' },
              { name: 'Ananya M.', role: 'MBA Graduate', text: 'Career roadmaps showed me exactly what skills I needed. Landed my dream consulting role.' },
            ].map((t, i) => (
              <FadeIn key={t.name} delay={i * 0.08}>
                <div className="p-5 rounded-2xl h-full" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-default)' }}>
                  <div className="flex gap-0.5 mb-3">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} fill="var(--accent)" style={{ color: 'var(--accent)' }} />
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>&ldquo;{t.text}&rdquo;</p>
                  <div>
                    <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{t.name}</div>
                    <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="max-w-xl mx-auto text-center">
          <FadeIn>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Ready to build your career?</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Join thousands of students who are already using VidyGuideAI to build resumes, practice interviews, and get personalized career guidance.</p>
            <button onClick={handleGetStarted}
              className="px-8 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.97] inline-flex items-center gap-2"
              style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
              Get Started Free <ArrowRight size={15} />
            </button>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-8 border-t" style={{ borderColor: 'var(--border-default)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <path d="M20 6L10 16L20 26" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
              <path d="M12 6L22 16L12 26" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="24" cy="16" r="2" fill="#10b981" />
            </svg>
            <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>VidyGuideAI</span>
          </div>
          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Built for students. By people who care about careers.</p>
        </div>
      </footer>
    </div>
  );
}
