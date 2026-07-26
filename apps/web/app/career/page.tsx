'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Compass, Sparkles, Map, RefreshCw, Trash2, ArrowRight } from 'lucide-react';

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

  const eduLvl = EDU_LEVELS[eduKey] || 'other';
  const ctx = CTX[eduLvl] || CTX['other'];
  const trendingKey = eduLvl in TRENDING ? eduLvl : 'iti_diploma_other';

  useEffect(() => {
    // Reset goal when eduKey changes
    if (ctx && ctx.goals) {
      setGoal(ctx.goals[0]);
    }
  }, [eduKey, ctx]);

  // Calculate completeness percentage
  const completeness = () => {
    let score = 0;
    if (extraInfo.trim()) score += 25;
    if (skills.trim()) score += 25;
    if (interests.trim()) score += 25;
    if (note.trim()) score += 25;
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

    try {
      const resp = await fetch('http://localhost:8000/career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          skills,
          interests,
          education: eduKey,
          education_level: eduLvl,
          education_detail: extraInfo,
          goal,
          location: locationInput,
          extra_context: note,
          reply_language: SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES] || 'en',
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'API failed');
      }

      setResult(data.career_suggestions);

      // Parse roadmap milestones from the backend
      const roadmapResp = await fetch('http://localhost:8000/career/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: data.career_suggestions }),
      });

      if (roadmapResp.ok) {
        const roadmapData = await roadmapResp.json();
        setMilestones(roadmapData.milestones || []);
      }

      // Save history log
      const user = localStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        if (parsedUser.id !== null) {
          await fetch('http://localhost:8000/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
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
            }),
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch suggestions.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setResult('');
    setMilestones([]);
    setShowRoadmap(false);
  };

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto py-4">
      {/* Header section */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-2xl">
          🌱
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Career Guidance</h1>
          <p className="text-slate-400 text-sm">
            From Class 10 to Masters — personalised AI roadmaps for every level.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Step 1 & 2 Inputs Column */}
        <div className="md:col-span-2 flex flex-col gap-6 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex flex-col gap-2">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <span className="text-emerald-500 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Step 1</span>
              Your Academic Level
            </h3>
            <select
              value={eduKey}
              onChange={(e) => setEduKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
            >
              {Object.keys(EDU_LEVELS).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
            {ctx.hint && (
              <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/15 text-emerald-400 text-xs rounded-lg mt-1 leading-relaxed">
                💡 {ctx.hint}
              </div>
            )}
          </div>

          <div className="border-t border-slate-850 my-2" />

          <div className="flex flex-col gap-4">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <span className="text-emerald-500 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">Step 2</span>
              Your Profile Details
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{ctx.extra}</label>
              <input
                type="text"
                required
                value={extraInfo}
                onChange={(e) => setExtraInfo(e.target.value)}
                placeholder={ctx.ph}
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">🛠 Your Skills (comma-separated)</label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="e.g. Python, Excel, Teamwork"
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">💡 Interests / Passions</label>
                <input
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                  placeholder="e.g. Computers, Design, Nature"
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{ctx.goal}</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
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
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">📍 City / State</label>
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    placeholder="e.g. Guntur, AP"
                    className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">💬 Anything else? (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Need quick income, can't afford 4-yr degree..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all resize-none"
              />
            </div>

            {/* Profile completeness bar */}
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400 uppercase tracking-wider">📊 Profile completeness</span>
                <span className="text-emerald-400">{completeness()}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300 shadow-md shadow-emerald-500/30"
                  style={{ width: `${completeness()}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Trending Careers Column */}
        <div className="flex flex-col gap-4">
          <h3 className="text-md font-bold text-white flex items-center gap-1.5">
            🔥 Top Careers for {eduLvl.toUpperCase()}
          </h3>
          <div className="flex flex-col gap-3 overflow-y-auto max-h-[460px] pr-1">
            {TRENDING[trendingKey]?.map((item, idx) => (
              <div
                key={item}
                className="p-4 bg-slate-900/60 border border-slate-850 hover:border-emerald-500/40 rounded-xl hover:translate-x-1.5 transition-all duration-200"
              >
                <div className="font-bold text-emerald-400 text-sm mb-1">{item}</div>
                <div className="text-xs text-slate-400 leading-relaxed">{TRENDING_DESC[item]}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg font-medium text-center max-w-2xl mx-auto w-full">
          {error}
        </div>
      )}

      {/* Action button row */}
      <div className="flex flex-col md:flex-row items-center gap-6 border-t border-slate-850 pt-6">
        <div className="w-full md:w-auto flex items-center gap-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">🌐 Language:</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg px-4 py-2 outline-none text-xs transition-all font-semibold cursor-pointer"
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
          className="flex-1 w-full md:w-auto flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-lg shadow-lg shadow-emerald-500/25 transition-all"
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
        <div className="flex flex-col gap-6 mt-6 border-t border-slate-850 pt-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🌱</span> Your Personalised Guidance
            </h3>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={() => setShowRoadmap(!showRoadmap)}
                className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-xs font-bold transition-all duration-200 ${
                  showRoadmap
                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/40 shadow-sm'
                    : 'bg-slate-950 border-slate-850 hover:border-slate-750 text-slate-350 hover:text-white'
                }`}
              >
                <Map size={14} />
                {showRoadmap ? 'Hide Roadmap' : 'View Roadmap'}
              </button>
              <button
                onClick={handleClear}
                className="p-2 rounded-lg bg-slate-950 border border-slate-850 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-all duration-200"
                title="Clear results"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Roadmap visualizer */}
          {showRoadmap && milestones.length > 0 && (
            <div className="bg-slate-950 border border-slate-850 rounded-2xl p-6 flex flex-col gap-6 shadow-inner animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="text-xl">🗺️</span>
                <div>
                  <h4 className="text-sm font-bold text-white">Visual Career Roadmap</h4>
                  <p className="text-[10px] text-slate-400">Chronological step-by-step career milestone timeline</p>
                </div>
              </div>
              
              <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800 flex gap-4 pr-4">
                {milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center shrink-0">
                    <div className="w-[200px] bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 relative hover:border-slate-700 transition-all">
                      <div
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded w-fit"
                        style={{ backgroundColor: `${m.color}15`, color: m.color, border: `1px solid ${m.color}25` }}
                      >
                        {m.label}
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="text-lg mt-0.5">{m.icon}</span>
                        <div className="text-xs font-semibold text-slate-200 leading-normal line-clamp-3">
                          {m.title}
                        </div>
                      </div>
                    </div>
                    {idx < milestones.length - 1 && (
                      <ArrowRight size={18} className="text-slate-700 shrink-0 mx-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Markdown advice display */}
          <div className="p-8 bg-slate-900/60 border border-slate-850 rounded-2xl text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
            {result}
          </div>
        </div>
      )}
    </div>
  );
}
