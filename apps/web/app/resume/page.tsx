'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Sparkles, Download, RefreshCw, Trash2, ChevronDown, Check } from 'lucide-react';

const QUALIFICATIONS = {
  '🏫 Class 10 (SSC/CBSE/ICSE)': '10th',
  '📘 Class 12 / Intermediate': '12th',
  '🎓 Diploma (Polytechnic)': 'diploma',
  '🎓 Bachelor\'s Degree (B.Tech / B.Sc / BA / B.Com)': 'bachelors',
  '📚 Master\'s Degree (M.Tech / MBA / MCA / M.Sc)': 'masters',
  '🛠 ITI / Vocational Course': 'iti',
  '📜 Other / Self-taught / Bootcamp': 'other',
};

export default function ResumeBuilderPage() {
  const router = useRouter();
  
  // General info state variables
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [resumeEmail, setResumeEmail] = useState('');
  const [resumeLocation, setResumeLocation] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [skills, setSkills] = useState('');
  const [languages, setLanguages] = useState('');
  const [achievements, setAchievements] = useState('');
  const [hobbies, setHobbies] = useState('');
  const [eduLevel, setEduLevel] = useState('🏫 Class 10 (SSC/CBSE/ICSE)');

  // Dynamic qualification-specific state
  const [board, setBoard] = useState('');
  const [school, setSchool] = useState('');
  const [year, setYear] = useState('');
  const [pct, setPct] = useState('');
  const [activities, setActivities] = useState('');
  
  // 12th & Degree College/Stream
  const [college, setCollege] = useState('');
  const [stream, setStream] = useState('');
  
  // Diploma / ITI / Higher
  const [branch, setBranch] = useState('');
  const [trade, setTrade] = useState('');
  const [institute, setInstitute] = useState('');
  const [grade, setGrade] = useState('');
  const [apprenticeship, setApprenticeship] = useState('');
  
  // High Education / Other
  const [degree, setDegree] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [projects, setProjects] = useState('');
  const [internships, setInternships] = useState('');
  const [certs, setCerts] = useState('');
  const [course, setCourse] = useState('');
  const [duration, setDuration] = useState('');

  const [loading, setLoading] = useState(false);
  const [resumeResult, setResumeResult] = useState('');
  const [error, setError] = useState('');

  const activeLevel = QUALIFICATIONS[eduLevel as keyof typeof QUALIFICATIONS] || 'other';

  const compileEducationString = () => {
    switch (activeLevel) {
      case '10th':
        return `10th Standard: Board - ${board}, School - ${school}, Year - ${year}, Marks - ${pct}. Extracurriculars: ${activities}`;
      case '12th':
        return `12th Standard (${stream}): Board - ${board}, College - ${college}, Year - ${year}, Marks - ${pct}. Achievements: ${activities}`;
      case 'diploma':
        return `Diploma in ${branch}: College - ${college}, Year - ${year}, Marks - ${pct}. Projects: ${projects}`;
      case 'iti':
        return `ITI in ${trade}: Institute - ${institute}, Year - ${year}, Grade - ${grade}. Apprenticeship: ${apprenticeship}`;
      case 'bachelors':
      case 'masters':
        return `${degree}: College - ${college}, Year - ${year}, CGPA - ${cgpa}. Projects: ${projects}. Internships: ${internships}. Certifications: ${certs}`;
      default:
        return `Course - ${course}, Duration - ${duration}. Projects: ${projects}`;
    }
  };

  const handleBuild = async () => {
    if (!name.trim() || !targetRole.trim()) {
      setError('Please fill in Name and Target Role to build your resume.');
      return;
    }

    setError('');
    setLoading(true);
    setResumeResult('');

    const education = compileEducationString();
    const compiledProjects = projects || (activeLevel === 'diploma' || activeLevel === 'other' ? projects : '');

    try {
      const resp = await fetch('http://localhost:8000/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          target_role: targetRole,
          target_company: targetCompany,
          education_level: activeLevel,
          phone,
          email: resumeEmail,
          location: resumeLocation,
          linkedin,
          skills,
          languages,
          achievements,
          hobbies,
          education,
          projects: compiledProjects
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Build failed.');
      }

      setResumeResult(data.resume);

      // Save to user history database
      const user = localStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        if (parsedUser.id !== null) {
          await fetch('http://localhost:8000/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              actionType: 'resume',
              title: `Resume - ${targetRole} (${targetCompany || 'General'})`,
              payload: {
                name,
                target_role: targetRole,
                target_company: targetCompany,
                skills,
              },
              result: data.resume,
            }),
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const resp = await fetch('http://localhost:8000/resume/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: resumeResult,
          name,
          phone,
          email: resumeEmail,
          location: resumeLocation,
          linkedin,
        }),
      });

      if (!resp.ok) throw new Error('PDF generation failed');

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name.replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF. Make sure reportlab is installed.');
    }
  };

  const handleClear = () => {
    setResumeResult('');
  };

  return (
    <div className="flex flex-col gap-10 max-w-5xl mx-auto py-4">
      {/* Header section */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 text-2xl">
          📝
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Resume Builder</h1>
          <p className="text-slate-400 text-sm">
            Create ATS-compliant plaintext resumes and export print-ready ReportLab PDFs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Input parameters form */}
        <div className="md:col-span-2 flex flex-col gap-6 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md">
          <h3 className="text-md font-bold text-white flex items-center gap-1.5 border-b border-slate-850 pb-3">
            📋 Basic Candidate Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ravi Kumar"
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Job Role</label>
              <input
                type="text"
                required
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Software Engineer, Welder, Clerk"
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Company (optional)</label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g. TCS, Tata Motors, SBI"
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={resumeEmail}
                onChange={(e) => setResumeEmail(e.target.value)}
                placeholder="you@gmail.com"
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">City / Location</label>
              <input
                type="text"
                value={resumeLocation}
                onChange={(e) => setResumeLocation(e.target.value)}
                placeholder="e.g. Guntur, AP"
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">LinkedIn / GitHub Links</label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="linkedin.com/in/name"
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div className="border-t border-slate-850 my-2" />

          {/* Education parameters section */}
          <h3 className="text-md font-bold text-white flex items-center gap-1.5">
            🎓 Education Details
          </h3>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Highest Qualification</label>
            <select
              value={eduLevel}
              onChange={(e) => setEduLevel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all cursor-pointer font-semibold"
            >
              {Object.keys(QUALIFICATIONS).map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          {/* Qualification level specific dynamic inputs */}
          {activeLevel === '10th' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="📋 Board (e.g. CBSE, State Board)"
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
                <input
                  type="text"
                  placeholder="🏫 School Name"
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="📅 Completion Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
                <input
                  type="text"
                  placeholder="📊 Percentage / CGPA"
                  value={pct}
                  onChange={(e) => setPct(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
              </div>
              <textarea
                placeholder="🌟 Extracurriculars / Sports / NCC (optional)"
                rows={2}
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all resize-none"
              />
            </div>
          )}

          {activeLevel === '12th' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="📋 Board (e.g. CBSE, State Board)"
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
                <input
                  type="text"
                  placeholder="🏫 College Name"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={stream}
                  onChange={(e) => setStream(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-xs transition-all cursor-pointer font-semibold"
                >
                  <option value="MPC">MPC</option>
                  <option value="BiPC">BiPC</option>
                  <option value="MEC">MEC</option>
                  <option value="HEC">HEC</option>
                  <option value="CEC">CEC</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="📅 Completion Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
                <input
                  type="text"
                  placeholder="📊 Percentage / CGPA"
                  value={pct}
                  onChange={(e) => setPct(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
              </div>
              <textarea
                placeholder="🌟 Achievements / Competitions / Ranks (optional)"
                rows={2}
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all resize-none"
              />
            </div>
          )}

          {activeLevel === 'diploma' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="🔧 Branch (e.g. Mechanical, Civil, CSE)"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
                <input
                  type="text"
                  placeholder="🏫 Polytechnic / College Name"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="📅 Completion Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
                <input
                  type="text"
                  placeholder="📊 Percentage"
                  value={pct}
                  onChange={(e) => setPct(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
              </div>
              <textarea
                placeholder="💼 Projects (Title — description of what you built)"
                rows={2}
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
                className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all resize-none"
              />
            </div>
          )}

          {activeLevel === 'iti' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="🔧 Trade (e.g. Electrician, Fitter, COPA)"
                  value={trade}
                  onChange={(e) => setTrade(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
                <input
                  type="text"
                  placeholder="🏫 Institute Name"
                  value={institute}
                  onChange={(e) => setInstitute(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="📅 Completion Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
                <input
                  type="text"
                  placeholder="📊 Grade / % (e.g. A, 78%)"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
              </div>
              <input
                type="text"
                placeholder="🏭 Apprenticeship Details (e.g. Railways Fitter, 1 Year)"
                value={apprenticeship}
                onChange={(e) => setApprenticeship(e.target.value)}
                className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>
          )}

          {(activeLevel === 'bachelors' || activeLevel === 'masters') && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="🎓 Degree & Branch (e.g. B.Tech CSE, MBA Finance)"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
                <input
                  type="text"
                  placeholder="🏫 College / University Name"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="📅 Completion Year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
                <input
                  type="text"
                  placeholder="📊 CGPA / Percentage"
                  value={cgpa}
                  onChange={(e) => setCgpa(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
              </div>
              <textarea
                placeholder="💼 Projects built (Title — Stack — Details, one per line)"
                rows={2}
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
                className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all resize-none"
              />
              <textarea
                placeholder="🏢 Internships / Experience (Company — Role — Duration)"
                rows={2}
                value={internships}
                onChange={(e) => setInternships(e.target.value)}
                className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all resize-none"
              />
              <input
                type="text"
                placeholder="📜 Certifications (e.g. AWS Cloud, NPTEL Programming)"
                value={certs}
                onChange={(e) => setCerts(e.target.value)}
                className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>
          )}

          {activeLevel === 'other' && (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="📜 Course Name"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
                <input
                  type="text"
                  placeholder="⏱ Duration (e.g. 6 months)"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
                />
              </div>
              <textarea
                placeholder="💼 Projects built"
                rows={2}
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
                className="bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all resize-none"
              />
            </div>
          )}

          <div className="border-t border-slate-850 my-2" />

          {/* Section details */}
          <h3 className="text-md font-bold text-white flex items-center gap-1.5">
            🛠 Skills, Languages, Achievements & Hobbies
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">🛠 Key Skills (comma-separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Python, SQL, Excel, Communication"
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">🗣 Languages known</label>
              <input
                type="text"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                placeholder="e.g. English, Telugu, Hindi"
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">🏆 Key Achievements / Ranks</label>
              <input
                type="text"
                value={achievements}
                onChange={(e) => setAchievements(e.target.value)}
                placeholder="e.g. IIT-JEE rank 1450, Hackathon finalist"
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">🎯 Hobbies / Personal Interests</label>
              <input
                type="text"
                value={hobbies}
                onChange={(e) => setHobbies(e.target.value)}
                placeholder="e.g. Cricket, Chess, Blogging"
                className="w-full bg-slate-950 border border-slate-850 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* Informative tips column */}
        <div className="flex flex-col gap-4">
          <h3 className="text-md font-bold text-white flex items-center gap-1.5">
            💡 Pro Resume Tips
          </h3>
          <div className="p-5 bg-slate-900/60 border border-slate-850 rounded-xl flex flex-col gap-4">
            <div className="flex gap-2">
              <span className="text-emerald-400 font-bold">1.</span>
              <p className="text-xs text-slate-400 leading-normal">
                Make sure you align the **Target Role** exactly to the job description you are applying for.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-400 font-bold">2.</span>
              <p className="text-xs text-slate-400 leading-normal">
                Include **comma-separated skills** (e.g. Python, Git) for maximum ATS scanner match efficiency.
              </p>
            </div>
            <div className="flex gap-2">
              <span className="text-emerald-400 font-bold">3.</span>
              <p className="text-xs text-slate-400 leading-normal">
                ReportLab exports use structured formatting. Keep text lengths truthful and concise.
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg font-medium text-center max-w-2xl mx-auto w-full">
          {error}
        </div>
      )}

      {/* Submit button row */}
      <div className="flex items-center gap-4 border-t border-slate-850 pt-6">
        <button
          onClick={handleBuild}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-lg shadow-lg shadow-emerald-500/25 transition-all"
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin" size={16} />
              Writing ATS-friendly resume...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate tailored resume
            </>
          )}
        </button>
      </div>

      {/* Generated resume code output result */}
      {resumeResult && (
        <div className="flex flex-col gap-6 mt-6 border-t border-slate-850 pt-10 animate-fadeIn">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📝</span> Your Tailored Resume
            </h3>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button
                onClick={handleDownloadPdf}
                className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.97] text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-500/25 transition-all"
              >
                <Download size={14} />
                Export ReportLab PDF
              </button>
              <button
                onClick={handleClear}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-850 hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-all duration-200"
                title="Clear results"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <pre className="p-8 bg-slate-950 border border-slate-850 rounded-2xl text-slate-350 text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto selection:bg-emerald-500/30">
            {resumeResult}
          </pre>
        </div>
      )}
    </div>
  );
}
