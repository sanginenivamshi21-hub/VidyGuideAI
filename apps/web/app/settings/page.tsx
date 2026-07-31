'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSettings, GROQ_MODELS, LANGUAGES, ACCENT_COLORS, applyTheme, applyAccent } from '@/hooks/useSettings';
import { useRouter } from 'next/navigation';
import { api, fetchWithAuth } from '@/lib/api';
import { useI18n, SUPPORTED_LOCALES } from '@/lib/i18n';
import { useAnimationsEnabled } from '@/hooks/useAnimations';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette, Volume2, Bell, Shield, Keyboard, Eye, GripVertical, Sun, Moon, Monitor,
  Check, Upload, Trash2, Download, LogOut, AlertTriangle, Search, CheckCircle2,
  KeyRound, Settings,
} from 'lucide-react';
import { useAuth, useRequireRegistered } from '@/hooks/useAuth';

type Toast = { message: string; type: 'success' | 'error' } | null;

export default function SettingsPage() {
  const { settings, updateSettings, loading, saving } = useSettings();
  const { isAuthenticated, user } = useAuth();
  const { t, setLang } = useI18n();
  useRequireRegistered();
  const router = useRouter();
  const animationsEnabled = useAnimationsEnabled();
  const [password, setPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordType, setPasswordType] = useState<'success' | 'error'>('success');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [activeTab, setActiveTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [toast, setToast] = useState<Toast>(null);
  const [subNotifs, setSubNotifs] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vidyguide_subnotifs');
      if (stored) { try { return { resume: true, interview: true, career: true, marketing: false, ...JSON.parse(stored) }; } catch {} }
    }
    return { resume: true, interview: true, career: true, marketing: false };
  });
  const wasSaving = useRef(false);

  useEffect(() => {
    localStorage.setItem('vidyguide_subnotifs', JSON.stringify(subNotifs));
  }, [subNotifs]);

  useEffect(() => {
    if (wasSaving.current && !saving) {
      setToast({ message: t('settings.savedToast'), type: 'success' });
    }
    wasSaving.current = saving;
  }, [saving, t]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(id);
  }, [toast]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    if (user?.profilePicture) setProfilePicture(user.profilePicture);
  }, [user]);

  const update = useCallback((key: string, value: any) => {
    updateSettings({ [key]: value } as any);
    if (key === 'theme') applyTheme(value);
    if (key === 'accentColor') applyAccent(value);
  }, [updateSettings]);

  const tabs = [
    { id: 'general', label: t('settings.tabGeneral'), icon: Eye },
    { id: 'ai', label: t('settings.tabAi'), icon: GripVertical },
    { id: 'speech', label: t('settings.tabSpeech'), icon: Volume2 },
    { id: 'theme', label: t('settings.tabTheme'), icon: Palette },
    { id: 'notifications', label: t('settings.tabNotifications'), icon: Bell },
    { id: 'security', label: t('settings.tabSecurity'), icon: Shield },
    { id: 'shortcuts', label: t('settings.tabShortcuts'), icon: Keyboard },
  ];

  const Section = ({ icon: Icon, title, desc, children }: { icon: any; title: string; desc?: string; children: React.ReactNode }) => (
    <motion.section
      initial={animationsEnabled ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className="surface-card p-5 sm:p-6"
    >
      <div className="flex items-start gap-3 mb-4">
        <div className="icon-box shrink-0" style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-10)' }}>
          <Icon size={16} />
        </div>
        <div>
          <h3 className="text-h3">{title}</h3>
          {desc && <p className="text-caption mt-0.5">{desc}</p>}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </motion.section>
  );

  const Field = ({ label, htmlFor, children }: { label: string; htmlFor?: string; children: React.ReactNode }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 py-1">
      <span className="text-caption font-medium">{label}</span>
      <div className="w-full sm:w-56 shrink-0">{children}</div>
    </div>
  );

  const Select = ({ value, onChange, options, ariaLabel }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; ariaLabel?: string }) => (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="select-field text-xs"
      aria-label={ariaLabel}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  const Toggle = ({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) => (
    <button
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      className="toggle"
    >
      <span className="toggle-knob" />
    </button>
  );

  const RangeSlider = ({ value, onChange, min, max, step, ariaLabel }: { value: number; onChange: (v: number) => void; min: number; max: number; step: number; ariaLabel?: string }) => (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="range-field flex-1"
        aria-label={ariaLabel}
        aria-valuetext={String(value)}
      />
      <span className="text-xs w-10 text-right tabular-nums" style={{ color: 'var(--text-secondary)' }}>{value.toFixed(step < 1 ? 1 : 0)}</span>
    </div>
  );

  const handlePasswordUpdate = async () => {
    if (password.length < 6) {
      setPasswordType('error');
      setPasswordMsg(t('settings.pwShort'));
      return;
    }
    try {
      const data = await api('/users/profile', {
        method: 'PUT',
        body: { password },
      });
      const ok = data.success === true;
      setPasswordType(ok ? 'success' : 'error');
      setPasswordMsg(ok ? t('settings.pwUpdated') : t('settings.pwFailed'));
      if (ok) {
        setPassword('');
        setToast({ message: t('settings.pwUpdated'), type: 'success' });
      }
    } catch {
      setPasswordType('error');
      setPasswordMsg(t('settings.pwNetwork'));
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account?\n\nThis action CANNOT be undone. All your data will be erased.')) return;
    if (!window.confirm('This will delete ALL your:\n- Profile & settings\n- Chat conversations\n- Career history\n- Resumes\n- OCR history\n\nAre you absolutely sure?')) return;
    try {
      const res = await fetchWithAuth('/users/account', { method: 'DELETE' });
      if (res.ok) {
        localStorage.clear();
        router.push('/auth');
      }
    } catch { setPasswordMsg(t('settings.pwNetwork')); }
  };

  const handleExportData = async () => {
    try {
      const res = await fetchWithAuth('/users/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'vidyguide-export.json'; a.click();
        URL.revokeObjectURL(url);
        setToast({ message: t('common.copied'), type: 'success' });
      }
    } catch { setPasswordMsg(t('settings.pwNetwork')); }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetchWithAuth('/users/profile/picture', {
        method: 'POST', body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setProfilePicture(data.profilePicture);
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          u.profilePicture = data.profilePicture;
          localStorage.setItem('user', JSON.stringify(u));
        }
        setToast({ message: t('settings.savedToast'), type: 'success' });
      }
    } catch {}
  };

  const handleDeleteProfilePicture = async () => {
    try {
      await fetchWithAuth('/users/profile/picture', { method: 'DELETE' });
      setProfilePicture('');
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        u.profilePicture = '';
        localStorage.setItem('user', JSON.stringify(u));
      }
    } catch {}
  };

  const handleLanguageChange = (value: string) => {
    update('language', value);
    setLang(value);
  };

  const sectionGroups: { tab: string; sections: { id: string; title: string; keywords: string; render: () => React.ReactNode }[] }[] = useMemo(() => ([
    {
      tab: 'general',
      sections: [
        {
          id: 'profile', title: t('settings.secProfile'), keywords: 'avatar photo picture upload image',
          render: () => (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div
                className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center border-2 shrink-0"
                style={{ backgroundColor: 'var(--accent-10)', borderColor: 'var(--accent-ring)' }}
              >
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                    {user?.fullName?.[0] || '?'}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="btn btn-primary px-3 py-1.5 text-xs cursor-pointer" role="button" tabIndex={0}>
                  <Upload size={14} /> {t('settings.upload')}
                  <input type="file" accept="image/*" onChange={handleProfilePictureUpload} className="hidden" aria-label={t('settings.upload')} />
                </label>
                {profilePicture && (
                  <button onClick={handleDeleteProfilePicture} className="btn btn-danger px-3 py-1.5 text-xs">
                    <Trash2 size={14} /> {t('settings.remove')}
                  </button>
                )}
              </div>
            </div>
          ),
        },
        {
          id: 'language', title: t('settings.secLanguage'), keywords: 'ui interface language hindi telugu english भाषा భాష',
          render: () => (
            <div>
              <Field label={t('settings.lblUiLanguage')}>
                <Select value={settings.language} onChange={handleLanguageChange} options={SUPPORTED_LOCALES} ariaLabel={t('settings.lblUiLanguage')} />
              </Field>
              <div className="flex gap-2 mt-3">
                {SUPPORTED_LOCALES.map(locale => (
                  <button
                    key={locale.value}
                    onClick={() => handleLanguageChange(locale.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${settings.language === locale.value ? 'btn-soft' : 'btn-secondary'}`}
                    style={settings.language === locale.value ? { backgroundColor: 'var(--accent-10)', color: 'var(--accent)', borderColor: 'var(--accent-ring)' } : {}}
                    aria-pressed={settings.language === locale.value}
                  >
                    {locale.native}
                  </button>
                ))}
              </div>
            </div>
          ),
        },
        {
          id: 'preferences', title: t('settings.secPreferences'), keywords: 'animation translate chat history resume style privacy',
          render: () => (
            <>
              <Field label={t('settings.lblAutoTranslate')}>
                <Toggle value={settings.autoTranslate} onChange={v => update('autoTranslate', v)} label={t('settings.lblAutoTranslate')} />
              </Field>
              <Field label={t('settings.lblAnimations')}>
                <Toggle value={settings.animations} onChange={v => update('animations', v)} label={t('settings.lblAnimations')} />
              </Field>
              <Field label={t('settings.lblChatHistory')}>
                <Toggle value={settings.chatHistory} onChange={v => update('chatHistory', v)} label={t('settings.lblChatHistory')} />
              </Field>
              <Field label={t('settings.lblResumeStyle')}>
                <Select value={settings.defaultResumeStyle} onChange={v => update('defaultResumeStyle', v)} options={[
                  { value: 'professional', label: 'Professional' },
                  { value: 'modern', label: 'Modern' },
                  { value: 'creative', label: 'Creative' },
                ]} ariaLabel={t('settings.lblResumeStyle')} />
              </Field>
            </>
          ),
        },
      ],
    },
    {
      tab: 'ai',
      sections: [
        {
          id: 'ai-config', title: t('settings.secAi'), keywords: 'model groq llama temperature tokens ai',
          render: () => (
            <>
              <Field label={t('settings.lblModel')}>
                <Select value={settings.model} onChange={v => update('model', v)} options={GROQ_MODELS} ariaLabel={t('settings.lblModel')} />
              </Field>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-caption font-medium">{t('settings.lblTemperature')}</span>
                  <span className="text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>{settings.temperature.toFixed(1)}</span>
                </div>
                <RangeSlider value={settings.temperature} onChange={v => update('temperature', v)} min={0} max={2} step={0.1} ariaLabel={t('settings.lblTemperature')} />
                <p className="text-caption mt-1" style={{ color: 'var(--text-muted)' }}>{t('settings.hintTemp')}</p>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-caption font-medium">{t('settings.lblMaxTokens')}</span>
                  <span className="text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>{settings.maxTokens}</span>
                </div>
                <RangeSlider value={settings.maxTokens} onChange={v => update('maxTokens', v)} min={256} max={8192} step={256} ariaLabel={t('settings.lblMaxTokens')} />
                <p className="text-caption mt-1" style={{ color: 'var(--text-muted)' }}>{t('settings.hintTokens')}</p>
              </div>
            </>
          ),
        },
      ],
    },
    {
      tab: 'speech',
      sections: [
        {
          id: 'speech', title: t('settings.secSpeech'), keywords: 'voice rate pitch speak audio',
          render: () => (
            <>
              <Field label={t('settings.lblVoice')}>
                <select
                  value={settings.voiceName}
                  onChange={e => update('voiceName', e.target.value)}
                  className="select-field text-xs"
                  aria-label={t('settings.lblVoice')}
                >
                  <option value="">{t('settings.defaultVoice')}</option>
                  {voices.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
                </select>
              </Field>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-caption font-medium">{t('settings.lblSpeechRate')}</span>
                  <span className="text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>{settings.speechRate.toFixed(1)}x</span>
                </div>
                <RangeSlider value={settings.speechRate} onChange={v => update('speechRate', v)} min={0.5} max={2} step={0.1} ariaLabel={t('settings.lblSpeechRate')} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-caption font-medium">{t('settings.lblSpeechPitch')}</span>
                  <span className="text-xs tabular-nums" style={{ color: 'var(--text-secondary)' }}>{settings.speechPitch.toFixed(1)}</span>
                </div>
                <RangeSlider value={settings.speechPitch} onChange={v => update('speechPitch', v)} min={0.5} max={2} step={0.1} ariaLabel={t('settings.lblSpeechPitch')} />
              </div>
              <Field label={t('settings.lblAutoSpeak')}>
                <Toggle value={settings.autoSpeak} onChange={v => update('autoSpeak', v)} label={t('settings.lblAutoSpeak')} />
              </Field>
            </>
          ),
        },
      ],
    },
    {
      tab: 'theme',
      sections: [
        {
          id: 'theme', title: t('settings.secTheme'), keywords: 'dark light system mode appearance',
          render: () => (
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'dark', label: t('settings.themeDark'), icon: Moon },
                { id: 'light', label: t('settings.themeLight'), icon: Sun },
                { id: 'system', label: t('settings.themeSystem'), icon: Monitor },
              ].map(theme => {
                const Icon = theme.icon;
                const isActive = settings.theme === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => update('theme', theme.id)}
                    aria-pressed={isActive}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:-translate-y-0.5"
                    style={{
                      borderColor: isActive ? 'var(--accent)' : 'var(--border-default)',
                      backgroundColor: isActive ? 'var(--accent-10)' : 'var(--bg-input)',
                      boxShadow: isActive ? '0 0 0 1px var(--accent-ring)' : 'none',
                    }}
                  >
                    <Icon size={20} style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }} />
                    <span className="text-xs font-medium" style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }}>{theme.label}</span>
                  </button>
                );
              })}
            </div>
          ),
        },
        {
          id: 'accent', title: t('settings.secAccent'), keywords: 'color highlight buttons theme',
          render: () => (
            <div className="flex gap-3 flex-wrap">
              {ACCENT_COLORS.map(c => {
                const isActive = settings.accentColor === c.value;
                return (
                  <button
                    key={c.value}
                    onClick={() => update('accentColor', c.value)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${c.class}`}
                    style={{
                      boxShadow: isActive ? '0 0 0 3px var(--accent-ring)' : 'none',
                      transform: isActive ? 'scale(1.12)' : 'scale(1)',
                    }}
                    aria-label={c.label}
                    aria-pressed={isActive}
                  >
                    {isActive && <Check size={15} className="text-white" />}
                  </button>
                );
              })}
            </div>
          ),
        },
      ],
    },
    {
      tab: 'notifications',
      sections: [
        {
          id: 'notifications', title: t('settings.secNotif'), keywords: 'email notification alerts bell',
          render: () => (
            <>
              <Field label={t('settings.lblEmailNotif')}>
                <Toggle value={settings.notifications} onChange={v => update('notifications', v)} label={t('settings.lblEmailNotif')} />
              </Field>
              <div className="divider" />
              <Field label={t('settings.lblNotifResume')}>
                <Toggle value={subNotifs.resume} onChange={v => setSubNotifs(prev => ({ ...prev, resume: v }))} label={t('settings.lblNotifResume')} />
              </Field>
              <Field label={t('settings.lblNotifInterview')}>
                <Toggle value={subNotifs.interview} onChange={v => setSubNotifs(prev => ({ ...prev, interview: v }))} label={t('settings.lblNotifInterview')} />
              </Field>
              <Field label={t('settings.lblNotifCareer')}>
                <Toggle value={subNotifs.career} onChange={v => setSubNotifs(prev => ({ ...prev, career: v }))} label={t('settings.lblNotifCareer')} />
              </Field>
              <Field label={t('settings.lblNotifMarketing')}>
                <Toggle value={subNotifs.marketing} onChange={v => setSubNotifs(prev => ({ ...prev, marketing: v }))} label={t('settings.lblNotifMarketing')} />
              </Field>
            </>
          ),
        },
      ],
    },
    {
      tab: 'security',
      sections: [
        {
          id: 'password', title: t('settings.secPassword'), keywords: 'change password security login',
          render: () => (
            <div className="flex flex-col gap-3">
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handlePasswordUpdate(); }}
                placeholder={t('settings.pwPlaceholder')}
                className="input-field max-w-sm"
                aria-label={t('settings.pwPlaceholder')}
              />
              <div>
                <button onClick={handlePasswordUpdate} className="btn btn-primary px-4 py-2 text-xs">
                  <KeyRound size={14} /> {t('settings.pwUpdate')}
                </button>
                {passwordMsg && (
                  <p className={`text-xs mt-2 flex items-center gap-1.5 ${passwordType === 'success' ? 'badge-success' : 'badge-error'} chip`}>
                    {passwordType === 'success' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                    {passwordMsg}
                  </p>
                )}
              </div>
            </div>
          ),
        },
        {
          id: 'account', title: t('settings.secAccount'), keywords: 'export data logout delete account privacy',
          render: () => (
            <div className="flex flex-col gap-2">
              <button onClick={handleExportData} className="btn btn-secondary w-full sm:w-fit justify-start px-3 py-2.5 text-xs">
                <Download size={14} /> {t('settings.downloadData')}
              </button>
              <button
                onClick={async () => {
                  await fetchWithAuth('/auth/logout', { method: 'POST' }).catch(() => {});
                  localStorage.clear();
                  router.push('/auth');
                }}
                className="btn btn-secondary w-full sm:w-fit justify-start px-3 py-2.5 text-xs"
              >
                <LogOut size={14} /> {t('settings.logoutEverywhere')}
              </button>
              <div className="divider my-1" />
              <button onClick={handleDeleteAccount} className="btn btn-danger w-full sm:w-fit justify-start px-3 py-2.5 text-xs">
                <AlertTriangle size={14} /> {t('settings.deleteAccount')}
              </button>
            </div>
          ),
        },
      ],
    },
    {
      tab: 'shortcuts',
      sections: [
        {
          id: 'shortcuts', title: t('settings.secShortcuts'), keywords: 'keyboard hotkey ctrl shortcut',
          render: () => (
            <div className="space-y-1">
              {[
                { keys: 'Ctrl + /', label: t('settings.scToggle') },
                { keys: 'Ctrl + Enter', label: t('settings.scSend') },
                { keys: 'Esc', label: t('settings.scStop') },
                { keys: 'Ctrl + Shift + M', label: t('settings.scMute') },
                { keys: 'Ctrl + K', label: t('settings.scSearch') },
                { keys: 'Ctrl + Shift + N', label: t('settings.scNewChat') },
                { keys: 'Ctrl + ,', label: t('settings.scSettings') },
                { keys: 'Shift + Enter', label: t('settings.scNewline') },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-2 border-b last:border-0" style={{ borderColor: 'var(--border-subtle)' }}>
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                  <kbd className="kbd">{s.keys}</kbd>
                </div>
              ))}
            </div>
          ),
        },
      ],
    },
  ]), [settings, subNotifs, password, voices, profilePicture, user, t, animationsEnabled]);

  const searchTerms = searchQuery.trim().toLowerCase();

  const visibleGroups = useMemo(() => {
    if (!searchTerms) return null;
    return sectionGroups
      .map(group => ({
        tab: group.tab,
        sections: group.sections.filter(s =>
          s.title.toLowerCase().includes(searchTerms) ||
          s.keywords.toLowerCase().includes(searchTerms)
        ),
      }))
      .filter(group => group.sections.length > 0);
  }, [searchTerms, sectionGroups]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center gap-2 text-slate-400">
        <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid var(--accent)', borderTopColor: 'transparent' }} />
        <span className="text-sm">{t('common.loading')}</span>
      </div>
    </div>
  );

  const renderSection = (s: any) => s.render();

  return (
    <div className="max-w-4xl mx-auto py-4 px-1 sm:px-4">
      <motion.div initial={animationsEnabled ? { opacity: 0, y: -8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mb-6">
        <div className="flex items-center gap-3">
          <div className="icon-box" style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-10)' }}>
            <Settings size={16} />
          </div>
          <div>
            <h1 className="text-h1">{t('settings.title')}</h1>
            <p className="text-caption mt-0.5">{t('settings.subtitle')}</p>
          </div>
        </div>

        <div className="relative mt-5">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('settings.searchPlaceholder')}
            className="input-field pl-9"
            aria-label={t('settings.searchPlaceholder')}
          />
        </div>
      </motion.div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-thin pb-2 -mx-1 px-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors touch-manipulation"
              aria-pressed={isActive}
              style={{
                backgroundColor: isActive ? 'var(--accent-10)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              }}
            >
              <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      {visibleGroups ? (
        visibleGroups.length > 0 ? (
          <div className="space-y-6">
            {visibleGroups.map(group => (
              <div key={group.tab} className="space-y-4">
                <button
                  onClick={() => { setActiveTab(group.tab); setSearchQuery(''); }}
                  className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5"
                  style={{ color: 'var(--accent)' }}
                >
                  {tabs.find(t => t.id === group.tab)?.label}
                  <span className="chip badge-info">{group.sections.length}</span>
                </button>
                {group.sections.map(s => (
                  <Section key={s.id} icon={Eye} title={s.title}>{renderSection(s)}</Section>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="surface-card p-10 flex flex-col items-center gap-2 text-center">
            <Search size={24} style={{ color: 'var(--text-muted)' }} />
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t('settings.noResults')}</p>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {sectionGroups
            .filter(g => g.tab === activeTab)
            .flatMap(g => g.sections)
            .map(s => (
              <Section key={s.id} icon={(tabs.find(t => t.id === activeTab)?.icon) || Eye} title={s.title}>{renderSection(s)}</Section>
            ))}
        </div>
      )}

      <AnimatePresence>
        {saving && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full shadow-lg"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--on-accent)' }}
            role="status"
          >
            <div className="w-3 h-3 rounded-full animate-spin" style={{ border: '2px solid var(--on-accent)', borderTopColor: 'transparent' }} />
            {t('common.saving')}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-lg toast-enter"
            style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
            role="status"
            aria-live="polite"
          >
            {toast.type === 'success' ? <CheckCircle2 size={14} style={{ color: 'var(--success)' }} /> : <AlertTriangle size={14} style={{ color: 'var(--error)' }} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
