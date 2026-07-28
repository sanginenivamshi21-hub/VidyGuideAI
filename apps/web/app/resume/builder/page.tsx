'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Sparkles, Download, RefreshCw, Save, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import {
  ResumeData,
  ResumeTemplate,
  createEmptyResume,
  saveResume,
  loadResume,
} from '@/components/resume/types';
import PersonalInfoSection from '@/components/resume/PersonalInfoSection';
import EducationSection from '@/components/resume/EducationSection';
import ExperienceSection from '@/components/resume/ExperienceSection';
import SkillsSection from '@/components/resume/SkillsSection';
import ProjectsSection from '@/components/resume/ProjectsSection';
import CertificationsSection from '@/components/resume/CertificationsSection';
import AchievementsSection from '@/components/resume/AchievementsSection';
import LanguagesSection from '@/components/resume/LanguagesSection';
import SocialLinksSection from '@/components/resume/SocialLinksSection';
import TemplateSelector from '@/components/resume/TemplateSelector';
import ResumePreview from '@/components/resume/ResumePreview';

const AUTO_SAVE_DELAY = 2000;

export default function ResumeBuilderPage() {
  const router = useRouter();
  const [data, setData] = useState<ResumeData>(createEmptyResume);
  const [showPreview, setShowPreview] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const saved = loadResume();
    setData(saved);
  }, []);

  useEffect(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      saveResume(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, AUTO_SAVE_DELAY);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [data]);

  const updateData = useCallback((partial: Partial<ResumeData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleGenerate = async () => {
    const p = data.personalInfo;
    if (!p.fullName.trim() || !p.title.trim()) {
      setError('Please fill in your name and professional title.');
      return;
    }
    setError('');
    setGenerating(true);
    setGeneratedResume('');

    try {
      const skillsText = data.skills.map((s) => s.name).join(', ');
      const languagesText = data.languages.map((l) => l.name).join(', ');
      const educationText = data.education
        .map((e) => `${e.degree} at ${e.institution} (${e.startYear}-${e.endYear})`)
        .join('; ');
      const experienceText = data.experience
        .map((e) => `${e.role} at ${e.company} (${e.startDate}-${e.endDate}): ${e.description}`)
        .join('; ');
      const projectsText = data.projects
        .map((p) => `${p.title}: ${p.description} [${p.technologies}]`)
        .join('; ');
      const certsText = data.certifications
        .map((c) => `${c.name} - ${c.issuer}`)
        .join(', ');

      const resp = await fetch(`${API_BASE}/resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: p.fullName,
          target_role: p.title,
          target_company: '',
          education_level: 'other',
          phone: p.phone,
          email: p.email,
          location: p.location,
          linkedin: data.socialLinks.find((l) => l.platform === 'LinkedIn')?.url || '',
          skills: skillsText,
          languages: languagesText,
          achievements: data.achievements.map((a) => a.title).join(', '),
          hobbies: '',
          education: educationText,
          projects: projectsText + (certsText ? ' Certifications: ' + certsText : ''),
        }),
      });

      const result = await resp.json();
      if (!resp.ok) {
        throw new Error(result.message || 'Generation failed.');
      }
      setGeneratedResume(result.resume);

      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.id) {
          fetch(`${API_BASE}/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              actionType: 'resume',
              title: `Resume - ${p.title}`,
              payload: { name: p.fullName, target_role: p.title, skills: skillsText },
              result: result.resume,
            }),
          }).catch(() => {});
        }
      }
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = async () => {
    const p = data.personalInfo;
    try {
      const resp = await fetch(`${API_BASE}/resume/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          resume_text: generatedResume,
          name: p.fullName,
          phone: p.phone,
          email: p.email,
          location: p.location,
          linkedin: data.socialLinks.find((l) => l.platform === 'LinkedIn')?.url || '',
        }),
      });
      if (!resp.ok) throw new Error('PDF generation failed');
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${p.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to generate PDF. Make sure reportlab is installed.');
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push(ROUTES.RESUME)} className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={18} />
          </button>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Resume Builder</h1>
            <p className="text-slate-400 text-sm">Build, preview, and export your professional resume.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-emerald-400 flex items-center gap-1"><Save size={12} /> Saved</span>}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 text-sm font-bold rounded-lg hover:border-slate-700 transition-all"
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            {showPreview ? 'Hide Preview' : 'Live Preview'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8" style={{ gridTemplateColumns: showPreview ? '1fr 1fr' : '1fr' }}>
        {/* Builder Form */}
        <div className="flex flex-col gap-8">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-md flex flex-col gap-8">
            <PersonalInfoSection
              data={data.personalInfo}
              onChange={(personalInfo) => updateData({ personalInfo })}
            />

            <div className="border-t border-slate-800 pt-6">
              <EducationSection
                data={data.education}
                onChange={(education) => updateData({ education })}
              />
            </div>

            <div className="border-t border-slate-800 pt-6">
              <ExperienceSection
                data={data.experience}
                onChange={(experience) => updateData({ experience })}
              />
            </div>

            <div className="border-t border-slate-800 pt-6">
              <ProjectsSection
                data={data.projects}
                onChange={(projects) => updateData({ projects })}
              />
            </div>

            <div className="border-t border-slate-800 pt-6">
              <SkillsSection
                data={data.skills}
                onChange={(skills) => updateData({ skills })}
              />
            </div>

            <div className="border-t border-slate-800 pt-6">
              <CertificationsSection
                data={data.certifications}
                onChange={(certifications) => updateData({ certifications })}
              />
            </div>

            <div className="border-t border-slate-800 pt-6">
              <AchievementsSection
                data={data.achievements}
                onChange={(achievements) => updateData({ achievements })}
              />
            </div>

            <div className="border-t border-slate-800 pt-6">
              <LanguagesSection
                data={data.languages}
                onChange={(languages) => updateData({ languages })}
              />
            </div>

            <div className="border-t border-slate-800 pt-6">
              <SocialLinksSection
                data={data.socialLinks}
                onChange={(socialLinks) => updateData({ socialLinks })}
              />
            </div>

            <div className="border-t border-slate-800 pt-6">
              <TemplateSelector
                value={data.template}
                onChange={(template: ResumeTemplate) => updateData({ template })}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg font-medium text-center">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-lg shadow-lg shadow-emerald-500/25 transition-all"
            >
              {generating ? (
                <><RefreshCw className="animate-spin" size={16} /> Generating...</>
              ) : (
                <><Sparkles size={16} /> Generate Resume</>
              )}
            </button>
          </div>

          {/* Generated result */}
          {generatedResume && (
            <div className="flex flex-col gap-4 border-t border-slate-800 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Generated Resume</h3>
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all"
                >
                  <Download size={14} /> Export PDF
                </button>
              </div>
              <pre className="p-6 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
                {generatedResume}
              </pre>
            </div>
          )}
        </div>

        {/* Live Preview Panel */}
        {showPreview && (
          <div className="sticky top-8 self-start">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-sm font-bold text-white">Preview</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                  {data.template} template
                </span>
              </div>
              <div className="p-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
                <ResumePreview data={data} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
