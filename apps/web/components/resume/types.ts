export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  title: string;
  summary: string;
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  field: string;
  startYear: string;
  endYear: string;
  grade: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string;
  link: string;
  startDate: string;
  endDate: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: 'native' | 'fluent' | 'intermediate' | 'basic';
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export type ResumeTemplate = 'professional' | 'modern' | 'minimal' | 'google' | 'microsoft';

export interface ResumeTarget {
  role: string;
  industry: string;
  experienceLevel: string;
  country: string;
}

export interface CategorizedSkills {
  programmingLanguages: string[];
  frameworks: string[];
  libraries: string[];
  databases: string[];
  cloud: string[];
  devops: string[];
  aiMl: string[];
  softSkills: string[];
}

export interface EnhancedExperience extends Experience {
  achievements: string;
  technologies: string;
}

export interface EnhancedProject extends Project {
  techStack: string;
  liveDemo: string;
  contributions: string;
  results: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: EnhancedExperience[];
  skills: Skill[];
  projects: EnhancedProject[];
  certifications: Certification[];
  achievements: Achievement[];
  languages: Language[];
  socialLinks: SocialLink[];
  template: ResumeTemplate;
  target: ResumeTarget;
  interests: string[];
  colorTheme: string;
  fontFamily: string;
}

export function createEmptyResume(): ResumeData {
  return {
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      title: '',
      summary: '',
    },
    education: [],
    experience: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
    socialLinks: [],
    template: 'professional',
    target: { role: '', industry: '', experienceLevel: '', country: '' },
    interests: [],
    colorTheme: 'emerald',
    fontFamily: 'sans',
  };
}

const STORAGE_KEY = 'vidyguide-resume-data';

export function saveResume(data: ResumeData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* storage full or unavailable */
  }
}

export function loadResume(): ResumeData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ResumeData;
      return parsed;
    }
  } catch {
    /* corrupted data */
  }
  return createEmptyResume();
}

export function createEmptyEnhancedExperience(): EnhancedExperience {
  return {
    id: crypto.randomUUID(), company: '', role: '', location: '',
    startDate: '', endDate: '', current: false, description: '',
    achievements: '', technologies: '',
  };
}

export function createEmptyEnhancedProject(): EnhancedProject {
  return {
    id: crypto.randomUUID(), title: '', description: '', technologies: '',
    techStack: '', link: '', liveDemo: '', contributions: '', results: '',
    startDate: '', endDate: '',
  };
}

export function createEmptyEducation(): Education {
  return { id: crypto.randomUUID(), degree: '', institution: '', field: '', startYear: '', endYear: '', grade: '' };
}

export function createEmptyCertification(): Certification {
  return { id: crypto.randomUUID(), name: '', issuer: '', date: '', link: '' };
}

export function createEmptyAchievement(): Achievement {
  return { id: crypto.randomUUID(), title: '', description: '', date: '' };
}
