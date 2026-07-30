'use client';

import { useState, useEffect } from 'react';
import { useSettings, GROQ_MODELS, LANGUAGES, ACCENT_COLORS, applyTheme, applyAccent } from '@/hooks/useSettings';
import { useRouter } from 'next/navigation';
import { api, fetchWithAuth } from '@/lib/api';
import { Palette, Volume2, Bell, Shield, Keyboard, Eye, GripVertical, Sun, Moon, Monitor, Check, Upload, Trash2, Download, LogOut, AlertTriangle } from 'lucide-react';
import { useAuth, useRequireRegistered } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { settings, updateSettings, loading, saving } = useSettings();
  const { isAuthenticated, user } = useAuth();
  useRequireRegistered();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [activeTab, setActiveTab] = useState('general');
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [subNotifs, setSubNotifs] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('vidyguide_subnotifs');
      if (stored) { try { return { resume: true, interview: true, career: true, marketing: false, ...JSON.parse(stored) }; } catch {} }
    }
    return { resume: true, interview: true, career: true, marketing: false };
  });

  useEffect(() => {
    localStorage.setItem('vidyguide_subnotifs', JSON.stringify(subNotifs));
  }, [subNotifs]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => setVoices(window.speechSynthesis.getVoices());
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      try { const p = JSON.parse(u).profilePicture; if (p) setProfilePicture(p); } catch {}
    }
  }, []);

  const update = (key: string, value: any) => {
    updateSettings({ [key]: value } as any);
    if (key === 'theme') applyTheme(value);
    if (key === 'accentColor') applyAccent(value);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Eye },
    { id: 'ai', label: 'AI Model', icon: GripVertical },
    { id: 'speech', label: 'Speech', icon: Volume2 },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
  ];

  const Section = ({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) => (
    <div className="surface-card p-5">
      <h3 className="text-h3 mb-1">{title}</h3>
      {desc && <p className="text-caption mb-4">{desc}</p>}
      <div className="space-y-3">{children}</div>
    </div>
  );

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-4">
      <span className="text-caption font-medium">{label}</span>
      <div className="w-48">{children}</div>
    </div>
  );

  const Select = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
    <select value={value} onChange={e => onChange(e.target.value)} className="input-field text-xs">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className="relative w-10 h-5 rounded-full transition-colors" style={{ backgroundColor: value ? 'var(--accent)' : 'rgba(51,65,85,0.5)' }}>
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );

  const RangeSlider = ({ value, onChange, min, max, step }: { value: number; onChange: (v: number) => void; min: number; max: number; step: number }) => (
    <div className="flex items-center gap-2">
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} className="flex-1 h-1 rounded-full appearance-none cursor-pointer" style={{ accentColor: 'var(--accent)' }} />
      <span className="text-xs text-slate-400 w-8 text-right">{value}</span>
    </div>
  );

  const handlePasswordUpdate = async () => {
    if (password.length < 6) { setPasswordMsg('Password must be at least 6 characters.'); return; }
    try {
      const data = await api('/users/profile', {
        method: 'PUT',
        body: { password },
      });
      setPasswordMsg(data.success ? 'Password updated successfully. All sessions invalidated.' : 'Failed to update password.');
      if (data.success) setPassword('');
    } catch { setPasswordMsg('Network error. Please try again.'); }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to permanently delete your account?\n\nThis action CANNOT be undone. All your data will be erased.')) return;
    if (!confirm('This will delete ALL your:\n- Profile & settings\n- Chat conversations\n- Career history\n- Resumes\n- OCR history\n\nAre you absolutely sure?')) return;
    try {
      const res = await fetchWithAuth('/users/account', { method: 'DELETE' });
      if (res.ok) {
        localStorage.clear();
        router.push('/auth');
      }
    } catch { setPasswordMsg('Failed to delete account. Please try again.'); }
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
      }
    } catch { setPasswordMsg('Export failed. Please try again.'); }
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
      }
    } catch {}
  };

  const handleDeleteProfilePicture = async () => {
    try {
      await fetchWithAuth('/users/profile/picture', { method: 'DELETE' });
      setProfilePicture('');
    } catch {}
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center gap-2 text-slate-400">
        <div className="w-4 h-4 rounded-full animate-spin" style={{ border: '2px solid var(--accent)', borderTopColor: 'transparent' }} />
        <span className="text-sm">Loading settings...</span>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Customize your VidyGuideAI experience</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-thin pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border"
              style={{
                  backgroundColor: isActive ? 'var(--accent-10)' : 'transparent',
                  color: isActive ? 'var(--accent)' : undefined,
                  borderColor: isActive ? 'var(--accent-ring)' : 'transparent',
                }}>
                <Icon size={14} /> {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {activeTab === 'general' && (
          <>
            <Section title="Profile Picture">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center border-2" style={{ borderColor: 'var(--accent-ring)' }}>
                  {profilePicture ? (
                    <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-slate-500 font-bold">
                      {user?.fullName?.[0] || '?'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <label className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer transition-colors" style={{ backgroundColor: 'var(--accent)' }}>
                    <Upload size={14} className="inline mr-1" />Upload
                    <input type="file" accept="image/*" onChange={handleProfilePictureUpload} className="hidden" />
                  </label>
                  {profilePicture && (
                    <button onClick={handleDeleteProfilePicture} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                      <Trash2 size={14} className="inline mr-1" />Remove
                    </button>
                  )}
                </div>
              </div>
            </Section>
            <Section title="Language" desc="Default language for AI responses">
              <Field label="UI Language">
                <Select value={settings.language} onChange={v => update('language', v)} options={LANGUAGES} />
              </Field>
            </Section>
            <Section title="Preferences">
              <Field label="Auto-translate">
                <Toggle value={settings.autoTranslate} onChange={v => update('autoTranslate', v)} />
              </Field>
              <Field label="Enable animations">
                <Toggle value={settings.animations} onChange={v => update('animations', v)} />
              </Field>
              <Field label="Save chat history">
                <Toggle value={settings.chatHistory} onChange={v => update('chatHistory', v)} />
              </Field>
              <Field label="Default resume style">
                <Select value={settings.defaultResumeStyle} onChange={v => update('defaultResumeStyle', v)} options={[
                  { value: 'professional', label: 'Professional' },
                  { value: 'modern', label: 'Modern' },
                  { value: 'creative', label: 'Creative' },
                ]} />
              </Field>
            </Section>
          </>
        )}

        {activeTab === 'ai' && (
          <Section title="AI Model Configuration" desc="Select the AI model and adjust response parameters">
            <Field label="Model">
              <Select value={settings.model} onChange={v => update('model', v)} options={GROQ_MODELS} />
            </Field>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400 font-medium">Temperature</span>
                <span className="text-xs text-slate-500">{settings.temperature.toFixed(1)}</span>
              </div>
              <RangeSlider value={settings.temperature} onChange={v => update('temperature', v)} min={0} max={2} step={0.1} />
              <p className="text-[10px] text-slate-600 mt-1">Lower = precise, higher = creative</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400 font-medium">Max tokens</span>
                <span className="text-xs text-slate-500">{settings.maxTokens}</span>
              </div>
              <RangeSlider value={settings.maxTokens} onChange={v => update('maxTokens', v)} min={256} max={8192} step={256} />
              <p className="text-[10px] text-slate-600 mt-1">Controls response length</p>
            </div>
          </Section>
        )}

        {activeTab === 'speech' && (
          <Section title="Speech Settings" desc="Configure voice input and output">
            <Field label="Voice">
              <select value={settings.voiceName} onChange={e => update('voiceName', e.target.value)} className="w-full bg-slate-800 text-slate-200 text-xs rounded-lg px-3 py-2 outline-none border border-slate-700 transition-colors">
                <option value="">Default voice</option>
                {voices.map(v => <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>)}
              </select>
            </Field>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400 font-medium">Speech rate</span>
                <span className="text-xs text-slate-500">{settings.speechRate.toFixed(1)}x</span>
              </div>
              <RangeSlider value={settings.speechRate} onChange={v => update('speechRate', v)} min={0.5} max={2} step={0.1} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400 font-medium">Speech pitch</span>
                <span className="text-xs text-slate-500">{settings.speechPitch.toFixed(1)}</span>
              </div>
              <RangeSlider value={settings.speechPitch} onChange={v => update('speechPitch', v)} min={0.5} max={2} step={0.1} />
            </div>
            <Field label="Auto-speak responses">
              <Toggle value={settings.autoSpeak} onChange={v => update('autoSpeak', v)} />
            </Field>
          </Section>
        )}

        {activeTab === 'theme' && (
          <>
            <Section title="Theme" desc="Choose your preferred look">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'system', label: 'System', icon: Monitor },
                ].map(theme => {
                  const Icon = theme.icon;
                  const isActive = settings.theme === theme.id;
                  return (
                    <button key={theme.id} onClick={() => update('theme', theme.id)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all"
                      style={{
                        borderColor: isActive ? 'var(--accent)' : 'rgba(51,65,85,0.5)',
                        backgroundColor: isActive ? 'var(--accent-10)' : 'transparent',
                        boxShadow: isActive ? `0 0 0 1px var(--accent-ring)` : 'none',
                      }}>
                      <Icon size={20} style={{ color: isActive ? 'var(--accent)' : 'rgba(148,163,184,1)' }} />
                      <span className="text-xs font-medium" style={{ color: isActive ? 'var(--accent)' : 'rgba(148,163,184,1)' }}>{theme.label}</span>
                    </button>
                  );
                })}
              </div>
            </Section>
            <Section title="Accent Color" desc="Change buttons, links, and highlights">
              <div className="flex gap-3 flex-wrap">
                {ACCENT_COLORS.map(c => {
                  const isActive = settings.accentColor === c.value;
                  return (
                    <button key={c.value} onClick={() => update('accentColor', c.value)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${c.class}`}
                      style={{
                        boxShadow: isActive ? '0 0 0 3px rgba(255,255,255,0.3)' : 'none',
                        transform: isActive ? 'scale(1.15)' : 'scale(1)',
                      }}>
                      {isActive && <Check size={14} className="text-white" />}
                    </button>
                  );
                })}
              </div>
            </Section>
          </>
        )}

        {activeTab === 'notifications' && (
          <Section title="Notification Preferences" desc="Choose what notifications you receive">
            <Field label="Email notifications">
              <Toggle value={settings.notifications} onChange={v => update('notifications', v)} />
            </Field>
            <Field label="Resume ready">
              <Toggle value={subNotifs.resume} onChange={v => setSubNotifs(prev => ({ ...prev, resume: v }))} />
            </Field>
            <Field label="Interview complete">
              <Toggle value={subNotifs.interview} onChange={v => setSubNotifs(prev => ({ ...prev, interview: v }))} />
            </Field>
            <Field label="Career suggestions">
              <Toggle value={subNotifs.career} onChange={v => setSubNotifs(prev => ({ ...prev, career: v }))} />
            </Field>
            <Field label="Marketing updates">
              <Toggle value={subNotifs.marketing} onChange={v => setSubNotifs(prev => ({ ...prev, marketing: v }))} />
            </Field>
          </Section>
        )}

        {activeTab === 'security' && (
          <>
            <Section title="Change Password" desc="Update your account password. This will invalidate all existing sessions.">
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password (min 6 chars)" className="input-field" />
              <button onClick={handlePasswordUpdate} className="px-4 py-1.5 text-white text-xs font-semibold rounded-lg transition-colors" style={{ backgroundColor: 'var(--accent)' }}>Update Password</button>
              {passwordMsg && <p className="text-xs text-slate-400">{passwordMsg}</p>}
            </Section>
            <Section title="Account Management">
              <button onClick={handleExportData} className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors flex items-center gap-2">
                <Download size={14} /> Download my data (JSON)
              </button>
              <button onClick={() => {
                fetchWithAuth('/auth/logout', { method: 'POST' }).catch(() => {});
                localStorage.clear();
                router.push('/auth');
              }} className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors flex items-center gap-2">
                <LogOut size={14} /> Logout everywhere
              </button>
              <div className="border-t border-slate-800 pt-3 mt-3">
                <button onClick={handleDeleteAccount} className="btn-danger w-full text-left px-3 py-2 text-xs flex items-center gap-2">
                  <AlertTriangle size={14} /> Delete account permanently
                </button>
              </div>
            </Section>
          </>
        )}

        {activeTab === 'shortcuts' && (
          <Section title="Keyboard Shortcuts">
            <div className="space-y-2">
              {[
                { keys: 'Ctrl + /', label: 'Toggle shortcuts dialog' },
                { keys: 'Ctrl + Enter', label: 'Send message' },
                { keys: 'Esc', label: 'Stop generation / Close dialog' },
                { keys: 'Ctrl + Shift + M', label: 'Mute/unmute speech' },
                { keys: 'Ctrl + K', label: 'Search conversations' },
                { keys: 'Ctrl + Shift + N', label: 'New chat' },
                { keys: 'Ctrl + ,', label: 'Open settings' },
                { keys: 'Shift + Enter', label: 'New line in input' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-800/30 last:border-0">
                  <span className="text-xs text-slate-400">{s.label}</span>
                  <kbd className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-300 font-mono">{s.keys}</kbd>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {saving && (
        <div className="fixed bottom-6 right-6 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-50" style={{ backgroundColor: 'var(--accent)' }}>
          <div className="w-3 h-3 rounded-full animate-spin" style={{ border: '2px solid white', borderTopColor: 'transparent' }} />
          Saving...
        </div>
      )}
    </div>
  );
}
