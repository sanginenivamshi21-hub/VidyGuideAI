'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import {
  Briefcase, Sparkles, RefreshCw, Send, CheckCircle2, ArrowRight, AlertCircle,
  BrainCircuit, ThumbsUp, Award, RotateCcw,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useAnimationsEnabled } from '@/hooks/useAnimations';

interface QuestionFeedback {
  score: number;
  content: string;
}

const STAGE_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

export default function InterviewPrepPage() {
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Entry Level');
  const [difficulty, setDifficulty] = useState('Medium');

  const [stage, setStage] = useState<'setup' | 'question' | 'evaluation' | 'completed'>('setup');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<QuestionFeedback[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');
  const { t } = useI18n();
  const animationsEnabled = useAnimationsEnabled();

  const parseScore = (text: string): number => {
    const match = text.match(/Score:\s*(\d+)\/10/i) || text.match(/(\d+)\s*\/\s*10/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      return Math.min(Math.max(parsed, 0), 10);
    }
    return 7;
  };

  const handleStartInterview = async () => {
    if (!role.trim()) {
      setError('Please specify a target job role.');
      return;
    }
    setError('');
    setLoading(true);
    setQuestions([]);
    setAnswers([]);
    setFeedbacks([]);
    setCurrentIndex(0);
    setCurrentAnswer('');

    try {
      const data = await api('/mentor/interview', {
        method: 'POST',
        body: { role, company, skills, experience_level: experienceLevel, difficulty },
      });
      const generatedQuestions = data.questions || [];
      if (generatedQuestions.length === 0) {
        throw new Error('No interview questions returned. Please try again.');
      }
      setQuestions(generatedQuestions);
      setStage('question');
    } catch (err: any) {
      setError(err.message || "🚫 Something went wrong. We couldn't process your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!currentAnswer.trim()) {
      setError('Please provide your answer response before evaluating.');
      return;
    }
    setError('');
    setEvaluating(true);
    try {
      const currentQuestion = questions[currentIndex];
      const data = await api('/mentor/interview/feedback', {
        method: 'POST',
        body: { items: [{ question: currentQuestion, answer: currentAnswer }] },
      });
      const feedbackText = data.feedback || '';
      const score = parseScore(feedbackText);
      const updatedFeedbacks = [...feedbacks];
      updatedFeedbacks[currentIndex] = { score, content: feedbackText };
      setFeedbacks(updatedFeedbacks);
      const updatedAnswers = [...answers];
      updatedAnswers[currentIndex] = currentAnswer;
      setAnswers(updatedAnswers);
      setStage('evaluation');
    } catch (err: any) {
      setError(err.message || '🚫 Evaluation failed. Please check network connection and try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentAnswer('');
      setError('');
      setStage('question');
    } else {
      saveToHistory();
      setStage('completed');
    }
  };

  const saveToHistory = async () => {
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const parsedUser = JSON.parse(user);
        if (parsedUser.id !== null) {
          const avgScore = feedbacks.reduce((acc, f) => acc + f.score, 0) / feedbacks.length;
          await api('/history', {
            method: 'POST',
            body: {
              actionType: 'interview',
              title: `Interview Simulation - ${role} at ${company || 'General MNC'}`,
              payload: { role, company, difficulty, experienceLevel, questionsCount: questions.length, averageScore: avgScore.toFixed(1) },
              result: feedbacks.map((f, i) => `Q: ${questions[i]}\nAnswer: ${answers[i]}\nScore: ${f.score}/10\nFeedback: ${f.content}`).join('\n\n'),
            },
          });
        }
      }
    } catch (e) {
      console.error('Failed to log interview simulation into history:', e);
    }
  };

  const handleRestart = () => {
    setStage('setup');
    setQuestions([]);
    setAnswers([]);
    setFeedbacks([]);
    setCurrentIndex(0);
    setCurrentAnswer('');
    setError('');
  };

  const getAverageScore = () => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / feedbacks.length) * 10;
  };

  const stageProps = animationsEnabled ? { initial: 'hidden' as const, animate: 'show' as const, variants: STAGE_VARIANTS } : {};

  return (
    <motion.div
      initial={animationsEnabled ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-6 max-w-4xl mx-auto py-4"
    >
      <div className="flex items-center gap-4">
        <div className="icon-box" style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-10)' }}>
          <Briefcase size={20} />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-h1 flex items-center gap-2 flex-wrap">
            {t('interview.title')}
            <span className="chip badge-success uppercase tracking-wider text-[9px]">{t('interview.turnBased')}</span>
          </h1>
          <p className="text-caption">{t('interview.subtitle')}</p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={animationsEnabled ? { opacity: 0, y: -6 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="alert alert-error"
            role="alert"
          >
            <AlertCircle size={16} className="shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {stage === 'setup' && (
        <motion.div {...stageProps} className="glass surface-card p-6 sm:p-8 flex flex-col gap-6">
          <div className="flex items-center gap-2 font-bold text-h2 pb-3" style={{ borderBottom: '1px solid var(--border-default)' }}>
            <BrainCircuit size={18} style={{ color: 'var(--accent)' }} />
            {t('interview.customize')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="iv-role" className="label">{t('interview.role')}</label>
              <input id="iv-role" type="text" required value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Frontend Engineer, UPSC Aspirant, SBI Clerk" className="input-field text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="iv-company" className="label">{t('interview.company')}</label>
              <input id="iv-company" type="text" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google, TCS, SBI, Police Recruitment" className="input-field text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="iv-skills" className="label">{t('interview.skills')}</label>
              <input id="iv-skills" type="text" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. React, Python, Data structures, Customer care" className="input-field text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="iv-level" className="label">{t('interview.experience')}</label>
                <select id="iv-level" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)} className="select-field text-sm">
                  <option>Entry Level</option>
                  <option>Mid Level</option>
                  <option>Senior Level</option>
                  <option>Executive</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="iv-difficulty" className="label">{t('interview.difficulty')}</label>
                <select id="iv-difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="select-field text-sm">
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>
          </div>

          <motion.button
            whileTap={animationsEnabled ? { scale: 0.99 } : undefined}
            onClick={handleStartInterview}
            disabled={loading}
            className="btn btn-primary w-full md:w-auto px-8 py-3 text-sm h-12 self-center mt-2"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                <span>{t('interview.simulating')}</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>{t('interview.begin')}</span>
              </>
            )}
          </motion.button>
        </motion.div>
      )}

      {stage === 'question' && (
        <motion.div {...stageProps} className="flex flex-col gap-6">
          <div className="surface-card rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold">
            <span style={{ color: 'var(--text-secondary)' }}>
              {t('interview.questionXofY', { n: currentIndex + 1, total: questions.length })}
            </span>
            <div className="flex items-center gap-1.5 w-full sm:w-40">
              {questions.map((_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 h-1.5 rounded-full overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-tertiary)' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: i === currentIndex ? 'var(--accent)' : i < currentIndex ? 'var(--accent-dark)' : 'var(--bg-tertiary)' }}
                    initial={i <= currentIndex && animationsEnabled ? { width: 0 } : false}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass surface-card p-6 sm:p-8 flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full shrink-0 text-sm font-extrabold" style={{ backgroundColor: 'var(--accent-10)', color: 'var(--accent)', border: '1px solid var(--accent-ring)' }}>
                Q
              </span>
              <h2 className="text-base sm:text-lg font-bold leading-normal pt-0.5" style={{ color: 'var(--text-primary)' }}>
                {questions[currentIndex]}
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                <span>{t('interview.answer')}</span>
                <span style={{ color: currentAnswer.length > 150 ? 'var(--accent)' : 'var(--text-muted)' }}>
                  {currentAnswer.length} {t('interview.chars')}
                </span>
              </div>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder={t('interview.answerPlaceholder')}
                rows={6}
                className="input-field text-sm p-4 leading-relaxed resize-none"
                aria-label={t('interview.answer')}
              />
            </div>

            <div className="flex justify-between items-center pt-2 gap-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <button onClick={handleRestart} className="btn btn-secondary px-4 py-2 text-xs">
                {t('interview.quit')}
              </button>
              <button
                onClick={handleEvaluateAnswer}
                disabled={evaluating || !currentAnswer.trim()}
                className="btn btn-primary px-6 py-2.5 text-xs"
              >
                {evaluating ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    <span>{t('interview.evaluating')}</span>
                  </>
                ) : (
                  <>
                    <Send size={12} />
                    <span>{t('interview.evaluate')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {stage === 'evaluation' && feedbacks[currentIndex] && (
        <motion.div {...stageProps} className="flex flex-col gap-6">
          <div className="surface-card rounded-2xl p-6 flex flex-col gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none" style={{ color: 'var(--text-muted)' }}>
              {t('interview.questionEvaluated')}
            </span>
            <h3 className="text-sm font-semibold leading-normal" style={{ color: 'var(--text-primary)' }}>
              {questions[currentIndex]}
            </h3>
          </div>

          <div className="glass surface-card p-6 sm:p-8 flex flex-col gap-6 relative">
            <div className="flex items-center justify-between gap-3 pb-4 flex-wrap" style={{ borderBottom: '1px solid var(--border-default)' }}>
              <span className="text-md font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <ThumbsUp size={16} style={{ color: 'var(--accent)' }} />
                {t('interview.liveFeedback')}
              </span>
              <div className="chip badge-success text-sm font-extrabold px-4 py-2">
                <span>{t('interview.score')}:</span>
                <span className="text-base tabular-nums">{feedbacks[currentIndex].score}</span>
                <span className="opacity-60 text-xs">/ 10</span>
              </div>
            </div>

            <div
              className="text-sm leading-relaxed whitespace-pre-wrap break-words p-6 rounded-2xl select-text"
              style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
            >
              {feedbacks[currentIndex].content}
            </div>

            <div className="flex justify-between items-center pt-2 gap-3">
              <button onClick={handleRestart} className="btn btn-secondary px-4 py-2 text-xs">
                {t('interview.end')}
              </button>
              <button onClick={handleNext} className="btn btn-primary px-6 py-2.5 text-xs">
                <span>{currentIndex < questions.length - 1 ? t('interview.next') : t('interview.finish')}</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {stage === 'completed' && (
        <motion.div {...stageProps} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass surface-card p-6 flex flex-col items-center justify-center text-center gap-3 col-span-1">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {t('interview.avgScore')}
              </span>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="transparent" strokeWidth="10" stroke="var(--bg-tertiary)" />
                  <motion.circle
                    cx="64" cy="64" r="56"
                    fill="transparent"
                    strokeWidth="10"
                    stroke="var(--accent)"
                    strokeLinecap="round"
                    initial={animationsEnabled ? { strokeDashoffset: 351.8 } : false}
                    animate={{ strokeDashoffset: 351.8 - (351.8 * getAverageScore()) / 100 }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                    strokeDasharray={351.8}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {(getAverageScore() / 10).toFixed(1)}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {t('interview.outOf10')}
                  </span>
                </div>
              </div>
              <p className="text-xs mt-1.5 px-4" style={{ color: 'var(--text-secondary)' }}>
                {t('interview.excellentProgression', { n: questions.length })}
              </p>
            </div>

            <div className="glass surface-card p-6 col-span-2 flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-widest pb-2" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)' }}>
                {t('interview.sessionParams')}
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex flex-col gap-1 p-3.5 rounded-xl" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                  <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('interview.role')}</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{role}</span>
                </div>
                <div className="flex flex-col gap-1 p-3.5 rounded-xl" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                  <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('interview.company')}</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{company || 'General MNC'}</span>
                </div>
                <div className="flex flex-col gap-1 p-3.5 rounded-xl" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                  <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('interview.difficulty')}</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{difficulty}</span>
                </div>
                <div className="flex flex-col gap-1 p-3.5 rounded-xl" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                  <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('interview.experience')}</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{experienceLevel}</span>
                </div>
              </div>
              <div className="alert alert-success text-xs font-semibold mt-1">
                <Award size={14} className="shrink-0" />
                <span>{t('interview.logged')}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-md font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} />
              {t('interview.logs')}
            </h3>

            <div className="flex flex-col gap-4">
              {questions.map((q, idx) => (
                <motion.div
                  key={idx}
                  initial={animationsEnabled ? { opacity: 0, y: 12 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx, duration: 0.25 }}
                  className="surface-card rounded-2xl overflow-hidden"
                >
                  <div className="p-4 flex items-center justify-between gap-3 text-xs" style={{ backgroundColor: 'var(--bg-input)', borderBottom: '1px solid var(--border-default)' }}>
                    <span className="font-bold" style={{ color: 'var(--text-secondary)' }}>
                      {t('interview.questionXofY', { n: idx + 1, total: questions.length })}
                    </span>
                    <span className="chip badge-success font-extrabold">
                      {t('interview.score')}: {feedbacks[idx]?.score}/10
                    </span>
                  </div>
                  <div className="p-5 flex flex-col gap-4 text-xs leading-relaxed">
                    <div className="flex flex-col gap-1 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('interview.questionAsked')}</span>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{q}</p>
                    </div>
                    <div className="flex flex-col gap-1 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)' }}>
                      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('interview.yourAnswer')}</span>
                      <p className="italic break-words" style={{ color: 'var(--text-secondary)' }}>{answers[idx]}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{t('interview.evaluation')}</span>
                      <div className="p-4 rounded-lg whitespace-pre-wrap select-text break-words leading-normal" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                        {feedbacks[idx]?.content}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <button onClick={handleRestart} className="btn btn-primary px-8 py-3.5 text-sm self-center w-fit">
            <RotateCcw size={16} />
            <span>{t('interview.restart')}</span>
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
