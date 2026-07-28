'use client';

import { ResumeData } from './types';

interface Props {
  data: ResumeData;
}

export default function ResumePreview({ data }: Props) {
  const { personalInfo, education, experience, skills, projects, certifications, achievements, languages, socialLinks } = data;

  if (!personalInfo.fullName) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm italic">
        Fill in your details above to see a live preview.
      </div>
    );
  }

  return (
    <div className="bg-white text-slate-900 rounded-xl p-8 shadow-lg text-xs leading-relaxed font-sans">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-slate-900">{personalInfo.fullName}</h1>
        {personalInfo.title && (
          <p className="text-sm text-slate-600 mt-0.5">{personalInfo.title}</p>
        )}
        <div className="flex justify-center gap-3 mt-2 text-[10px] text-slate-500 flex-wrap">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-2 mt-1 text-[10px] text-slate-500 flex-wrap">
            {socialLinks.map((link) => (
              <span key={link.id}>{link.platform}: {link.url.replace(/^https?:\/\//, '')}</span>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {personalInfo.summary && (
        <div className="mb-5">
          <SectionTitle text="Professional Summary" />
          <p className="text-slate-700 leading-relaxed mt-1">{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div className="mb-5">
          <SectionTitle text="Experience" />
          {experience.map((exp) => (
            <div key={exp.id} className="mt-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-bold text-slate-900">{exp.role}</span>
                  {exp.company && <span className="text-slate-600"> at {exp.company}</span>}
                </div>
                <span className="text-slate-500 text-[10px] whitespace-nowrap ml-2">
                  {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                </span>
              </div>
              {exp.location && <p className="text-slate-500 text-[10px]">{exp.location}</p>}
              {exp.description && <p className="text-slate-700 mt-1 leading-relaxed">{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div className="mb-5">
          <SectionTitle text="Education" />
          {education.map((edu) => (
            <div key={edu.id} className="mt-2">
              <div className="flex justify-between">
                <span className="font-bold text-slate-900">{edu.degree}</span>
                <span className="text-slate-500 text-[10px]">{edu.startYear} – {edu.endYear}</span>
              </div>
              <p className="text-slate-600">{edu.institution}{edu.field ? ` — ${edu.field}` : ''}</p>
              {edu.grade && <p className="text-slate-500 text-[10px]">Grade: {edu.grade}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-5">
          <SectionTitle text="Skills" />
          <div className="flex flex-wrap gap-1 mt-1">
            {skills.map((skill) => (
              <span key={skill.id} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px]">
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div className="mb-5">
          <SectionTitle text="Projects" />
          {projects.map((proj) => (
            <div key={proj.id} className="mt-2">
              <div className="flex justify-between">
                <span className="font-bold text-slate-900">{proj.title}</span>
                <span className="text-slate-500 text-[10px]">{proj.startDate} – {proj.endDate}</span>
              </div>
              {proj.technologies && <p className="text-slate-500 text-[10px]">Technologies: {proj.technologies}</p>}
              {proj.description && <p className="text-slate-700 mt-0.5 leading-relaxed">{proj.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div className="mb-5">
          <SectionTitle text="Certifications" />
          {certifications.map((cert) => (
            <div key={cert.id} className="mt-1.5 flex justify-between">
              <div>
                <span className="font-bold text-slate-900">{cert.name}</span>
                {cert.issuer && <span className="text-slate-600"> — {cert.issuer}</span>}
              </div>
              {cert.date && <span className="text-slate-500 text-[10px]">{cert.date}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="mb-5">
          <SectionTitle text="Achievements" />
          {achievements.map((ach) => (
            <div key={ach.id} className="mt-2">
              <div className="flex justify-between">
                <span className="font-bold text-slate-900">{ach.title}</span>
                {ach.date && <span className="text-slate-500 text-[10px]">{ach.date}</span>}
              </div>
              {ach.description && <p className="text-slate-700 mt-0.5 leading-relaxed">{ach.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Languages */}
      {languages.length > 0 && (
        <div className="mb-5">
          <SectionTitle text="Languages" />
          <div className="flex flex-wrap gap-2 mt-1">
            {languages.map((lang) => (
              <span key={lang.id} className="text-slate-700">
                {lang.name}{lang.proficiency ? ` (${lang.proficiency})` : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ text }: { text: string }) {
  return (
    <div className="border-b border-slate-300 pb-0.5 mb-1">
      <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">{text}</span>
    </div>
  );
}
