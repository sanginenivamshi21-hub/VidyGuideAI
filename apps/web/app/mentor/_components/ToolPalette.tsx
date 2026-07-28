'use client';

import { useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Compass, Briefcase, ScanSearch, X, Upload, ArrowRight } from 'lucide-react';

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

const TOOLS = [
  {
    id: 'resume-review' as const,
    icon: FileText,
    label: 'Resume Review',
    desc: 'Get ATS score and feedback on your resume',
    color: 'text-indigo-400',
    gradient: 'from-indigo-500/20 to-indigo-500/5',
    border: 'border-indigo-500/20 hover:border-indigo-500/40',
  },
  {
    id: 'career' as const,
    icon: Compass,
    label: 'Career Guidance',
    desc: 'Personalized career path recommendations',
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
  },
  {
    id: 'interview' as const,
    icon: Briefcase,
    label: 'Interview Prep',
    desc: 'Mock questions with AI feedback',
    color: 'text-violet-400',
    gradient: 'from-violet-500/20 to-violet-500/5',
    border: 'border-violet-500/20 hover:border-violet-500/40',
  },
  {
    id: 'ocr' as const,
    icon: ScanSearch,
    label: 'Scan Document',
    desc: 'Extract text from images and PDFs',
    color: 'text-amber-400',
    gradient: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-500/20 hover:border-amber-500/40',
  },
];

export default function ToolPalette({ onResult, isOpen, onClose, onOpen }: ToolPaletteProps) {
  const [activeTool, setActiveTool] = useState<ToolId>(null);

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
            <div className="rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50">
                <span className="text-xs font-bold text-white">Tools</span>
                <button onClick={onClose} className="p-1 rounded hover:bg-slate-800 text-slate-400">
                  <X size={14} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3">
                {TOOLS.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolSelect(tool.id)}
                      className={`flex flex-col items-start gap-2 p-3 rounded-xl border bg-gradient-to-br ${tool.gradient} ${tool.border} transition-all active:scale-[0.97] text-left`}
                    >
                      <Icon size={18} className={tool.color} />
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-white">{tool.label}</span>
                        <span className="text-[10px] text-slate-500 leading-tight">{tool.desc}</span>
                      </div>
                    </button>
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
              className="relative w-full sm:max-w-lg max-h-[85vh] bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50 shrink-0">
                <span className="text-sm font-bold text-white">
                  {TOOLS.find((t) => t.id === activeTool)?.label}
                </span>
                <button onClick={handleToolClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
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
