'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { 
  Compass, 
  Sparkles, 
  Map, 
  RefreshCw, 
  Trash2, 
  ArrowRight, 
  Sliders, 
  CheckSquare, 
  Square, 
  Award,
  BookOpen,
  Briefcase
} from 'lucide-react';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { useAnimationsEnabled } from '@/hooks/useAnimations';

const EDU_LEVELS: Record<string, string> = {
  '🏫 Class 10 (SSC/CBSE/ICSE)': '10th',
  '📘 Class 12 / Intermediate': '12th',
  '🎓 Diploma (Polytechnic)': 'diploma',
  '🎓 Bachelor\'s Degree (B.Tech / B.Sc / BA / B.Com)': 'bachelors',
  '📚 Master\'s Degree (M.Tech / MBA / MCA / M.Sc)': 'masters',
  '🛠 ITI / Vocational Course': 'iti',
  '📜 Other / Self-taught / Bootcamp': 'other',
};

const CAREER_DOMAINS: Record<string, string[]> = {
  '💻 Software / IT': ['Software Engineer', 'Web Developer', 'Mobile App Dev', 'QA Engineer', 'DevOps Engineer'],
  '📊 Data & Analytics': ['Data Analyst', 'Data Scientist', 'Business Analyst', 'ML Engineer'],
  '🎨 Design & Creative': ['UI/UX Designer', 'Graphic Designer', 'Video Editor', 'Content Creator'],
  '📣 Marketing & Sales': ['Digital Marketer', 'SEO Specialist', 'Sales Executive', 'Social Media Manager'],
  '🏦 Finance & Banking': ['Accountant', 'Finance Analyst', 'Bank PO', 'Tax Consultant'],
  '🏥 Healthcare': ['Lab Technician', 'Nursing Assistant', 'Healthcare Admin', 'Pharmacist'],
  '🏭 Manufacturing / Trades': ['CNC Operator', 'Electrician', 'Fitter', 'Welder', 'Mechanic'],
  '🎓 Education': ['Teacher', 'Tutor', 'EdTech Instructor', 'Academic Counselor'],
  '🛒 Retail & Operations': ['Store Manager', 'Logistics Executive', 'Customer Support', 'Warehouse Supervisor'],
  '🏛 Government / Civil': ['SSC CGL', 'Railway Jobs', 'State PSC', 'Clerk / Peon Posts'],
};

const TRENDING: Record<string, string[]> = {
  '10th': ['💼 ITI Trades', '🛒 Retail / Sales', '🎨 Graphic Design', '📞 BPO / Support'],
  '12th': ['💻 Web Dev', '📊 Data Entry', '📣 Digital Marketing', '🏦 Banking Clerk/PO'],
  'diploma': ['⚙️ Junior Engineer', '🏭 Production/Quality', '🔧 Field Service Eng', '💻 Web/App Dev'],
  'iti': ['⚡ Electrician', '🔩 CNC Operator', '🚗 Auto Technician', '🏭 NAPS Apprenticeship'],
  'bachelors': ['💻 Software Eng', '📊 Data Analyst', '☁️ Cloud/DevOps', '🎯 Product Manager'],
  'masters': ['🤖 ML/AI Engineer', '📈 Mgmt Consultant', '🔬 Research Scientist', '🏦 Investment Banking'],
  'iti_diploma_other': ['🛠 Skilled Trades', '📱 Mobile Repair', '🍳 Food & Hospitality', '🚛 Logistics'],
};

const TRENDING_DESC: Record<string, string> = {
  '💼 ITI Trades': 'Electrician, Fitter, COPA — high demand',
  '🛒 Retail / Sales': 'Entry-level jobs available now',
  '🎨 Graphic Design': 'Freelance after short course',
  '📞 BPO / Support': 'Good salary, no degree needed',
  '💻 Web Dev': 'Bootcamp → ₹2–4 LPA',
  '📊 Data Entry': 'Govt & private hiring',
  '📣 Digital Marketing': 'Short course + internship',
  '🏦 Banking Clerk/PO': 'IBPS/SSC — massive hiring',
  '⚙️ Junior Engineer': 'GATE, PSUs, Govt JE posts',
  '🏭 Production/Quality': '₹2–5 LPA',
  '🔧 Field Service Eng': 'MNCs like Bosch, Siemens',
  '💻 Web/App Dev': 'IT jobs accessible with skills',
  '⚡ Electrician': 'CPWD, PWD — always in demand',
  '🔩 CNC Operator': '₹2–4 LPA auto industry',
  '🚗 Auto Technician': 'Maruti, Hyundai hire ITI',
  '🏭 NAPS Apprenticeship': 'Govt-sponsored + stipend',
  '💻 Software Eng': 'TCS, Infosys, startups',
  '📊 Data Analyst': 'SQL+Python → ₹4–10 LPA',
  '☁️ Cloud/DevOps': 'AWS cert → ₹8–20 LPA',
  '🎯 Product Manager': '₹15–40 LPA after 2–3 yr',
  '🤖 ML/AI Engineer': '₹12–30 LPA top tech firms',
  '📈 Mgmt Consultant': 'Big4 / McKinsey',
  '🔬 Research Scientist': 'DRDO, ISRO, IITs',
  '🏦 Investment Banking': '₹15–50 LPA',
  '🛠 Skilled Trades': 'Plumbing, electrical, welding',
  '📱 Mobile Repair': 'Self-employment opportunity',
  '🍳 Food & Hospitality': 'Hotel management roles',
  '🚛 Logistics': 'Transport sector jobs',
};

const CTX: Record<string, any> = {
  '10th': {
    hint: 'You don\'t have a stream yet — we\'ll suggest what to pick!',
    extra: '📋 Subjects you liked',
    ph: 'e.g. Maths, Science, Drawing',
    goal: '🎯 What do you want?',
    goals: ['Get a job quickly', 'Study further (11th/12th)', 'Learn a trade / ITI', 'Start something of my own', 'Not sure yet'],
    loc: true
  },
  '12th': {
    hint: '',
    extra: '📚 Your 12th Stream & Marks',
    ph: 'e.g. MPC — Maths 92, Physics 85',
    goal: '🎯 What\'s your next step?',
    goals: ['Get a job now', 'Pursue a degree', 'Competitive exams (JEE/NEET)', 'Short course + job', 'Not sure yet'],
    loc: true
  },
  'diploma': {
    hint: '',
    extra: '🔧 Your Diploma Branch',
    ph: 'e.g. Mechanical — CNC, AutoCAD',
    goal: '🎯 Aiming for?',
    goals: ['Govt job (JE/PSU)', 'Private sector', 'B.Tech Lateral entry', 'Own business', 'Not sure'],
    loc: false
  },
  'iti': {
    hint: '',
    extra: '🔩 Your ITI Trade',
    ph: 'e.g. Electrician, Fitter, COPA',
    goal: '🎯 What next?',
    goals: ['Apprenticeship (NAPS/NATS)', 'Govt job (Railways/CPWD)', 'Private industry', 'Own workshop', 'Upgrade skills'],
    loc: false
  },
  'bachelors': {
    hint: '',
    extra: '🎓 Degree, Branch & College',
    ph: 'e.g. B.Tech CSE — JNTU 2024, 7.8 CGPA',
    goal: '🎯 Your goal?',
    goals: ['Placement / Job', 'Masters/MBA', 'Startup', 'Govt/PSU', 'Switch domain'],
    loc: false
  },
  'masters': {
    hint: '',
    extra: '📚 Masters Degree & Specialisation',
    ph: 'e.g. MBA Marketing — IIM Lucknow 2024',
    goal: '🎯 Career focus?',
    goals: ['Senior corporate role', 'Research/Academia', 'Consulting', 'Entrepreneurship', 'International career'],
    loc: false
  },
  'other': {
    hint: '',
    extra: '📜 Course / Certification',
    ph: 'e.g. Full Stack Dev — Udemy, 6 months',
    goal: '🎯 Career aim?',
    goals: ['Get a job now', 'Freelancing', 'Higher education', 'Start own workshop', 'Not sure yet'],
    loc: false
  }
};

const SUPPORTED_LANGUAGES = {
  English: 'en',
  Telugu: 'te',
  Hindi: 'hi',
  Tamil: 'ta',
  Kannada: 'kn',
  Malayalam: 'ml',
  Marathi: 'mr',
  Bengali: 'bn',
  Gujarati: 'gu',
  Punjabi: 'pa',
  Odia: 'or',
  Urdu: 'ur',
};

export default function CareerPage() {
  const { t } = useI18n();
  const animationsEnabled = useAnimationsEnabled();
  const router = useRouter();
  const [eduKey, setEduKey] = useState('🏫 Class 10 (SSC/CBSE/ICSE)');
  const [extraInfo, setExtraInfo] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [goal, setGoal] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [note, setNote] = useState('');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [milestones, setMilestones] = useState<any[]>([]);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [error, setError] = useState('');

  // Advanced Inputs State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [cgpa, setCgpa] = useState('');
  const [languages, setLanguages] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [preferredCountry, setPreferredCountry] = useState('');
  const [dreamJob, setDreamJob] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [studyHours, setStudyHours] = useState('');
  const [timeline, setTimeline] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [leetcode, setLeetcode] = useState('');
  const [hackerrank, setHackerrank] = useState('');
  const [projects, setProjects] = useState('');
  const [certificates, setCertificates] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');

  // Interactive Checklist State
  const [completedMilestones, setCompletedMilestones] = useState<number[]>([]);

  const eduLvl = EDU_LEVELS[eduKey] || 'other';
  const ctx = CTX[eduLvl] || CTX['other'];
  const trendingKey = eduLvl in TRENDING ? eduLvl : 'iti_diploma_other';

  useEffect(() => {
    if (ctx && ctx.goals) {
      setGoal(ctx.goals[0]);
    }
  }, [eduKey, ctx]);

  const completeness = () => {
    let score = 0;
    if (extraInfo.trim()) score += 20;
    if (skills.trim()) score += 20;
    if (interests.trim()) score += 20;
    if (note.trim()) score += 20;
    if (cgpa.trim() || targetCompany.trim() || languages.trim()) score += 20;
    return score;
  };

  const handleGenerate = async () => {
    if (!skills.trim() && !interests.trim()) {
      setError('Please enter at least your skills or interests to continue.');
      return;
    }

    setError('');
    setLoading(true);
    setResult('');
    setMilestones([]);
    setShowRoadmap(false);
    setCompletedMilestones([]);

    try {
      const data = await api('/career', {
        method: 'POST',
        body: {
          skills,
          interests,
          education: eduKey,
          education_level: eduLvl,
          education_detail: extraInfo,
          goal,
          location: locationInput,
          extra_context: note,
          reply_language: SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES] || 'en',
          cgpa,
          languages,
          target_company: targetCompany,
          preferred_country: preferredCountry,
          dream_job: dreamJob,
          expected_salary: expectedSalary,
          study_hours: studyHours,
          timeline,
          linkedin,
          github,
          leetcode,
          hackerrank,
          projects,
          certificates,
          strengths,
          weaknesses,
        },
      });

      setResult(data.career_suggestions);

      // Parse milestones
      try {
        const roadmapData = await api('/career/roadmap', {
          method: 'POST',
          body: { text: data.career_suggestions },
        });
        setMilestones(roadmapData.milestones || []);
        setShowRoadmap(true);
      } catch {}

      // Log history
      const user = localStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        if (parsedUser.id !== null) {
          try {
            await api('/history', {
              method: 'POST',
              body: {
                actionType: 'career',
                title: `Career Guidance (${eduKey.split(' ', 2)[1] || eduKey})`,
                payload: {
                  skills,
                  interests,
                  education: eduKey,
                  education_level: eduLvl,
                  education_detail: extraInfo,
                  goal,
                  location: locationInput,
                  extra_context: note,
                  language,
                },
                result: data.career_suggestions,
              },
            });
          } catch {}
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch career suggestions. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResult('');
    setMilestones([]);
    setShowRoadmap(false);
    setCompletedMilestones([]);
  };

  const toggleMilestoneComplete = (index: number) => {
    if (completedMilestones.includes(index)) {
      setCompletedMilestones(completedMilestones.filter(i => i !== index));
    } else {
      setCompletedMilestones([...completedMilestones, index]);
    }
  };

  const roadmapProgress = milestones.length > 0 
    ? Math.round((completedMilestones.length / milestones.length) * 100) 
    : 0;

  return (
    <motion.div
      initial={animationsEnabled ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-10 max-w-5xl mx-auto py-4"
    >
      <div className="flex items-center gap-4">
        <div className="icon-box" style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-10)' }}>
          <Compass size={20} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-h1">{t('career.title')}</h1>
          <p className="text-caption mt-0.5">{t('career.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Core Inputs Column */}
        <div className="md:col-span-2 flex flex-col gap-6 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
          {/* Step 1 */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-emerald-400 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Step 1</span>
              Academic Level
            </h3>
            <select
              value={eduKey}
              onChange={(e) => setEduKey(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm transition-all"
            >
              {Object.keys(EDU_LEVELS).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            {ctx.hint && (
              <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 text-xs rounded-xl mt-1 leading-normal font-semibold">
                💡 {ctx.hint}
              </div>
            )}
          </div>

          <div className="border-t border-slate-800 my-1" />

          {/* Step 2 */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="text-emerald-400 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Step 2</span>
              Profile Parameters
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{ctx.extra}</label>
              <input
                type="text"
                required
                value={extraInfo}
                onChange={(e) => setExtraInfo(e.target.value)}
                placeholder={ctx.ph}
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">🛠 Key Skills (comma-separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Java, SQL, Communications"
                  className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">💡 Interests & Passions</label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g. Open-source, Design, Finance"
                  className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{ctx.goal}</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm transition-all"
                >
                  {ctx.goals && ctx.goals.map((g: string) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {ctx.loc && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">📍 Current City / State</label>
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="e.g. Hyderabad, TS"
                    className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm transition-all"
                  />
                </div>
              )}
            </div>

            {/* Collapsible Advanced Parameters */}
            <div className="border border-slate-800 rounded-2xl p-4 bg-slate-950/20">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-xs font-bold text-slate-400 hover:text-white transition-all"
              >
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <Sliders size={14} className="text-emerald-400" />
                  Advanced Profiling Parameters (Optional)
                </span>
                <span className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded px-2 py-0.5">
                  {showAdvanced ? 'Hide Options' : 'Show Options'}
                </span>
              </button>

              {showAdvanced && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800/80 animate-fadeIn">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">CGPA / Percentage Marks</label>
                    <input
                      type="text"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      placeholder="e.g. 8.4 CGPA or 88%"
                      className="bg-slate-950/80 border border-slate-800 text-white rounded-lg p-2 outline-none text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Programming Languages</label>
                    <input
                      type="text"
                      value={languages}
                      onChange={(e) => setLanguages(e.target.value)}
                      placeholder="e.g. Java, Python, TypeScript"
                      className="bg-slate-950/80 border border-slate-800 text-white rounded-lg p-2 outline-none text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Dream Job / Destination</label>
                    <input
                      type="text"
                      value={dreamJob}
                      onChange={(e) => setDreamJob(e.target.value)}
                      placeholder="e.g. AI Researcher, VP of Finance"
                      className="bg-slate-950/80 border border-slate-800 text-white rounded-lg p-2 outline-none text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Expected Salary (LPA)</label>
                    <input
                      type="text"
                      value={expectedSalary}
                      onChange={(e) => setExpectedSalary(e.target.value)}
                      placeholder="e.g. ₹6-10 LPA"
                      className="bg-slate-950/80 border border-slate-800 text-white rounded-lg p-2 outline-none text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Target Companies</label>
                    <input
                      type="text"
                      value={targetCompany}
                      onChange={(e) => setTargetCompany(e.target.value)}
                      placeholder="e.g. TCS, Infosys, SBI, Microsoft"
                      className="bg-slate-950/80 border border-slate-800 text-white rounded-lg p-2 outline-none text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Preferred Work Country</label>
                    <input
                      type="text"
                      value={preferredCountry}
                      onChange={(e) => setPreferredCountry(e.target.value)}
                      placeholder="e.g. India, USA, Germany"
                      className="bg-slate-950/80 border border-slate-800 text-white rounded-lg p-2 outline-none text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Study Hours Per Day</label>
                    <input
                      type="text"
                      value={studyHours}
                      onChange={(e) => setStudyHours(e.target.value)}
                      placeholder="e.g. 3-4 hours"
                      className="bg-slate-950/80 border border-slate-800 text-white rounded-lg p-2 outline-none text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Timeline Period</label>
                    <input
                      type="text"
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      placeholder="e.g. 6 Months, 1 Year"
                      className="bg-slate-950/80 border border-slate-800 text-white rounded-lg p-2 outline-none text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Portfolio URLs (GitHub/LinkedIn/LeetCode)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={linkedin}
                        onChange={(e) => setLinkedin(e.target.value)}
                        placeholder="LinkedIn"
                        className="bg-slate-950/80 border border-slate-800 text-white rounded-lg p-1.5 outline-none text-[10px]"
                      />
                      <input
                        type="text"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                        placeholder="GitHub"
                        className="bg-slate-950/80 border border-slate-800 text-white rounded-lg p-1.5 outline-none text-[10px]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Projects & Certifications</label>
                    <input
                      type="text"
                      value={certificates}
                      onChange={(e) => setCertificates(e.target.value)}
                      placeholder="e.g. AWS Certified, Node project"
                      className="bg-slate-950/80 border border-slate-800 text-white rounded-lg p-2 outline-none text-xs"
                    />
                  </div>

                  <div className="flex flex-col gap-1 sm:col-span-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Key Strengths</label>
                        <input
                          type="text"
                          value={strengths}
                          onChange={(e) => setStrengths(e.target.value)}
                          placeholder="e.g. Fast learner, problem solver"
                          className="bg-slate-950/80 border border-slate-800 text-white rounded-lg p-2 outline-none text-xs"
                        />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Weaknesses / Areas to Improve</label>
                        <input
                          type="text"
                          value={weaknesses}
                          onChange={(e) => setWeaknesses(e.target.value)}
                          placeholder="e.g. Stage fear, bad writing"
                          className="bg-slate-950/80 border border-slate-800 text-white rounded-lg p-2 outline-none text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">💬 Any extra notes? (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Need low-budget study options, part-time jobs..."
                rows={3}
                className="w-full bg-slate-950/80 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm transition-all resize-none"
              />
            </div>

            {/* Profile completeness bar */}
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400 uppercase tracking-wider">📊 Profiling Score</span>
                <span className="text-emerald-400">{completeness()}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 shadow-md shadow-emerald-500/30"
                  style={{ width: `${completeness()}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trending Careers Column */}
        <div className="flex flex-col gap-4 col-span-1">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            🔥 Top Path for {eduLvl.toUpperCase()}
          </h3>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[460px] pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {TRENDING[trendingKey]?.map((item) => (
              <div
                key={item}
                className="p-4 bg-slate-900/60 border border-slate-800 hover:border-emerald-500/30 rounded-2xl hover:translate-x-1 transition-all duration-200"
              >
                <div className="font-bold text-emerald-400 text-xs mb-1">{item}</div>
                <div className="text-[11px] text-slate-400 leading-normal">{TRENDING_DESC[item]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center justify-center gap-2 max-w-xl mx-auto w-full">
          <span>{error}</span>
        </div>
      )}

      {/* Action button row */}
      <div className="flex flex-col md:flex-row items-center gap-6 border-t border-slate-800 pt-6">
        <div className="w-full md:w-auto flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">🌐 Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg px-4 py-2 outline-none text-xs transition-all font-semibold cursor-pointer"
          >
            {Object.keys(SUPPORTED_LANGUAGES).map((langName) => (
              <option key={langName} value={langName}>
                {langName}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex-1 w-full md:w-auto flex items-center justify-center gap-2 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin" size={16} />
              Building your personalised roadmap...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Get My Career Suggestions
            </>
          )}
        </button>
      </div>

      {/* AI Recommendation Output Result */}
      {result && (
        <div className="flex flex-col gap-8 mt-6 border-t border-slate-800 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🌱</span> Your Personalised Guidance
            </h3>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowRoadmap(!showRoadmap)}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold transition-all duration-200 ${
                  showRoadmap
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/40 shadow-sm'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Map size={14} />
                {showRoadmap ? 'Hide Roadmap Timeline' : 'View Roadmap Timeline'}
              </button>
              <button
                onClick={handleClear}
                className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-all duration-200"
                title="Clear results"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Premium Timeline Roadmap visualizer */}
          {showRoadmap && milestones.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 flex flex-col gap-6 shadow-2xl animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4 gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🗺️</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">Visual Career Roadmap Timeline</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">Chronological steps matching your goal. Click checkboxes to track completed stages.</p>
                  </div>
                </div>

                {/* Progress metrics */}
                <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl p-3 shrink-0">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-none">Overall Progress</span>
                    <span className="text-xs font-extrabold text-white">{roadmapProgress}% Complete</span>
                  </div>
                  <div className="w-16 h-1.5 bg-slate-950 border border-slate-800 rounded-full overflow-hidden shrink-0">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-300 shadow-md shadow-emerald-500/35"
                      style={{ width: `${roadmapProgress}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Timeline Track Slider */}
              <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800 flex items-stretch gap-4 pr-4">
                {milestones.map((m, idx) => {
                  const isCompleted = completedMilestones.includes(idx);
                  return (
                    <div key={idx} className="flex items-center shrink-0">
                      <div className={`w-[240px] bg-slate-900/60 border rounded-2xl p-5 flex flex-col justify-between gap-4 relative transition-all duration-200 ${
                        isCompleted 
                          ? 'border-emerald-500/50 bg-emerald-500/[0.02] shadow-lg shadow-emerald-500/[0.02]' 
                          : 'border-slate-800 hover:border-slate-700 shadow-inner'
                      }`}>
                        
                        {/* Top bar with label and checkmark */}
                        <div className="flex justify-between items-center">
                          <div
                            className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border"
                            style={{ 
                              backgroundColor: isCompleted ? 'rgba(16, 185, 129, 0.1)' : `${m.color}15`, 
                              color: isCompleted ? '#34d399' : m.color, 
                              borderColor: isCompleted ? 'rgba(16, 185, 129, 0.25)' : `${m.color}25` 
                            }}
                          >
                            {m.label}
                          </div>

                          <button
                            onClick={() => toggleMilestoneComplete(idx)}
                            className={`p-1 rounded-lg border transition-all ${
                              isCompleted 
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                            }`}
                            title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            {isCompleted ? <CheckSquare size={14} /> : <Square size={14} />}
                          </button>
                        </div>

                        {/* Title & Icon info */}
                        <div className="flex items-start gap-2.5">
                          <span className="text-xl mt-0.5 shrink-0 select-none">{isCompleted ? '✅' : m.icon}</span>
                          <div className={`text-xs font-bold leading-relaxed line-clamp-3 select-text ${
                            isCompleted ? 'text-slate-400 line-through decoration-emerald-500/40' : 'text-slate-200'
                          }`}>
                            {m.title}
                          </div>
                        </div>

                        {/* Expandable Resource checkpoint info */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-semibold text-slate-500 uppercase">
                          <span>Timeline Stage</span>
                          <span className={isCompleted ? 'text-emerald-400' : 'text-slate-400'}>
                            {isCompleted ? 'Completed' : 'Action Pending'}
                          </span>
                        </div>
                      </div>
                      
                      {idx < milestones.length - 1 && (
                        <div className="flex flex-col items-center justify-center shrink-0 mx-2">
                          <ArrowRight size={16} className={isCompleted ? 'text-emerald-500/50' : 'text-slate-800'} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Markdown advice display */}
          <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-3xl text-slate-200 text-sm leading-relaxed font-sans shadow-2xl">
            <MarkdownRenderer content={result} />
          </div>
        </div>
      )}
    </motion.div>
  );
}
