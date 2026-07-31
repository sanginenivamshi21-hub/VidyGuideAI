'use client';

import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Compass, Briefcase, ScanSearch, X } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

const ResumeReviewTool = lazy(() => import('./tools/ResumeReviewTool'));
const CareerTool = lazy(() => import('./tools/CareerTool'));
const InterviewTool = lazy(() => import('./tools/InterviewTool'));
const OcrTool = lazy(() => import('./tools/OcrTool'));

type ToolId = 'resume-review' | 'career' | 'interview' | 'ocr' | null;

interface ToolPaletteProps {
  onResult: (text: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export default function ToolPalette({ onResult, isOpen, onClose, onOpen }: ToolPaletteProps) {
  const { t } = useI18n();
  const [activeTool, setActiveTool] = useState<ToolId>(null);

  const TOOLS = [
    {
      id: 'resume-review' as const,
      icon: FileText,
      label: t('mentor.toolResume'),
      desc: t('mentor.toolResumeDesc'),
      color: 'var(--accent)',
      tint: 'var(--accent-10)',
    },
    {
      id: 'career' as const,
      icon: Compass,
      label: t('mentor.toolCareer'),
      desc: t('mentor.toolCareerDesc'),
      color: 'var(--accent)',
      tint: 'var(--accent-10)',
    },
    {
      id: 'interview' as const,
      icon: Briefcase,
      label: t('mentor.toolInterview'),
      desc: t('mentor.toolInterviewDesc'),
      color: 'var(--accent)',
      tint: 'var(--accent-10)',
    },
    {
      id: 'ocr' as const,
      icon: ScanSearch,
      label: t('mentor.toolOcr'),
      desc: t('mentor.toolOcrDesc'),
      color: 'var(--accent)',
      tint: 'var(--accent-10)',
    },
  ];

  const handleToolSelect = (toolId: ToolId) => {
    setActiveTool(toolId);
  };

  const handleToolComplete = (resultText: string) => {
    onResult(resultText);
    setActiveTool(null);
    onClose();
  };

  const handleToolClose = () => {
    setActiveTool(null);
  };

  const ToolComponent = activeTool === 'resume-review' ? ResumeReviewTool
    : activeTool === 'career' ? CareerTool
    : activeTool === 'interview' ? InterviewTool
    : activeTool === 'ocr' ? OcrTool
    : null;

  return (
    <>
      {/* Tool palette bottom sheet */}
      <AnimatePresence>
        {isOpen && activeTool === null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.15 }}
            className="px-3 pb-3"
          >
            <div
              className="rounded-2xl border overflow-hidden"
              style={{
                backgroundColor: 'var(--glass-bg-strong)',
                borderColor: 'var(--glass-border)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{t('mentor.tools')}</span>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg transition-colors touch-manipulation"
                  style={{ color: 'var(--text-tertiary)' }}
                  aria-label={t('mentor.close')}
                >
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3">
                {TOOLS.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <motion.button
                      key={tool.id}
                      onClick={() => handleToolSelect(tool.id)}
                      whileTap={{ scale: 0.96 }}
                      className="flex flex-col items-start gap-2 p-3 rounded-xl border text-left transition-colors touch-manipulation"
                      style={{ backgroundColor: tool.tint, borderColor: 'var(--accent-20)' }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent-20)' }}>
                        <Icon size={16} style={{ color: tool.color }} />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{tool.label}</span>
                        <span className="text-[10px] leading-tight" style={{ color: 'var(--text-tertiary)' }}>{tool.desc}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tool modal */}
      <AnimatePresence>
        {activeTool && ToolComponent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          >
            <div className="absolute inset-0 bg-black/60" onClick={handleToolClose} />
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full sm:max-w-lg max-h-[85vh] surface-modal rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ borderColor: 'var(--border-subtle)' }}>
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                  {TOOLS.find((tl) => tl.id === activeTool)?.label}
                </span>
                <button
                  onClick={handleToolClose}
                  className="p-1.5 rounded-lg transition-colors touch-manipulation"
                  style={{ color: 'var(--text-tertiary)' }}
                  aria-label={t('mentor.close')}
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <Suspense fallback={<div className="flex items-center justify-center py-12"><div className="w-5 h-5 rounded-full animate-spin" style={{ border: '2px solid var(--accent)', borderTopColor: 'transparent' }} /></div>}>
                  <ToolComponent onComplete={(text) => handleToolComplete(text)} />
                </Suspense>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
