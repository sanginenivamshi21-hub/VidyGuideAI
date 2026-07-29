export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  CAREER: '/career',
  CAREER_ROADMAP: '/career/roadmap',
  RESUME: '/resume',
  RESUME_BUILDER: '/resume/builder',
  RESUME_REVIEW: '/resume/review',
  OCR: '/ocr',
  MENTOR: '/mentor',
  TRANSLATOR: '/translator',
  INTERVIEW_PREP: '/interview-prep',
  HISTORY: '/history',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

export const SIDEBAR_ITEMS = [
  { icon: 'Home' as const, label: 'Home', href: ROUTES.HOME, color: 'text-sky-400' },
  { icon: 'LayoutDashboard' as const, label: 'Dashboard', href: ROUTES.DASHBOARD, color: 'text-blue-400' },
  { icon: 'Compass' as const, label: 'Career Guidance', href: ROUTES.CAREER, color: 'text-emerald-400' },
  { icon: 'FileText' as const, label: 'Resume Builder', href: ROUTES.RESUME_BUILDER, color: 'text-indigo-400' },
  { icon: 'ScanSearch' as const, label: 'Resume Review', href: ROUTES.RESUME_REVIEW, color: 'text-indigo-400' },
  { icon: 'Bot' as const, label: 'AI Mentor', href: ROUTES.MENTOR, color: 'text-cyan-400' },
  { icon: 'Languages' as const, label: 'Translator', href: ROUTES.TRANSLATOR, color: 'text-orange-400' },
  { icon: 'Briefcase' as const, label: 'Interview Prep', href: ROUTES.INTERVIEW_PREP, color: 'text-violet-400' },
  { icon: 'Clock' as const, label: 'History', href: ROUTES.HISTORY, color: 'text-teal-400' },
  { icon: 'User' as const, label: 'Profile', href: ROUTES.PROFILE, color: 'text-yellow-400' },
  { icon: 'Settings' as const, label: 'Settings', href: ROUTES.SETTINGS, color: 'var(--accent)' },
] as const;

export const DASHBOARD_CARDS = [
  { icon: 'Compass' as const, title: 'Career Guidance', desc: 'Get tailored career recommendations for intermediate, diploma, ITI, or graduates.', href: ROUTES.CAREER, color: 'bg-emerald-500/10 text-emerald-455 border-emerald-500/20 hover:border-emerald-500/40' },
  { icon: 'Map' as const, title: 'Career Roadmap', desc: 'Visualize your academic and career step milestones chronologically in a scrolling timeline.', href: ROUTES.CAREER_ROADMAP, color: 'bg-purple-500/10 text-purple-455 border-purple-500/20 hover:border-purple-500/40' },
  { icon: 'FileText' as const, title: 'Resume Builder', desc: 'Build ATS-compatible resumes with role-specific questions and export print-ready PDFs.', href: ROUTES.RESUME_BUILDER, color: 'bg-indigo-500/10 text-indigo-455 border-indigo-500/20 hover:border-indigo-500/40' },
  { icon: 'ScanSearch' as const, title: 'Resume Review', desc: 'ATS scoring, keyword analysis, grammar check, formatting review, and role matching.', href: ROUTES.RESUME_REVIEW, color: 'bg-pink-500/10 text-pink-455 border-pink-500/20 hover:border-pink-500/40' },
  { icon: 'Bot' as const, title: 'AI Mentor', desc: 'Chat with your AI career assistant using text or voice. Upload PDFs, images, and documents.', href: ROUTES.MENTOR, color: 'bg-cyan-500/10 text-cyan-455 border-cyan-500/20 hover:border-cyan-500/40' },
  { icon: 'Languages' as const, title: 'Translator', desc: 'Translate career articles between English and 10+ regional Indian dialects.', href: ROUTES.TRANSLATOR, color: 'bg-orange-500/10 text-orange-455 border-orange-500/20 hover:border-orange-500/40' },
  { icon: 'Briefcase' as const, title: 'Interview Prep', desc: 'Practice mock technical & behavioral questions for specific Indian companies.', href: ROUTES.INTERVIEW_PREP, color: 'bg-violet-500/10 text-violet-455 border-violet-500/20 hover:border-violet-500/40' },
] as const;
