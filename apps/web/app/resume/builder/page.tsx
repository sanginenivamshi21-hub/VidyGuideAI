'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useRouter } from 'next/navigation';
import { api, fetchWithAuth } from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import {
  ResumeData, ResumeTemplate,
  createEmptyResume, saveResume, loadResume,
  createEmptyEnhancedExperience, createEmptyEnhancedProject,
  createEmptyEducation, createEmptyCertification, createEmptyAchievement,
  createEmptyVolunteer, createEmptyPublication,
} from '@/components/resume/types';
import ResumePreview from '@/components/resume/ResumePreview';
import {
  ArrowLeft, ArrowRight, Check, Download, Sparkles, RefreshCw,
  Save, Eye, EyeOff, ZoomIn, ZoomOut, Palette, Type,
} from 'lucide-react';

const STEPS = [
  { id: 0, label: 'Target', short: 'Target' },
  { id: 1, label: 'Personal', short: 'Personal' },
  { id: 2, label: 'Education', short: 'Edu' },
  { id: 3, label: 'Experience', short: 'Exp' },
  { id: 4, label: 'Projects', short: 'Projects' },
  { id: 5, label: 'Skills', short: 'Skills' },
  { id: 6, label: 'Certifications', short: 'Certs' },
  { id: 7, label: 'Achievements', short: 'Awards' },
  { id: 8, label: 'Volunteer', short: 'Vol' },
  { id: 9, label: 'Publications', short: 'Pub' },
  { id: 10, label: 'Languages', short: 'Lang' },
  { id: 11, label: 'Review', short: 'Review' },
];

const EXPERIENCE_LEVELS = ['Fresher', 'Junior (1-2 years)', 'Mid-Level (3-5 years)', 'Senior (6-9 years)', 'Lead (10+ years)'];
const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Consulting', 'E-commerce', 'Manufacturing', 'Media', 'Telecom', 'Government', 'Other'];
const COUNTRIES = ['India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'Singapore', 'UAE', 'Other'];
const COLOR_THEMES_LIST = ['emerald', 'blue', 'purple', 'rose', 'amber', 'slate'];
const FONTS = [
  { value: 'sans', label: 'System Sans' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Monospace' },
];
const SKILL_CATEGORIES = [
  { key: 'programmingLanguages' as const, label: 'Programming Languages', placeholder: 'Python, JavaScript, TypeScript...' },
  { key: 'frameworks' as const, label: 'Frameworks', placeholder: 'React, NestJS, Django...' },
  { key: 'databases' as const, label: 'Databases', placeholder: 'PostgreSQL, MongoDB, Redis...' },
  { key: 'cloud' as const, label: 'Cloud & DevOps', placeholder: 'AWS, Docker, Kubernetes...' },
  { key: 'aiMl' as const, label: 'AI / ML', placeholder: 'TensorFlow, PyTorch, LLMs...' },
  { key: 'softSkills' as const, label: 'Soft Skills', placeholder: 'Leadership, Communication...' },
];

interface RoleConfig {
  suggestedSkills: Record<string, string[]>;
  techPlaceholder: string;
  projectTechHint: string;
  projectTypeHint: string;
  extraFields: { key: string; label: string; placeholder: string; icon: string }[];
}

const ROLE_CONFIGS: Record<string, RoleConfig> = {
  'software engineer': {
    suggestedSkills: {
      'Programming Languages': ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust'],
      'Frameworks': ['React', 'Next.js', 'Node.js', 'Express', 'Django', 'Spring Boot', 'Angular', 'Vue'],
      'Databases': ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Elasticsearch'],
      'Cloud & DevOps': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Nginx'],
      'AI / ML': ['LLMs', 'RAG', 'LangChain', 'OpenAI API', 'TensorFlow'],
      'Soft Skills': ['Problem Solving', 'Team Collaboration', 'Code Review', 'Agile', 'System Design'],
    },
    techPlaceholder: 'React, Node.js, PostgreSQL, AWS (comma-separated)',
    projectTechHint: 'React, TypeScript, Tailwind, PostgreSQL...',
    projectTypeHint: 'Full-stack web app / API / open-source library',
    extraFields: [
      { key: 'github', label: 'GitHub Profile', placeholder: 'github.com/username', icon: 'gh' },
      { key: 'leetcode', label: 'LeetCode / DSA Profile', placeholder: 'leetcode.com/u/username', icon: 'code' },
      { key: 'portfolio', label: 'Portfolio Website', placeholder: 'yourportfolio.dev', icon: 'web' },
    ],
  },
  'frontend developer': {
    suggestedSkills: {
      'Programming Languages': ['JavaScript', 'TypeScript', 'HTML', 'CSS'],
      'Frameworks': ['React', 'Next.js', 'Vue', 'Angular', 'Svelte', 'Tailwind CSS', 'Bootstrap'],
      'Databases': ['REST APIs', 'GraphQL'],
      'Cloud & DevOps': ['Vercel', 'Netlify', 'Firebase', 'AWS Amplify'],
      'AI / ML': ['OpenAI API', 'LangChain'],
      'Soft Skills': ['UI/UX Sensibility', 'Responsive Design', 'Accessibility', 'Cross-browser Compat', 'Performance Optimization'],
    },
    techPlaceholder: 'React, TypeScript, Tailwind, Vite (comma-separated)',
    projectTechHint: 'Next.js, Tailwind, Framer Motion...',
    projectTypeHint: 'Landing page / SPA / interactive dashboard',
    extraFields: [
      { key: 'github', label: 'GitHub Profile', placeholder: 'github.com/username', icon: 'gh' },
      { key: 'portfolio', label: 'Portfolio Website', placeholder: 'yourportfolio.dev', icon: 'web' },
      { key: 'dribbble', label: 'Dribbble / Design Portfolio', placeholder: 'dribbble.com/username', icon: 'palette' },
    ],
  },
  'backend developer': {
    suggestedSkills: {
      'Programming Languages': ['Python', 'Java', 'Go', 'Rust', 'C#', 'Ruby'],
      'Frameworks': ['Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'FastAPI', 'GraphQL'],
      'Databases': ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Kafka'],
      'Cloud & DevOps': ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Nginx', 'Linux'],
      'AI / ML': ['LLM APIs', 'RAG', 'Vector Databases'],
      'Soft Skills': ['System Design', 'API Design', 'Database Optimization', 'Microservices', 'Testing'],
    },
    techPlaceholder: 'Node.js, PostgreSQL, Redis, Docker, AWS (comma-separated)',
    projectTechHint: 'FastAPI, PostgreSQL, Redis, Docker...',
    projectTypeHint: 'REST API / microservice / ETL pipeline / CLI tool',
    extraFields: [
      { key: 'github', label: 'GitHub Profile', placeholder: 'github.com/username', icon: 'gh' },
      { key: 'leetcode', label: 'LeetCode / DSA Profile', placeholder: 'leetcode.com/u/username', icon: 'code' },
    ],
  },
  'data analyst': {
    suggestedSkills: {
      'Programming Languages': ['Python', 'SQL', 'R'],
      'Frameworks': ['Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'Plotly', 'Streamlit'],
      'Databases': ['MySQL', 'PostgreSQL', 'BigQuery', 'Snowflake'],
      'Cloud & DevOps': ['AWS', 'GCP'],
      'AI / ML': ['scikit-learn', 'Regression', 'Classification', 'Clustering'],
      'Soft Skills': ['Data Storytelling', 'Dashboard Design', 'Business Acumen', 'Statistical Analysis', 'Reporting'],
    },
    techPlaceholder: 'SQL, Python, Tableau, Excel, Power BI (comma-separated)',
    projectTechHint: 'Python, Pandas, Tableau, SQL...',
    projectTypeHint: 'Dashboard / analytics report / EDA notebook / data pipeline',
    extraFields: [
      { key: 'github', label: 'GitHub / Portfolio', placeholder: 'github.com/username', icon: 'gh' },
      { key: 'kaggle', label: 'Kaggle Profile', placeholder: 'kaggle.com/username', icon: 'award' },
    ],
  },
  'data scientist': {
    suggestedSkills: {
      'Programming Languages': ['Python', 'R', 'SQL'],
      'Frameworks': ['Pandas', 'NumPy', 'scikit-learn', 'PyTorch', 'TensorFlow', 'Hugging Face'],
      'Databases': ['PostgreSQL', 'BigQuery', 'Snowflake'],
      'Cloud & DevOps': ['AWS SageMaker', 'GCP Vertex AI', 'Docker'],
      'AI / ML': ['Deep Learning', 'NLP', 'Computer Vision', 'LLMs', 'RAG', 'XGBoost'],
      'Soft Skills': ['Experimental Design', 'A/B Testing', 'Research', 'Data Visualization', 'Scientific Writing'],
    },
    techPlaceholder: 'Python, PyTorch, scikit-learn, SQL, AWS (comma-separated)',
    projectTechHint: 'PyTorch, Hugging Face, Pandas, MLflow...',
    projectTypeHint: 'ML model / research paper reproduction / Kaggle competition',
    extraFields: [
      { key: 'github', label: 'GitHub / Research Code', placeholder: 'github.com/username', icon: 'gh' },
      { key: 'kaggle', label: 'Kaggle Profile', placeholder: 'kaggle.com/username', icon: 'award' },
      { key: 'scholar', label: 'Google Scholar / Publications', placeholder: 'scholar.google.com/...', icon: 'book' },
    ],
  },
  'devops engineer': {
    suggestedSkills: {
      'Programming Languages': ['Python', 'Go', 'Bash', 'Ruby'],
      'Frameworks': ['Terraform', 'Ansible', 'Pulumi', 'Helm'],
      'Databases': ['PostgreSQL', 'Redis', 'Elasticsearch'],
      'Cloud & DevOps': ['AWS', 'GCP', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Linux', 'Prometheus', 'Grafana'],
      'AI / ML': ['MLOps', 'Kubeflow', 'LLM Deployment'],
      'Soft Skills': ['Incident Response', 'System Reliability', 'Monitoring', 'Documentation', 'On-Call'],
    },
    techPlaceholder: 'Docker, Kubernetes, Terraform, AWS, CI/CD (comma-separated)',
    projectTechHint: 'Terraform, K8s, Helm, Prometheus, GitHub Actions...',
    projectTypeHint: 'Infra-as-code / monitoring stack / self-hosted service',
    extraFields: [
      { key: 'github', label: 'GitHub / Infra Repos', placeholder: 'github.com/username', icon: 'gh' },
      { key: 'dockerhub', label: 'Docker Hub', placeholder: 'hub.docker.com/u/username', icon: 'box' },
    ],
  },
  'ai engineer': {
    suggestedSkills: {
      'Programming Languages': ['Python', 'TypeScript', 'C++'],
      'Frameworks': ['PyTorch', 'TensorFlow', 'LangChain', 'LlamaIndex', 'Hugging Face', 'FastAPI'],
      'Databases': ['PostgreSQL', 'PgVector', 'ChromaDB', 'Pinecone', 'Weaviate'],
      'Cloud & DevOps': ['AWS', 'GCP', 'Docker', 'Kubernetes', 'MLflow'],
      'AI / ML': ['LLMs', 'RAG', 'Fine-tuning', 'RLHF', 'Embeddings', 'Vector DBs', 'Agents', 'Multimodal'],
      'Soft Skills': ['Prompt Engineering', 'Model Evaluation', 'Research Reading', 'Experiment Tracking'],
    },
    techPlaceholder: 'PyTorch, LangChain, RAG, Vector DBs, LLMs (comma-separated)',
    projectTechHint: 'LangChain, Hugging Face, RAG pipeline, PyTorch...',
    projectTypeHint: 'LLM app / RAG system / agent / fine-tuned model',
    extraFields: [
      { key: 'github', label: 'GitHub / Model Repos', placeholder: 'github.com/username', icon: 'gh' },
      { key: 'huggingface', label: 'Hugging Face Profile', placeholder: 'huggingface.co/username', icon: 'sparkles' },
      { key: 'arxiv', label: 'Papers / Publications', placeholder: 'arxiv.org/a/...', icon: 'book' },
    ],
  },
  'product manager': {
    suggestedSkills: {
      'Programming Languages': [],
      'Frameworks': ['JIRA', 'Confluence', 'Figma', 'Notion', 'Amplitude', 'Mixpanel'],
      'Databases': ['SQL'],
      'Cloud & DevOps': ['Agile', 'Scrum'],
      'AI / ML': ['AI Product Strategy', 'Prompt Engineering'],
      'Soft Skills': ['Product Strategy', 'Roadmapping', 'User Research', 'A/B Testing', 'Stakeholder Mgmt', 'Data-Driven Decision Making'],
    },
    techPlaceholder: 'JIRA, SQL, Figma, Amplitude, Notion (comma-separated)',
    projectTechHint: 'Product spec / PRD / user research / A/B test analysis',
    projectTypeHint: 'Product launch / feature rollout / user research study',
    extraFields: [
      { key: 'linkedin', label: 'LinkedIn', placeholder: 'linkedin.com/in/username', icon: 'in' },
      { key: 'portfolio', label: 'Product Portfolio', placeholder: 'yourportfolio.dev', icon: 'web' },
    ],
  },
};

const AUTO_SAVE_DELAY = 2000;

export default function ResumeBuilderPage() {
  const router = useRouter();
  const [data, setData] = useState<ResumeData>(createEmptyResume);
  const [step, setStep] = useState(0);
  const [showPreview, setShowPreview] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedResume, setGeneratedResume] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [zoom, setZoom] = useState(0.75);
  const [validatingRole, setValidatingRole] = useState(false);
  const [roleSuggestions, setRoleSuggestions] = useState<string[]>([]);
  const [roleInvalid, setRoleInvalid] = useState(false);
  const [showQualityCheck, setShowQualityCheck] = useState(false);
  const [qualityChecks, setQualityChecks] = useState<{ pass: boolean; label: string }[]>([]);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const currentRoleKey = data.target.role?.toLowerCase().trim() || '';
  const currentRoleConfig = ROLE_CONFIGS[currentRoleKey] || null;

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
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [data]);

  const updateData = useCallback((partial: Partial<ResumeData>) => {
    setData(prev => ({ ...prev, ...partial }));
  }, []);

  const validateRole = useCallback(async (role: string) => {
    if (!role.trim()) { setRoleSuggestions([]); setRoleInvalid(false); return; }
    setValidatingRole(true);
    try {
      const result = await api('/resume/validate-role', {
        method: 'POST',
        body: { role },
      });
      if (result.valid) {
        setRoleSuggestions(result.suggestions || []);
        setRoleInvalid(false);
        setData(prev => ({ ...prev, target: { ...prev.target, role: result.role } }));
      } else {
        setRoleInvalid(true);
        setRoleSuggestions(result.suggestions || []);
      }
    } catch {
      setRoleInvalid(false);
      setRoleSuggestions([]);
    } finally {
      setValidatingRole(false);
    }
  }, []);

  const runQualityChecks = useCallback(() => {
    const checks: { pass: boolean; label: string }[] = [];
    checks.push({ pass: !!data.personalInfo.email, label: 'Email address provided' });
    checks.push({ pass: !!data.personalInfo.phone, label: 'Phone number provided' });
    checks.push({ pass: !!data.target.role, label: 'Target role selected' });
    checks.push({ pass: !!(data.personalInfo.summary && data.personalInfo.summary.length > 20), label: 'Professional summary is substantial' });
    checks.push({ pass: data.experience.length > 0 || data.projects.length > 0, label: 'At least one experience or project entry' });
    checks.push({ pass: data.education.length > 0, label: 'Education section filled' });
    checks.push({ pass: data.skills.length > 0, label: 'Skills section filled' });
    checks.push({ pass: data.experience.every(e => !e.description || e.description.length > 10), label: 'Experience descriptions have sufficient detail' });
    checks.push({ pass: !data.personalInfo.summary || data.personalInfo.summary.length <= 150, label: 'Summary is concise (under 150 chars)' });
    checks.push({ pass: data.experience.length <= 5, label: 'At most 5 experience entries (focused resume)' });
    setQualityChecks(checks);
    setShowQualityCheck(true);
    return checks.filter(c => c.pass).length >= 6;
  }, [data]);

  const handleGenerate = async () => {
    if (!runQualityChecks()) { return; }
    setError('');
    setGenerating(true);
    setGeneratedResume('');

    try {
      const dataToSend = {
        name: data.personalInfo.fullName,
        target_role: data.target.role,
        industry: data.target.industry,
        experience_level: data.target.experienceLevel,
        country: data.target.country,
        phone: data.personalInfo.phone,
        email: data.personalInfo.email,
        location: data.personalInfo.location,
        linkedin: data.socialLinks.find(l => l.platform === 'LinkedIn')?.url || '',
        github: data.socialLinks.find(l => l.platform === 'GitHub')?.url || '',
        portfolio: data.socialLinks.find(l => l.platform === 'Portfolio')?.url || '',
        summary: data.personalInfo.summary,
        skills: data.skills.map(s => s.name).join(', '),
        programming_languages: data.skills.filter(s => s.category === 'Programming Languages' || s.category === 'Languages').map(s => s.name).join(', '),
        frameworks: data.skills.filter(s => s.category === 'Frameworks' || s.category === 'Frontend' || s.category === 'Backend').map(s => s.name).join(', '),
        databases: data.skills.filter(s => s.category === 'Databases' || s.category === 'Database').map(s => s.name).join(', '),
        cloud: data.skills.filter(s => s.category === 'Cloud' || s.category === 'DevOps').map(s => s.name).join(', '),
        ai_ml: data.skills.filter(s => s.category === 'AI/ML' || s.category === 'AI / ML').map(s => s.name).join(', '),
        soft_skills: data.skills.filter(s => s.category === 'Soft Skills').map(s => s.name).join(', '),
        languages: data.languages.map(l => `${l.name} (${l.proficiency})`).join(', '),
        achievements: data.achievements.map(a => `${a.title}${a.description ? ': ' + a.description : ''}`).join('; '),
        interests: data.interests.join(', '),
        education: data.education.map(e => `${e.degree} at ${e.institution}, ${e.field ? e.field + ', ' : ''}${e.startYear}-${e.endYear}${e.grade ? ', Grade: ' + e.grade : ''}`).join(' | '),
        experience: data.experience.map(e => `${e.role} at ${e.company} (${e.startDate}-${e.current ? 'Present' : e.endDate}): ${e.description}${(e as any).achievements ? ' Achievements: ' + (e as any).achievements : ''}${(e as any).technologies ? ' Tech: ' + (e as any).technologies : ''}`).join(' | '),
        projects: data.projects.map(p => `${p.title}: ${p.description} [${p.technologies}]${(p as any).techStack ? ' Stack: ' + (p as any).techStack : ''}${(p as any).results ? ' Results: ' + (p as any).results : ''}`).join(' | '),
        certifications: data.certifications.map(c => `${c.name} - ${c.issuer}${c.date ? ' (' + c.date + ')' : ''}`).join(', '),
      };

      const result = await api('/resume', {
        method: 'POST',
        body: dataToSend,
      });
      setGeneratedResume(result.resume);

      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.id) {
          api('/history', {
            method: 'POST',
            body: {
              actionType: 'resume',
              title: `Resume - ${data.target.role}`,
              payload: { name: data.personalInfo.fullName, target_role: data.target.role },
              result: result.resume,
            },
          }).catch(() => {});
        }
      }
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally {
      setGenerating(false);
      setShowQualityCheck(false);
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const resp = await fetchWithAuth('/resume/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: generatedResume,
          name: data.personalInfo.fullName,
          phone: data.personalInfo.phone,
          email: data.personalInfo.email,
          location: data.personalInfo.location,
          linkedin: data.socialLinks.find(l => l.platform === 'LinkedIn')?.url || '',
        }),
      });
      if (!resp.ok) throw new Error('PDF generation failed');
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.personalInfo.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to generate PDF. Make sure reportlab is installed.');
    }
  };

  const completedFields = [
    data.target.role, data.target.industry, data.target.experienceLevel, data.target.country,
    data.personalInfo.fullName, data.personalInfo.email,
    data.education.length > 0 ? 'x' : '',
    data.experience.length > 0 ? 'x' : '',
    data.projects.length > 0 ? 'x' : '',
    data.skills.length > 0 ? 'x' : '',
    data.certifications.length > 0 ? 'x' : '',
    data.achievements.length > 0 ? 'x' : '',
    data.languages.length > 0 ? 'x' : '',
  ].filter(Boolean).length;
  const totalFields = 14;
  const progress = Math.round((completedFields / totalFields) * 100);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8">
        <div className="flex items-center justify-between h-14 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push(ROUTES.RESUME)} className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-lg font-bold text-white hidden sm:block">Resume Builder</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">{progress}%</span>
            </div>
            {saved && <span className="text-[10px] text-emerald-400 flex items-center gap-1"><Save size={10} /> Saved</span>}
            <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
              <button onClick={() => setZoom(z => Math.max(0.4, z - 0.1))} className="p-1 text-slate-500 hover:text-white"><ZoomOut size={14} /></button>
              <span className="text-[10px] text-slate-400 w-8 text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom(z => Math.min(1.2, z + 0.1))} className="p-1 text-slate-500 hover:text-white"><ZoomIn size={14} /></button>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold rounded-lg hover:border-slate-700 transition-all"
            >
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              <span className="hidden sm:inline">{showPreview ? 'Hide' : 'Preview'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="sticky top-14 z-20 bg-slate-950/60 backdrop-blur-md border-b border-slate-800/50 overflow-x-auto">
        <div className="flex max-w-7xl mx-auto px-4 lg:px-8">
          {STEPS.map(s => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                step === s.id
                  ? 'border-emerald-500 text-emerald-400'
                  : step > s.id
                  ? 'border-transparent text-emerald-500/60 hover:text-slate-300'
                  : 'border-transparent text-slate-600 hover:text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                step === s.id ? 'bg-emerald-500 text-white' :
                step > s.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                'bg-slate-800 text-slate-500'
              }`}>
                {step > s.id ? <Check size={10} /> : s.id + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.short}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-6">
        <div className={`grid gap-6 ${showPreview ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
          {/* Form */}
          <div className="order-2 lg:order-1">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur-md min-h-[400px]">
              {step === 0 && <TargetStep data={data} updateData={updateData} validateRole={validateRole} validatingRole={validatingRole} roleSuggestions={roleSuggestions} roleInvalid={roleInvalid} setRoleSuggestions={setRoleSuggestions} setRoleInvalid={setRoleInvalid} roleConfig={currentRoleConfig} />}
              {step === 1 && <PersonalStep data={data} updateData={updateData} />}
              {step === 2 && <EducationStep data={data} updateData={updateData} />}
              {step === 3 && <ExperienceStep data={data} updateData={updateData} roleConfig={currentRoleConfig} />}
              {step === 4 && <ProjectsStep data={data} updateData={updateData} roleConfig={currentRoleConfig} />}
              {step === 5 && <SkillsStep data={data} updateData={updateData} roleConfig={currentRoleConfig} />}
              {step === 6 && <CertificationsStep data={data} updateData={updateData} />}
              {step === 7 && <AchievementsStep data={data} updateData={updateData} />}
              {step === 8 && <VolunteerStep data={data} updateData={updateData} />}
              {step === 9 && <PublicationsStep data={data} updateData={updateData} />}
              {step === 10 && <LanguagesStep data={data} updateData={updateData} />}
              {step === 11 && <ReviewStep data={data} generatedResume={generatedResume} error={error} handleGenerate={handleGenerate} handleDownloadPdf={handleDownloadPdf} generating={generating} qualityChecks={qualityChecks} showQualityCheck={showQualityCheck} setShowQualityCheck={setShowQualityCheck} runQualityChecks={runQualityChecks} />}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setStep(s => Math.max(0, s - 1))}
                disabled={step === 0}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 text-sm font-bold rounded-xl disabled:opacity-30 disabled:pointer-events-none hover:border-slate-700 transition-all"
              >
                <ArrowLeft size={16} /> Back
              </button>
              <div className="flex items-center gap-2">
                {step < 11 && (
                  <button
                    onClick={() => setStep(s => Math.min(11, s + 1))}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    Next <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Preview panel */}
          {showPreview && (
            <div className="order-1 lg:order-2 lg:sticky lg:top-36 lg:self-start">
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md">
                <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-white flex items-center gap-2">
                    <Eye size={14} className="text-emerald-400" />
                    Live Preview
                  </span>
                  <div className="flex items-center gap-2">
                    <select
                      value={data.template}
                      onChange={(e) => updateData({ template: e.target.value as ResumeTemplate })}
                      className="bg-slate-950 border border-slate-800 text-white text-[10px] rounded-lg px-2 py-1 outline-none"
                    >
                      <option value="professional">Professional</option>
                      <option value="modern">Modern</option>
                      <option value="minimal">Minimal</option>
                      <option value="google">Google</option>
                      <option value="microsoft">Microsoft</option>
                    </select>
                    <select
                      value={data.colorTheme}
                      onChange={(e) => updateData({ colorTheme: e.target.value })}
                      className="bg-slate-950 border border-slate-800 text-white text-[10px] rounded-lg px-2 py-1 outline-none"
                    >
                      {COLOR_THEMES_LIST.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="p-4 max-h-[calc(100vh-15rem)] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                  <ResumePreview data={data} zoom={zoom} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quality check modal */}
      {showQualityCheck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowQualityCheck(false)}>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-4">Resume Quality Check</h3>
            <div className="flex flex-col gap-2 mb-5">
              {qualityChecks.map((c, i) => (
                <div key={i} className={`flex items-center gap-2.5 p-2.5 rounded-lg text-xs ${
                  c.pass ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'
                }`}>
                  {c.pass ? <Check size={14} className="text-emerald-400 shrink-0" /> : <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 shrink-0" />}
                  {c.label}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{qualityChecks.filter(c => c.pass).length}/{qualityChecks.length} passed</span>
              <button
                onClick={() => {
                  if (qualityChecks.filter(c => c.pass).length >= 6) {
                    setShowQualityCheck(false);
                    handleGenerate();
                  } else {
                    setShowQualityCheck(false);
                  }
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all"
              >
                {qualityChecks.filter(c => c.pass).length >= 6 ? 'Proceed to Generate' : 'Go Back'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== STEP COMPONENTS ===================== */

function TargetStep({ data, updateData, validateRole, validatingRole, roleSuggestions, roleInvalid, setRoleSuggestions, setRoleInvalid, roleConfig }: any) {
  const [roleInput, setRoleInput] = useState(data.target.role || '');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (roleInput.trim()) validateRole(roleInput);
      else { setRoleSuggestions([]); setRoleInvalid(false); }
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [roleInput]);

  return (
    <div className="flex flex-col gap-5 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400"><Sparkles size={20} /></div>
        <h2 className="text-xl font-bold text-white">Target Job</h2>
      </div>
      <p className="text-xs text-slate-400 -mt-3">Define the role you want your resume tailored for.</p>
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Job Role *</label>
        <input
          value={roleInput}
          onChange={e => { setRoleInput(e.target.value); updateData({ target: { ...data.target, role: e.target.value } }); }}
          placeholder="e.g. Frontend Developer, Data Analyst"
          className={`w-full bg-slate-950 border ${roleInvalid ? 'border-red-500' : roleInput && !roleInvalid ? 'border-emerald-500' : 'border-slate-800'} hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm transition-all`}
        />
        {validatingRole && <p className="text-[10px] text-slate-500"><RefreshCw size={10} className="inline animate-spin mr-1" />Validating role...</p>}
        {roleInvalid && roleSuggestions.length > 0 && (
          <div className="flex flex-col gap-1.5 mt-1">
            <p className="text-[10px] text-amber-400 font-semibold">Role not recognized. Did you mean:</p>
            <div className="flex flex-wrap gap-2">
              {roleSuggestions.map((s: string, i: number) => (
                <button
                  key={i}
                  onClick={() => { setRoleInput(s); updateData({ target: { ...data.target, role: s } }); setRoleInvalid(false); setRoleSuggestions([]); }}
                  className="px-3 py-1.5 bg-slate-800 border border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-emerald-400 text-xs rounded-lg transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Industry</label>
          <select value={data.target.industry} onChange={e => updateData({ target: { ...data.target, industry: e.target.value } })} className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm">
            <option value="">Select...</option>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Experience Level</label>
          <select value={data.target.experienceLevel} onChange={e => updateData({ target: { ...data.target, experienceLevel: e.target.value } })} className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm">
            <option value="">Select...</option>
            {EXPERIENCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Country</label>
          <select value={data.target.country} onChange={e => updateData({ target: { ...data.target, country: e.target.value } })} className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm">
            <option value="">Select...</option>
            {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {roleConfig && roleInput && !roleInvalid && (
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-3">Role-Specific Profiles</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roleConfig.extraFields.map((field: any) => (
              <div key={field.key} className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3">
                <span className="text-[10px] text-emerald-400 font-bold shrink-0">{field.icon}</span>
                <input
                  value={data.socialLinks.find((l: any) => l.platform === field.label)?.url || ''}
                  onChange={e => {
                    const existing = data.socialLinks.find((l: any) => l.platform === field.label);
                    const updated = existing
                      ? data.socialLinks.map((l: any) => l.platform === field.label ? { ...l, url: e.target.value } : l)
                      : [...data.socialLinks, { id: crypto.randomUUID(), platform: field.label, url: e.target.value }];
                    updateData({ socialLinks: updated });
                  }}
                  placeholder={field.placeholder}
                  className="w-full bg-transparent text-white py-3 outline-none text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PersonalStep({ data, updateData }: any) {
  return (
    <div className="flex flex-col gap-5 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400"><Eye size={20} /></div>
        <h2 className="text-xl font-bold text-white">Personal Details</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name *" value={data.personalInfo.fullName} onChange={v => updateData({ personalInfo: { ...data.personalInfo, fullName: v } })} placeholder="Ravi Kumar" />
        <Field label="Professional Title" value={data.personalInfo.title} onChange={v => updateData({ personalInfo: { ...data.personalInfo, title: v } })} placeholder="Software Engineer" />
        <Field label="Email *" type="email" value={data.personalInfo.email} onChange={v => updateData({ personalInfo: { ...data.personalInfo, email: v } })} placeholder="you@example.com" />
        <Field label="Phone" value={data.personalInfo.phone} onChange={v => updateData({ personalInfo: { ...data.personalInfo, phone: v } })} placeholder="+91 98765 43210" />
        <Field label="Location" value={data.personalInfo.location} onChange={v => updateData({ personalInfo: { ...data.personalInfo, location: v } })} placeholder="Guntur, AP" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">LinkedIn / GitHub / Portfolio URLs</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3">
            <span className="text-[10px] text-blue-400 font-bold shrink-0">in</span>
            <input value={data.socialLinks.find((l: any) => l.platform === 'LinkedIn')?.url || ''} onChange={e => updateData({ socialLinks: upsertLink(data.socialLinks, 'LinkedIn', e.target.value) })} placeholder="linkedin.com/in/name" className="w-full bg-transparent text-white py-3 outline-none text-sm" />
          </div>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3">
            <span className="text-[10px] text-purple-400 font-bold shrink-0">gh</span>
            <input value={data.socialLinks.find((l: any) => l.platform === 'GitHub')?.url || ''} onChange={e => updateData({ socialLinks: upsertLink(data.socialLinks, 'GitHub', e.target.value) })} placeholder="github.com/name" className="w-full bg-transparent text-white py-3 outline-none text-sm" />
          </div>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3">
            <span className="text-[10px] text-emerald-400 font-bold shrink-0">web</span>
            <input value={data.socialLinks.find((l: any) => l.platform === 'Portfolio')?.url || ''} onChange={e => updateData({ socialLinks: upsertLink(data.socialLinks, 'Portfolio', e.target.value) })} placeholder="portfolio.dev" className="w-full bg-transparent text-white py-3 outline-none text-sm" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Professional Summary</label>
        <textarea
          value={data.personalInfo.summary}
          onChange={e => updateData({ personalInfo: { ...data.personalInfo, summary: e.target.value } })}
          placeholder="Write 2-3 sentences summarizing your experience, key skills, and career goals..."
          rows={4}
          className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm resize-none transition-all"
        />
        <span className="text-[10px] text-slate-500 text-right">{data.personalInfo.summary.length}/150 chars</span>
      </div>
    </div>
  );
}

function EducationStep({ data, updateData }: any) {
  const add = () => updateData({ education: [...data.education, createEmptyEducation()] });
  const update = (id: string, field: string, value: string) => updateData({ education: data.education.map((e: any) => e.id === id ? { ...e, [field]: value } : e) });
  const remove = (id: string) => updateData({ education: data.education.filter((e: any) => e.id !== id) });

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400"><Type size={20} /></div>
          <h2 className="text-xl font-bold text-white">Education</h2>
        </div>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-all"><span className="text-lg leading-none">+</span> Add</button>
      </div>
      {data.education.length === 0 && <p className="text-sm text-slate-500 italic py-8 text-center">No education entries. Click "Add" to begin.</p>}
      {data.education.map((item: any, idx: number) => (
        <div key={item.id} className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Entry {idx + 1}</span>
            <button onClick={() => remove(item.id)} className="p-1 text-slate-500 hover:text-red-400 transition-all"><span className="text-lg leading-none">&times;</span></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={item.degree} onChange={e => update(item.id, 'degree', e.target.value)} placeholder="Degree (e.g. B.Tech CSE)" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.institution} onChange={e => update(item.id, 'institution', e.target.value)} placeholder="Institution" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.field} onChange={e => update(item.id, 'field', e.target.value)} placeholder="Field / Branch" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.grade} onChange={e => update(item.id, 'grade', e.target.value)} placeholder="CGPA / Percentage" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={item.startYear} onChange={e => update(item.id, 'startYear', e.target.value)} placeholder="Start year" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.endYear} onChange={e => update(item.id, 'endYear', e.target.value)} placeholder="End year" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ExperienceStep({ data, updateData, roleConfig }: any) {
  const add = () => updateData({ experience: [...data.experience, createEmptyEnhancedExperience()] });
  const update = (id: string, field: string, value: any) => updateData({ experience: data.experience.map((e: any) => e.id === id ? { ...e, [field]: value } : e) });
  const remove = (id: string) => updateData({ experience: data.experience.filter((e: any) => e.id !== id) });

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400"><RefreshCw size={20} /></div>
          <h2 className="text-xl font-bold text-white">Experience</h2>
        </div>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-all"><span className="text-lg leading-none">+</span> Add</button>
      </div>
      {data.experience.length === 0 && <p className="text-sm text-slate-500 italic py-8 text-center">No experience yet (that's OK for freshers).</p>}
      {data.experience.map((item: any, idx: number) => (
        <div key={item.id} className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Entry {idx + 1}</span>
            <button onClick={() => remove(item.id)} className="p-1 text-slate-500 hover:text-red-400"><span className="text-lg leading-none">&times;</span></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={item.company} onChange={e => update(item.id, 'company', e.target.value)} placeholder="Company" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.role} onChange={e => update(item.id, 'role', e.target.value)} placeholder="Position / Role" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.location} onChange={e => update(item.id, 'location', e.target.value)} placeholder="Location" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <div className="flex gap-2 items-center">
              <input value={item.startDate} onChange={e => update(item.id, 'startDate', e.target.value)} placeholder="Start" className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
              {!item.current && <input value={item.endDate} onChange={e => update(item.id, 'endDate', e.target.value)} placeholder="End" className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input type="checkbox" checked={item.current} onChange={e => update(item.id, 'current', e.target.checked)} className="accent-emerald-500" />
            Currently work here
          </label>
          <textarea value={item.description} onChange={e => update(item.id, 'description', e.target.value)} placeholder="Describe your role, responsibilities, and impact. Use strong action verbs and quantify results where possible." rows={3} className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm resize-none" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={item.achievements} onChange={e => update(item.id, 'achievements', e.target.value)} placeholder="Key achievements (comma-separated)" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.technologies} onChange={e => update(item.id, 'technologies', e.target.value)} placeholder={roleConfig?.techPlaceholder || 'Technologies used'} className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsStep({ data, updateData, roleConfig }: any) {
  const add = () => updateData({ projects: [...data.projects, createEmptyEnhancedProject()] });
  const update = (id: string, field: string, value: string) => updateData({ projects: data.projects.map((p: any) => p.id === id ? { ...p, [field]: value } : p) });
  const remove = (id: string) => updateData({ projects: data.projects.filter((p: any) => p.id !== id) });

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-cyan-400"><Sparkles size={20} /></div>
          <h2 className="text-xl font-bold text-white">Projects</h2>
        </div>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-all"><span className="text-lg leading-none">+</span> Add</button>
      </div>
      {data.projects.length === 0 && <p className="text-sm text-slate-500 italic py-8 text-center">Add projects to showcase your practical experience.</p>}
      {data.projects.map((item: any, idx: number) => (
        <div key={item.id} className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Project {idx + 1}</span>
            <button onClick={() => remove(item.id)} className="p-1 text-slate-500 hover:text-red-400"><span className="text-lg leading-none">&times;</span></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={item.title} onChange={e => update(item.id, 'title', e.target.value)} placeholder={roleConfig?.projectTypeHint || 'Project title'} className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.technologies} onChange={e => update(item.id, 'technologies', e.target.value)} placeholder={roleConfig?.projectTechHint || 'Technologies used'} className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.techStack} onChange={e => update(item.id, 'techStack', e.target.value)} placeholder="Tech stack (detailed)" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.link || item.liveDemo} onChange={e => update(item.id, 'link', e.target.value)} placeholder="GitHub / Demo URL" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
          </div>
          <textarea value={item.description} onChange={e => update(item.id, 'description', e.target.value)} placeholder="Describe the project, your contributions, and key outcomes..." rows={2} className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm resize-none" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={item.contributions} onChange={e => update(item.id, 'contributions', e.target.value)} placeholder="Key contributions" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.results} onChange={e => update(item.id, 'results', e.target.value)} placeholder="Measurable results" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkillsStep({ data, updateData, roleConfig }: any) {
  const add = (name: string, category: string) => {
    if (!name.trim()) return;
    updateData({ skills: [...data.skills, { id: crypto.randomUUID(), name: name.trim(), level: 'intermediate', category }] });
  };
  const remove = (id: string) => updateData({ skills: data.skills.filter((s: any) => s.id !== id) });
  const [input, setInput] = useState('');
  const [cat, setCat] = useState('Programming Languages');

  const existingSkillNames = new Set(data.skills.map((s: any) => s.name.toLowerCase()));

  return (
    <div className="flex flex-col gap-5 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-pink-500/10 border border-pink-500/20 rounded-xl text-pink-400"><Check size={20} /></div>
        <h2 className="text-xl font-bold text-white">Skills</h2>
      </div>
      <div className="flex gap-2">
        <select value={cat} onChange={e => setCat(e.target.value)} className="bg-slate-950 border border-slate-800 text-white text-xs rounded-lg px-3 py-2.5 outline-none">
          {SKILL_CATEGORIES.map((c: any) => <option key={c.key} value={c.label}>{c.label}</option>)}
        </select>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { add(input, cat); setInput(''); } }} placeholder="Add a skill..." className="flex-1 bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg px-3 py-2.5 outline-none text-sm" />
        <button onClick={() => { add(input, cat); setInput(''); }} className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all">Add</button>
      </div>

      {roleConfig && (
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Role-Suggested Skills</p>
          <p className="text-[10px] text-slate-500 mb-2">Click to add skills commonly required for this role:</p>
          <div className="flex flex-col gap-2">
            {SKILL_CATEGORIES.map((catDef: any) => {
              const suggested = roleConfig.suggestedSkills[catDef.label];
              if (!suggested || suggested.length === 0) return null;
              const available = suggested.filter((s: string) => !existingSkillNames.has(s.toLowerCase()));
              if (available.length === 0) return null;
              return (
                <div key={catDef.key}>
                  <p className="text-[9px] text-slate-500 font-semibold mb-1">{catDef.label}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {available.map((skill: string) => (
                      <button
                        key={skill}
                        onClick={() => { add(skill, catDef.label); }}
                        className="px-2 py-1 bg-slate-800 border border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-emerald-400 text-[10px] rounded-md transition-all"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {SKILL_CATEGORIES.map((catDef: any) => {
          const items = data.skills.filter((s: any) => s.category === catDef.label);
          if (items.length === 0) return null;
          return (
            <div key={catDef.key}>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">{catDef.label}</p>
              <div className="flex flex-wrap gap-2">
                {items.map((s: any) => (
                  <span key={s.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-full text-xs text-slate-200">
                    {s.name}
                    <button onClick={() => remove(s.id)} className="text-slate-500 hover:text-red-400 ml-0.5"><span className="text-lg leading-none">&times;</span></button>
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CertificationsStep({ data, updateData }: any) {
  const add = () => updateData({ certifications: [...data.certifications, createEmptyCertification()] });
  const update = (id: string, field: string, value: string) => updateData({ certifications: data.certifications.map((c: any) => c.id === id ? { ...c, [field]: value } : c) });
  const remove = (id: string) => updateData({ certifications: data.certifications.filter((c: any) => c.id !== id) });

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400"><Check size={20} /></div>
          <h2 className="text-xl font-bold text-white">Certifications</h2>
        </div>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-all"><span className="text-lg leading-none">+</span> Add</button>
      </div>
      {data.certifications.length === 0 && <p className="text-sm text-slate-500 italic py-8 text-center">No certifications added yet.</p>}
      {data.certifications.map((item: any, idx: number) => (
        <div key={item.id} className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cert {idx + 1}</span>
            <button onClick={() => remove(item.id)} className="p-1 text-slate-500 hover:text-red-400"><span className="text-lg leading-none">&times;</span></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={item.name} onChange={e => update(item.id, 'name', e.target.value)} placeholder="Certification name" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.issuer} onChange={e => update(item.id, 'issuer', e.target.value)} placeholder="Issuer" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.date} onChange={e => update(item.id, 'date', e.target.value)} placeholder="Date" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.link} onChange={e => update(item.id, 'link', e.target.value)} placeholder="Credential URL" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
          </div>
        </div>
      ))}
    </div>
  );
}

function AchievementsStep({ data, updateData }: any) {
  const add = () => updateData({ achievements: [...data.achievements, createEmptyAchievement()] });
  const update = (id: string, field: string, value: string) => updateData({ achievements: data.achievements.map((a: any) => a.id === id ? { ...a, [field]: value } : a) });
  const remove = (id: string) => updateData({ achievements: data.achievements.filter((a: any) => a.id !== id) });

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400"><Sparkles size={20} /></div>
          <h2 className="text-xl font-bold text-white">Achievements</h2>
        </div>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-all"><span className="text-lg leading-none">+</span> Add</button>
      </div>
      {data.achievements.length === 0 && <p className="text-sm text-slate-500 italic py-8 text-center">Hackathons, competitions, awards, rankings...</p>}
      {data.achievements.map((item: any, idx: number) => (
        <div key={item.id} className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Award {idx + 1}</span>
            <button onClick={() => remove(item.id)} className="p-1 text-slate-500 hover:text-red-400"><span className="text-lg leading-none">&times;</span></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={item.title} onChange={e => update(item.id, 'title', e.target.value)} placeholder="Achievement / Award" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.date} onChange={e => update(item.id, 'date', e.target.value)} placeholder="Date" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
          </div>
          <textarea value={item.description} onChange={e => update(item.id, 'description', e.target.value)} placeholder="Describe this achievement..." rows={2} className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm resize-none" />
        </div>
      ))}
    </div>
  );
}

function LanguagesStep({ data, updateData }: any) {
  const add = () => updateData({ languages: [...data.languages, { id: crypto.randomUUID(), name: '', proficiency: 'intermediate' }] });
  const update = (id: string, field: string, value: string) => updateData({ languages: data.languages.map((l: any) => l.id === id ? { ...l, [field]: value } : l) });
  const remove = (id: string) => updateData({ languages: data.languages.filter((l: any) => l.id !== id) });

  return (
    <div className="flex flex-col gap-5 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-500/10 border border-teal-500/20 rounded-xl text-teal-400"><Type size={20} /></div>
          <h2 className="text-xl font-bold text-white">Languages & Interests</h2>
        </div>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-all"><span className="text-lg leading-none">+</span> Add Language</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {data.languages.map((item: any) => (
          <div key={item.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-full">
            <input value={item.name} onChange={e => update(item.id, 'name', e.target.value)} placeholder="Language" className="w-20 bg-transparent text-white text-xs outline-none" />
            <select value={item.proficiency} onChange={e => update(item.id, 'proficiency', e.target.value)} className="bg-transparent text-slate-400 text-xs outline-none cursor-pointer">
              <option value="native">Native</option>
              <option value="fluent">Fluent</option>
              <option value="intermediate">Intermediate</option>
              <option value="basic">Basic</option>
            </select>
            <button onClick={() => remove(item.id)} className="text-slate-500 hover:text-red-400"><span className="text-lg leading-none">&times;</span></button>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Interests / Hobbies</label>
        <input
          value={data.interests.join(', ')}
          onChange={e => updateData({ interests: e.target.value.split(',').map(s => s.trim()) })}
          placeholder="Cricket, Chess, Blogging, Photography..."
          className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm"
        />
      </div>
    </div>
  );
}

function VolunteerStep({ data, updateData }: any) {
  const add = () => updateData({ volunteer: [...data.volunteer, createEmptyVolunteer()] });
  const update = (id: string, field: string, value: any) => updateData({ volunteer: data.volunteer.map((v: any) => v.id === id ? { ...v, [field]: value } : v) });
  const remove = (id: string) => updateData({ volunteer: data.volunteer.filter((v: any) => v.id !== id) });

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400"><Sparkles size={20} /></div>
          <h2 className="text-xl font-bold text-white">Volunteer Experience</h2>
        </div>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-all"><span className="text-lg leading-none">+</span> Add</button>
      </div>
      {data.volunteer.length === 0 && <p className="text-sm text-slate-500 italic py-8 text-center">Add volunteer or community service experience.</p>}
      {data.volunteer.map((item: any, idx: number) => (
        <div key={item.id} className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Entry {idx + 1}</span>
            <button onClick={() => remove(item.id)} className="p-1 text-slate-500 hover:text-red-400"><span className="text-lg leading-none">&times;</span></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={item.organization} onChange={e => update(item.id, 'organization', e.target.value)} placeholder="Organization" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.role} onChange={e => update(item.id, 'role', e.target.value)} placeholder="Role" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.startDate} onChange={e => update(item.id, 'startDate', e.target.value)} placeholder="Start date" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <div className="flex gap-2 items-center">
              {!item.current && <input value={item.endDate} onChange={e => update(item.id, 'endDate', e.target.value)} placeholder="End date" className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
            <input type="checkbox" checked={item.current} onChange={e => update(item.id, 'current', e.target.checked)} className="accent-emerald-500" />
            Currently active
          </label>
          <textarea value={item.description} onChange={e => update(item.id, 'description', e.target.value)} placeholder="Describe your volunteer work and impact..." rows={2} className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm resize-none" />
        </div>
      ))}
    </div>
  );
}

function PublicationsStep({ data, updateData }: any) {
  const add = () => updateData({ publications: [...data.publications, createEmptyPublication()] });
  const update = (id: string, field: string, value: string) => updateData({ publications: data.publications.map((p: any) => p.id === id ? { ...p, [field]: value } : p) });
  const remove = (id: string) => updateData({ publications: data.publications.filter((p: any) => p.id !== id) });

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-xl text-sky-400"><Sparkles size={20} /></div>
          <h2 className="text-xl font-bold text-white">Publications</h2>
        </div>
        <button onClick={add} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/20 transition-all"><span className="text-lg leading-none">+</span> Add</button>
      </div>
      {data.publications.length === 0 && <p className="text-sm text-slate-500 italic py-8 text-center">Add research papers, articles, blog posts, or other publications.</p>}
      {data.publications.map((item: any, idx: number) => (
        <div key={item.id} className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pub {idx + 1}</span>
            <button onClick={() => remove(item.id)} className="p-1 text-slate-500 hover:text-red-400"><span className="text-lg leading-none">&times;</span></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input value={item.title} onChange={e => update(item.id, 'title', e.target.value)} placeholder="Title" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.venue} onChange={e => update(item.id, 'venue', e.target.value)} placeholder="Conference / Journal / Venue" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.date} onChange={e => update(item.id, 'date', e.target.value)} placeholder="Date" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
            <input value={item.link} onChange={e => update(item.id, 'link', e.target.value)} placeholder="DOI / URL" className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm" />
          </div>
          <textarea value={item.description} onChange={e => update(item.id, 'description', e.target.value)} placeholder="Brief description, key findings, or abstract..." rows={2} className="bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-lg p-2.5 outline-none text-sm resize-none" />
        </div>
      ))}
    </div>
  );
}

function ReviewStep({ data, generatedResume, error, handleGenerate, handleDownloadPdf, generating, qualityChecks, showQualityCheck, setShowQualityCheck, runQualityChecks }: any) {
  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400"><Check size={20} /></div>
        <h2 className="text-xl font-bold text-white">Review & Generate</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Target Role', val: data.target.role || '—' },
          { label: 'Industry', val: data.target.industry || '—' },
          { label: 'Experience', val: data.target.experienceLevel || '—' },
          { label: 'Country', val: data.target.country || '—' },
          { label: 'Name', val: data.personalInfo.fullName || '—' },
          { label: 'Email', val: data.personalInfo.email || '—' },
          { label: 'Education', val: `${data.education.length} entries` },
          { label: 'Experience', val: `${data.experience.length} entries` },
          { label: 'Projects', val: `${data.projects.length} entries` },
          { label: 'Skills', val: `${data.skills.length} skills` },
          { label: 'Certs', val: `${data.certifications.length} certs` },
          { label: 'Achievements', val: `${data.achievements.length} items` },
        ].map((item, i) => (
          <div key={i} className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{item.label}</p>
            <p className="text-xs text-white font-semibold mt-0.5 truncate">{item.val}</p>
          </div>
        ))}
      </div>
      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg font-medium text-center">{error}</div>}

      {!generatedResume ? (
        <button
          onClick={runQualityChecks}
          disabled={generating}
          className="flex items-center justify-center gap-2 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
        >
          {generating ? <><RefreshCw className="animate-spin" size={16} /> Generating...</> : <><Sparkles size={16} /> Generate Resume</>}
        </button>
      ) : (
        <div className="flex flex-col gap-4 border-t border-slate-800 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Generated Resume</h3>
            <button onClick={handleDownloadPdf} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all">
              <Download size={14} /> Export PDF
            </button>
          </div>
          <pre className="p-6 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 text-xs font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">{generatedResume}</pre>
        </div>
      )}

      {/* Quality check modal inline (shown from parent) */}
      {showQualityCheck && (
        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
          <p className="text-xs text-slate-400 mb-3">Quality checks running...</p>
          <div className="flex flex-col gap-1.5">
            {qualityChecks.map((c: any, i: number) => (
              <div key={i} className={`flex items-center gap-2 text-xs ${c.pass ? 'text-emerald-400' : 'text-amber-400'}`}>
                {c.pass ? <Check size={12} /> : <span className="w-3 h-3 rounded-full border-2 border-amber-400" />}
                {c.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== HELPERS ===================== */

function Field({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm transition-all" />
    </div>
  );
}

function upsertLink(links: any[], platform: string, url: string): any[] {
  const existing = links.find(l => l.platform === platform);
  if (existing) return links.map(l => l.platform === platform ? { ...l, url } : l);
  return [...links, { id: crypto.randomUUID(), platform, url }];
}
