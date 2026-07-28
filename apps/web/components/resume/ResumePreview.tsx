'use client';

import { memo } from 'react';
import { ResumeData, ResumeTemplate } from './types';

interface Props {
  data: ResumeData;
  zoom?: number;
}

const COLOR_THEMES: Record<string, { primary: string; secondary: string; accent: string; bg: string; text: string; muted: string; border: string }> = {
  emerald: { primary: '#059669', secondary: '#10b981', accent: '#34d399', bg: '#ffffff', text: '#1e293b', muted: '#64748b', border: '#e2e8f0' },
  blue: { primary: '#2563eb', secondary: '#3b82f6', accent: '#60a5fa', bg: '#ffffff', text: '#1e293b', muted: '#64748b', border: '#e2e8f0' },
  purple: { primary: '#7c3aed', secondary: '#8b5cf6', accent: '#a78bfa', bg: '#ffffff', text: '#1e293b', muted: '#64748b', border: '#e2e8f0' },
  rose: { primary: '#e11d48', secondary: '#f43f5e', accent: '#fb7185', bg: '#ffffff', text: '#1e293b', muted: '#64748b', border: '#e2e8f0' },
  amber: { primary: '#d97706', secondary: '#f59e0b', accent: '#fbbf24', bg: '#ffffff', text: '#1e293b', muted: '#64748b', border: '#e2e8f0' },
  slate: { primary: '#334155', secondary: '#475569', accent: '#64748b', bg: '#ffffff', text: '#1e293b', muted: '#64748b', border: '#e2e8f0' },
};

function PreviewProfessional({ data, colors }: { data: ResumeData; colors: typeof COLOR_THEMES[string] }) {
  const { personalInfo, education, experience, skills, projects, certifications, achievements, languages } = data;
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: colors.text, background: colors.bg }} className="p-8 text-xs leading-relaxed">
      <div style={{ textAlign: 'center', marginBottom: 24, borderBottom: `2px solid ${colors.primary}`, paddingBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: colors.text, margin: 0 }}>{personalInfo.fullName}</h1>
        {personalInfo.title && <p style={{ fontSize: 13, color: colors.primary, marginTop: 2, fontWeight: 600 }}>{personalInfo.title}</p>}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 8, fontSize: 10, color: colors.muted, flexWrap: 'wrap' }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 4, fontSize: 10, color: colors.muted, flexWrap: 'wrap' }}>
          {data.socialLinks.map(l => <span key={l.id}>{l.platform}: {l.url.replace(/^https?:\/\//, '')}</span>)}
        </div>
      </div>
      {personalInfo.summary && (
        <div style={{ marginBottom: 16 }}>
          <SectionTitle text="Professional Summary" color={colors.primary} />
          <p style={{ color: colors.text, lineHeight: 1.6, marginTop: 4 }}>{personalInfo.summary}</p>
        </div>
      )}
      {experience.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionTitle text="Experience" color={colors.primary} />
          {experience.map(exp => (
            <div key={exp.id} style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontWeight: 700, color: colors.text }}>{exp.role}</span>
                  {exp.company && <span style={{ color: colors.muted }}> at {exp.company}</span>}
                </div>
                <span style={{ color: colors.muted, fontSize: 10, whiteSpace: 'nowrap', marginLeft: 8 }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              {exp.location && <p style={{ color: colors.muted, fontSize: 10, margin: '2px 0' }}>{exp.location}</p>}
              {exp.description && <p style={{ color: colors.text, marginTop: 4, lineHeight: 1.6 }}>{exp.description}</p>}
              {(exp as any).achievements && <p style={{ color: colors.secondary, marginTop: 2, fontSize: 10 }}>Achievements: {(exp as any).achievements}</p>}
            </div>
          ))}
        </div>
      )}
      {education.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionTitle text="Education" color={colors.primary} />
          {education.map(edu => (
            <div key={edu.id} style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontWeight: 700 }}>{edu.degree}</span>
                <p style={{ color: colors.muted }}>{edu.institution}{edu.field ? ` — ${edu.field}` : ''}</p>
              </div>
              <div style={{ textAlign: 'right', fontSize: 10, color: colors.muted }}>
                <span>{edu.startYear} – {edu.endYear}</span>
                {edu.grade && <p>{edu.grade}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
      {skills.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionTitle text="Skills" color={colors.primary} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {skills.map(s => (
              <span key={s.id} style={{ padding: '2px 8px', background: `${colors.primary}10`, color: colors.primary, borderRadius: 4, fontSize: 10 }}>{s.name}</span>
            ))}
          </div>
        </div>
      )}
      {projects.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionTitle text="Projects" color={colors.primary} />
          {projects.map(p => (
            <div key={p.id} style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700 }}>{p.title}</span>
                {p.startDate && <span style={{ color: colors.muted, fontSize: 10 }}>{p.startDate} – {p.endDate}</span>}
              </div>
              {p.technologies && <p style={{ color: colors.muted, fontSize: 10 }}>Technologies: {p.technologies}</p>}
              {p.description && <p style={{ color: colors.text, marginTop: 2, lineHeight: 1.6 }}>{p.description}</p>}
            </div>
          ))}
        </div>
      )}
      {certifications.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionTitle text="Certifications" color={colors.primary} />
          {certifications.map(c => (
            <div key={c.id} style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600 }}>{c.name}{c.issuer ? ` — ${c.issuer}` : ''}</span>
              {c.date && <span style={{ color: colors.muted, fontSize: 10 }}>{c.date}</span>}
            </div>
          ))}
        </div>
      )}
      {achievements.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionTitle text="Achievements" color={colors.primary} />
          {achievements.map(a => (
            <div key={a.id} style={{ marginTop: 6 }}>
              <span style={{ fontWeight: 600 }}>{a.title}</span>
              {a.description && <p style={{ color: colors.text, marginTop: 2 }}>{a.description}</p>}
            </div>
          ))}
        </div>
      )}
      {languages.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <SectionTitle text="Languages" color={colors.primary} />
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
            {languages.map(l => <span key={l.id} style={{ color: colors.text }}>{l.name} ({l.proficiency})</span>)}
          </div>
        </div>
      )}
      {data.target.role && (
        <div style={{ marginTop: 16, borderTop: `1px solid ${colors.border}`, paddingTop: 8, fontSize: 8, color: colors.muted, textAlign: 'center' }}>
          Resume tailored for {data.target.role} | {data.target.industry} | {data.target.country}
        </div>
      )}
    </div>
  );
}

function PreviewModern({ data, colors }: { data: ResumeData; colors: typeof COLOR_THEMES[string] }) {
  const { personalInfo, education, experience, skills, projects, certifications, achievements, languages } = data;
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', display: 'flex', minHeight: 500, background: colors.bg }}>
      <div style={{ width: '35%', background: colors.primary, color: '#fff', padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
            {personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : '?'}
          </div>
          <h1 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{personalInfo.fullName}</h1>
          {personalInfo.title && <p style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>{personalInfo.title}</p>}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 12 }}>
          <p style={{ fontSize: 10, opacity: 0.7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Contact</p>
          {personalInfo.email && <p style={{ fontSize: 10, marginBottom: 4 }}>{personalInfo.email}</p>}
          {personalInfo.phone && <p style={{ fontSize: 10, marginBottom: 4 }}>{personalInfo.phone}</p>}
          {personalInfo.location && <p style={{ fontSize: 10, marginBottom: 4 }}>{personalInfo.location}</p>}
          {data.socialLinks.map(l => <p key={l.id} style={{ fontSize: 10, marginBottom: 2 }}>{l.platform}</p>)}
        </div>
        {skills.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 12 }}>
            <p style={{ fontSize: 10, opacity: 0.7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Skills</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {skills.map(s => <span key={s.id} style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.15)', borderRadius: 12, fontSize: 9 }}>{s.name}</span>)}
            </div>
          </div>
        )}
        {languages.length > 0 && (
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 12 }}>
            <p style={{ fontSize: 10, opacity: 0.7, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Languages</p>
            {languages.map(l => <p key={l.id} style={{ fontSize: 10, marginBottom: 2 }}>{l.name} — {l.proficiency}</p>)}
          </div>
        )}
      </div>
      <div style={{ width: '65%', padding: '24px 20px', color: colors.text }}>
        {personalInfo.summary && (
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Summary</h2>
            <p style={{ fontSize: 10, lineHeight: 1.6 }}>{personalInfo.summary}</p>
          </div>
        )}
        {experience.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Experience</h2>
            {experience.map(exp => (
              <div key={exp.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, fontSize: 11 }}>{exp.role}{exp.company ? `, ${exp.company}` : ''}</span>
                  <span style={{ fontSize: 9, color: colors.muted }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <p style={{ fontSize: 10, marginTop: 2, lineHeight: 1.6 }}>{exp.description}</p>
              </div>
            ))}
          </div>
        )}
        {education.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Education</h2>
            {education.map(edu => (
              <div key={edu.id} style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 11 }}>{edu.degree}</span>
                  <p style={{ fontSize: 10, color: colors.muted }}>{edu.institution}</p>
                </div>
                <span style={{ fontSize: 9, color: colors.muted }}>{edu.startYear} – {edu.endYear}</span>
              </div>
            ))}
          </div>
        )}
        {projects.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Projects</h2>
            {projects.map(p => (
              <div key={p.id} style={{ marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 11 }}>{p.title}</span>
                <p style={{ fontSize: 10, lineHeight: 1.6 }}>{p.description}</p>
              </div>
            ))}
          </div>
        )}
        {certifications.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Certifications</h2>
            {certifications.map(c => <p key={c.id} style={{ fontSize: 10, marginBottom: 2 }}>{c.name}{c.issuer ? ` - ${c.issuer}` : ''}</p>)}
          </div>
        )}
        {achievements.length > 0 && (
          <div>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Achievements</h2>
            {achievements.map(a => <p key={a.id} style={{ fontSize: 10, marginBottom: 2 }}>{a.title}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewMinimal({ data, colors }: { data: ResumeData; colors: typeof COLOR_THEMES[string] }) {
  const { personalInfo, education, experience, skills, projects, certifications, achievements, languages } = data;
  return (
    <div style={{ fontFamily: 'Georgia, serif', color: colors.text, background: colors.bg, padding: '32px 40px' }} className="text-xs leading-relaxed">
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 20, fontWeight: 400, letterSpacing: 1, textTransform: 'uppercase', margin: 0 }}>{personalInfo.fullName}</h1>
        {personalInfo.title && <p style={{ fontSize: 11, color: colors.muted, marginTop: 2, fontStyle: 'italic' }}>{personalInfo.title}</p>}
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 10, color: colors.muted }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>
      {personalInfo.summary && (
        <div style={{ marginBottom: 20, borderTop: `1px solid ${colors.border}`, paddingTop: 12 }}>
          <p style={{ fontSize: 11, lineHeight: 1.7, color: colors.text }}>{personalInfo.summary}</p>
        </div>
      )}
      {experience.length > 0 && (
        <div style={{ marginBottom: 20, borderTop: `1px solid ${colors.border}`, paddingTop: 12 }}>
          <h2 style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, color: colors.muted }}>Experience</h2>
          {experience.map(exp => (
            <div key={exp.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: 11 }}>{exp.role}{exp.company ? `, ${exp.company}` : ''}</span>
                <span style={{ fontSize: 9, color: colors.muted }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
              </div>
              <p style={{ fontSize: 10, marginTop: 2, lineHeight: 1.7 }}>{exp.description}</p>
            </div>
          ))}
        </div>
      )}
      {education.length > 0 && (
        <div style={{ marginBottom: 20, borderTop: `1px solid ${colors.border}`, paddingTop: 12 }}>
          <h2 style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, color: colors.muted }}>Education</h2>
          {education.map(edu => (
            <div key={edu.id} style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11 }}>{edu.degree} — {edu.institution}</span>
              <span style={{ fontSize: 9, color: colors.muted }}>{edu.startYear} – {edu.endYear}</span>
            </div>
          ))}
        </div>
      )}
      {skills.length > 0 && (
        <div style={{ marginBottom: 20, borderTop: `1px solid ${colors.border}`, paddingTop: 12 }}>
          <h2 style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, color: colors.muted }}>Skills</h2>
          <p style={{ fontSize: 10, lineHeight: 1.8 }}>{skills.map(s => s.name).join('  ·  ')}</p>
        </div>
      )}
      {projects.length > 0 && (
        <div style={{ marginBottom: 20, borderTop: `1px solid ${colors.border}`, paddingTop: 12 }}>
          <h2 style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8, color: colors.muted }}>Projects</h2>
          {projects.map(p => (
            <div key={p.id} style={{ marginBottom: 6 }}>
              <span style={{ fontWeight: 600, fontSize: 11 }}>{p.title}</span>
              <p style={{ fontSize: 10, lineHeight: 1.7 }}>{p.description}</p>
            </div>
          ))}
        </div>
      )}
      {(certifications.length > 0 || achievements.length > 0 || languages.length > 0) && (
        <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 12 }}>
          {certifications.length > 0 && <p style={{ fontSize: 10, marginBottom: 2 }}>Certifications: {certifications.map(c => c.name).join(', ')}</p>}
          {achievements.length > 0 && <p style={{ fontSize: 10, marginBottom: 2 }}>Achievements: {achievements.map(a => a.title).join(', ')}</p>}
          {languages.length > 0 && <p style={{ fontSize: 10 }}>Languages: {languages.map(l => `${l.name} (${l.proficiency})`).join(', ')}</p>}
        </div>
      )}
    </div>
  );
}

function PreviewGoogle({ data, colors }: { data: ResumeData; colors: typeof COLOR_THEMES[string] }) {
  const { personalInfo, education, experience, skills, projects, certifications, achievements, languages } = data;
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', color: colors.text, background: colors.bg }}>
      <div style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, padding: '24px 28px', color: '#fff' }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, margin: 0, letterSpacing: -0.5 }}>{personalInfo.fullName}</h1>
        {personalInfo.title && <p style={{ fontSize: 14, opacity: 0.9, marginTop: 2, fontWeight: 300 }}>{personalInfo.title}</p>}
        <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 11, opacity: 0.85, flexWrap: 'wrap' }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
          {personalInfo.location && <span>{personalInfo.location}</span>}
        </div>
      </div>
      <div style={{ padding: '20px 28px' }}>
        {experience.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 500, color: colors.primary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Experience</h2>
            {experience.map(exp => (
              <div key={exp.id} style={{ marginBottom: 12, paddingLeft: 12, borderLeft: `3px solid ${colors.accent}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: 12 }}>{exp.role}</span>
                  <span style={{ fontSize: 10, color: colors.muted }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                {exp.company && <p style={{ fontSize: 11, color: colors.secondary, marginTop: 1 }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>}
                <p style={{ fontSize: 10, marginTop: 4, lineHeight: 1.6 }}>{exp.description}</p>
              </div>
            ))}
          </div>
        )}
        {education.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 500, color: colors.primary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Education</h2>
            {education.map(edu => (
              <div key={edu.id} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 12 }}>{edu.degree}</span>
                  <p style={{ fontSize: 10, color: colors.muted }}>{edu.institution}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: 10, color: colors.muted }}>{edu.startYear} – {edu.endYear}</span>
                  {edu.grade && <p style={{ fontSize: 10, color: colors.secondary }}>{edu.grade}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
        {skills.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 13, fontWeight: 500, color: colors.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Skills</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {skills.map(s => (
                <span key={s.id} style={{ padding: '4px 12px', background: `${colors.primary}08`, color: colors.primary, borderRadius: 16, fontSize: 10, border: `1px solid ${colors.accent}40` }}>{s.name}</span>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {projects.length > 0 && (
            <div>
              <h2 style={{ fontSize: 13, fontWeight: 500, color: colors.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Projects</h2>
              {projects.map(p => (
                <div key={p.id} style={{ marginBottom: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 11 }}>{p.title}</span>
                  <p style={{ fontSize: 10, lineHeight: 1.5, marginTop: 2 }}>{p.description}</p>
                </div>
              ))}
            </div>
          )}
          {(certifications.length > 0 || achievements.length > 0) && (
            <div>
              {certifications.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <h2 style={{ fontSize: 13, fontWeight: 500, color: colors.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Certifications</h2>
                  {certifications.map(c => <p key={c.id} style={{ fontSize: 10, marginBottom: 4 }}>{c.name}</p>)}
                </div>
              )}
              {achievements.length > 0 && (
                <div>
                  <h2 style={{ fontSize: 13, fontWeight: 500, color: colors.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Achievements</h2>
                  {achievements.map(a => <p key={a.id} style={{ fontSize: 10, marginBottom: 4 }}>{a.title}</p>)}
                </div>
              )}
            </div>
          )}
        </div>
        {languages.length > 0 && (
          <div style={{ marginTop: 16, borderTop: `1px solid ${colors.border}`, paddingTop: 12 }}>
            <h2 style={{ fontSize: 13, fontWeight: 500, color: colors.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Languages</h2>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {languages.map(l => <span key={l.id} style={{ fontSize: 10 }}>{l.name} ({l.proficiency})</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewMicrosoft({ data, colors }: { data: ResumeData; colors: typeof COLOR_THEMES[string] }) {
  const { personalInfo, education, experience, skills, projects, certifications, achievements, languages } = data;
  return (
    <div style={{ fontFamily: '"Segoe UI", system-ui, sans-serif', color: colors.text, background: colors.bg }}>
      <div style={{ background: colors.text, color: '#fff', padding: '16px 24px' }}>
        <h1 style={{ fontSize: 22, fontWeight: 300, margin: 0 }}>{personalInfo.fullName || 'Your Name'}</h1>
        <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>
          {personalInfo.title && <span>{personalInfo.title} | </span>}
          {personalInfo.email && <span>{personalInfo.email} | </span>}
          {personalInfo.phone && <span>{personalInfo.phone}</span>}
        </div>
      </div>
      <div style={{ padding: '16px 24px' }}>
        {personalInfo.summary && (
          <div style={{ marginBottom: 16, padding: '8px 12px', background: `${colors.primary}08`, borderRadius: 4, borderLeft: `3px solid ${colors.primary}` }}>
            <p style={{ fontSize: 10, lineHeight: 1.6 }}>{personalInfo.summary}</p>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
          <div>
            {skills.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 12, fontWeight: 600, color: colors.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Skills</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {skills.map(s => (
                    <div key={s.id} style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: colors.primary }} />
                      {s.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {languages.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 12, fontWeight: 600, color: colors.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Languages</h2>
                {languages.map(l => <p key={l.id} style={{ fontSize: 10, marginBottom: 3 }}>{l.name} ({l.proficiency})</p>)}
              </div>
            )}
            {education.length > 0 && (
              <div>
                <h2 style={{ fontSize: 12, fontWeight: 600, color: colors.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Education</h2>
                {education.map(edu => (
                  <div key={edu.id} style={{ marginBottom: 8 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, margin: 0 }}>{edu.degree}</p>
                    <p style={{ fontSize: 10, color: colors.muted, margin: 0 }}>{edu.institution}</p>
                    <p style={{ fontSize: 9, color: colors.muted }}>{edu.startYear} – {edu.endYear}{edu.grade ? ` | ${edu.grade}` : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            {experience.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 12, fontWeight: 600, color: colors.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Experience</h2>
                {experience.map(exp => (
                  <div key={exp.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 600, fontSize: 11 }}>{exp.role}</span>
                      <span style={{ fontSize: 9, color: colors.muted }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                    </div>
                    <p style={{ fontSize: 10, color: colors.secondary, margin: '1px 0' }}>{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                    <p style={{ fontSize: 10, lineHeight: 1.6, marginTop: 2 }}>{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
            {projects.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 12, fontWeight: 600, color: colors.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Projects</h2>
                {projects.map(p => (
                  <div key={p.id} style={{ marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 11 }}>{p.title}</span>
                    <p style={{ fontSize: 10, lineHeight: 1.6, marginTop: 2 }}>{p.description}</p>
                  </div>
                ))}
              </div>
            )}
            {certifications.length > 0 && (
              <div>
                <h2 style={{ fontSize: 12, fontWeight: 600, color: colors.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Certifications</h2>
                {certifications.map(c => <p key={c.id} style={{ fontSize: 10, marginBottom: 3 }}>{c.name}</p>)}
              </div>
            )}
          </div>
        </div>
        {achievements.length > 0 && (
          <div style={{ borderTop: `1px solid ${colors.border}`, paddingTop: 12, marginTop: 8 }}>
            <h2 style={{ fontSize: 12, fontWeight: 600, color: colors.primary, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Achievements</h2>
            {achievements.map(a => <p key={a.id} style={{ fontSize: 10, marginBottom: 3 }}>{a.title}</p>)}
          </div>
        )}
      </div>
    </div>
  );
}

const SectionTitle = memo(function SectionTitle({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ borderBottom: `1px solid ${color}40`, paddingBottom: 3, marginBottom: 4 }}>
      <span style={{ fontWeight: 700, fontSize: 11, color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{text}</span>
    </div>
  );
});

const TEMPLATE_MAP: Record<ResumeTemplate, React.FC<{ data: ResumeData; colors: typeof COLOR_THEMES[string] }>> = {
  professional: PreviewProfessional,
  modern: PreviewModern,
  minimal: PreviewMinimal,
  google: PreviewGoogle,
  microsoft: PreviewMicrosoft,
};

function ResumePreview({ data, zoom = 1 }: Props) {
  const colors = COLOR_THEMES[data.colorTheme] || COLOR_THEMES.emerald;
  const Template = TEMPLATE_MAP[data.template] || TEMPLATE_MAP.professional;

  if (!data.personalInfo.fullName && !data.target.role) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm italic">
        Fill in your details to see a live preview.
      </div>
    );
  }

  return (
    <div className="origin-top-left transition-all duration-200" style={{ transform: `scale(${zoom})`, width: zoom < 1 ? `${100 / zoom}%` : '100%', transformOrigin: 'top left' }}>
      <div className="bg-white shadow-lg" style={{ minHeight: 400, width: '100%', overflow: 'hidden' }}>
        <Template data={data} colors={colors} />
      </div>
    </div>
  );
}

export { COLOR_THEMES, TEMPLATE_MAP };
export default ResumePreview;
