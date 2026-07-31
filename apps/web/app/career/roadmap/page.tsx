'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Map, ArrowRight, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useI18n } from '@/lib/i18n';
import { useAnimationsEnabled } from '@/hooks/useAnimations';

export default function CareerRoadmapPage() {
  const { t } = useI18n();
  const animationsEnabled = useAnimationsEnabled();
  const [text, setText] = useState('');
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parsed, setParsed] = useState(false);

  const handleParse = async () => {
    if (!text.trim()) {
      setError(t('roadmap.errorEmpty'));
      return;
    }

    setError('');
    setLoading(true);
    setParsed(false);
    setMilestones([]);

    try {
      const data = await api('/career/roadmap', {
        method: 'POST',
        body: { text },
      });

      setMilestones(data.milestones || []);
      setParsed(true);
      if (data.milestones.length === 0) {
        setError(t('roadmap.errorNone'));
      }
    } catch (err: any) {
      setError(err.message || t('roadmap.errorConnection'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={animationsEnabled ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-8 max-w-5xl mx-auto py-4"
    >
      <div className="flex items-center gap-4">
        <div className="icon-box" style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-10)' }}>
          <Map size={20} />
        </div>
        <div className="flex flex-col">
          <h1 className="text-h1">{t('roadmap.title')}</h1>
          <p className="text-caption mt-0.5">{t('roadmap.subtitle')}</p>
        </div>
      </div>

      <div className="surface-card p-6">
        <div className="flex flex-col gap-1.5">
          <label className="label">{t('roadmap.pasteLabel')}</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t('roadmap.pastePlaceholder')}
            rows={8}
            className="input-field min-h-[160px] resize-none"
          />
        </div>

        {error && (
          <div className="alert alert-danger mt-4">
            <AlertCircle size={14} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button onClick={handleParse} disabled={loading} className="btn btn-primary mt-5 w-fit">
          {loading ? (
            <>
              <RefreshCw className="animate-spin" size={16} />
              {t('roadmap.generating')}
            </>
          ) : (
            <>
              <Sparkles size={16} />
              {t('roadmap.visualize')}
            </>
          )}
        </button>
      </div>

      {parsed && milestones.length > 0 && (
        <motion.div
          initial={animationsEnabled ? { opacity: 0, y: 14 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="surface-elevated p-6"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xl">🗺️</span>
              <div>
                <h4 className="text-h4">{t('roadmap.visualTitle')}</h4>
                <p className="text-caption">{t('roadmap.visualSubtitle')}</p>
              </div>
            </div>
            <div className="badge badge-accent">{milestones.length} {t('roadmap.milestones')}</div>
          </div>

          <div className="overflow-x-auto pb-4 flex gap-4 pr-4 mt-6">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex items-center shrink-0">
                <div className="w-[200px] surface-card rounded-xl p-4 flex flex-col gap-3 relative card-hover">
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded w-fit"
                    style={{ backgroundColor: `${m.color}15`, color: m.color, border: `1px solid ${m.color}25` }}
                  >
                    {m.label}
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg mt-0.5">{m.icon}</span>
                    <div className="text-xs font-semibold leading-normal line-clamp-3" style={{ color: 'var(--text-primary)' }}>
                      {m.title}
                    </div>
                  </div>
                </div>
                {idx < milestones.length - 1 && (
                  <ArrowRight size={18} className="shrink-0 mx-2" style={{ color: 'var(--border-default)' }} />
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t pt-4 text-[10px] font-semibold font-mono" style={{ borderColor: 'var(--border-default)', color: 'var(--text-tertiary)' }}>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#5B9BD5]" /> Learn</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#3DDC84]" /> Job</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#F0A500]" /> Build</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#2ECC71]" /> Salary</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#E74C3C]" /> Exam</div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#C07FF0]" /> Intern</div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
