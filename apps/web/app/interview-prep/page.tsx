'use client';

import { useState } from 'react';
import { 
  Briefcase, 
  Sparkles, 
  RefreshCw, 
  Send, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle, 
  ChevronRight, 
  BrainCircuit, 
  ThumbsUp, 
  ThumbsDown, 
  Award, 
  RotateCcw,
  Sparkle
} from 'lucide-react';

interface QuestionFeedback {
  score: number;
  content: string;
}

export default function InterviewPrepPage() {
  // Setup inputs
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Entry Level');
  const [difficulty, setDifficulty] = useState('Medium');

  // Interview state
  const [stage, setStage] = useState<'setup' | 'question' | 'evaluation' | 'completed'>('setup');
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [feedbacks, setFeedbacks] = useState<QuestionFeedback[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Input states
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState('');

  // Helper to extract score from AI feedback string
  const parseScore = (text: string): number => {
    const match = text.match(/Score:\s*(\d+)\/10/i) || text.match(/(\d+)\s*\/\s*10/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      return Math.min(Math.max(parsed, 0), 10);
    }
    return 7; // Default fallback score
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
      const resp = await fetch('http://localhost:8000/mentor/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          role,
          company,
          skills,
          experience_level: experienceLevel,
          difficulty,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Failed to generate interview questions.');
      }

      const generatedQuestions = data.questions || [];
      if (generatedQuestions.length === 0) {
        throw new Error('No interview questions returned. Please try again.');
      }

      setQuestions(generatedQuestions);
      setStage('question');
    } catch (err: any) {
      setError(err.message || '🚫 Something went wrong. We couldn\'t process your request. Please try again.');
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
      const resp = await fetch('http://localhost:8000/mentor/interview/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: [{ question: currentQuestion, answer: currentAnswer }]
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Answer evaluation failed.');
      }

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
      // Save full interview session to database history
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
          // Average score calculation
          const avgScore = feedbacks.reduce((acc, f) => acc + f.score, 0) / feedbacks.length;
          
          await fetch('http://localhost:8000/history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              actionType: 'interview',
              title: `Interview Simulation - ${role} at ${company || 'General MNC'}`,
              payload: {
                role,
                company,
                difficulty,
                experienceLevel,
                questionsCount: questions.length,
                averageScore: avgScore.toFixed(1)
              },
              result: feedbacks.map((f, i) => `Q: ${questions[i]}\nAnswer: ${answers[i]}\nScore: ${f.score}/10\nFeedback: ${f.content}`).join('\n\n')
            }),
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

  // Helper to calculate total average score
  const getAverageScore = () => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / feedbacks.length) * 10; // convert to percentage
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4 select-none">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-2xl text-violet-400 text-2xl shadow-inner">
          💼
        </div>
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Interview Preparation <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full px-2 py-0.5 font-bold uppercase tracking-wider">Turn-based Simulator</span>
          </h1>
          <p className="text-slate-400 text-xs">
            Experience premium interactive mock sessions tailored for Indian MNCs and civil services.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center gap-3 animate-fadeIn">
          <AlertCircle size={16} className="shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="font-bold">{error}</span>
            <span className="opacity-80">You can try resubmitting or restart the process if the issue persists.</span>
          </div>
        </div>
      )}

      {/* STAGE: SETUP FORM */}
      {stage === 'setup' && (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl flex flex-col gap-6 animate-fadeIn">
          <div className="flex items-center gap-2 text-white font-bold text-lg border-b border-slate-800 pb-3">
            <BrainCircuit size={18} className="text-emerald-400" />
            Customize Interview Session
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Job Role / Exam</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Frontend Engineer, UPSC Aspirant, SBI Clerk"
                className="w-full bg-slate-950/80 border border-slate-855 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Target Company / Department</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Google, TCS, SBI, Police Recruitment"
                className="w-full bg-slate-950/80 border border-slate-855 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Key Skills & Experience Areas</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. React, Python, Data structures, Customer care"
                className="w-full bg-slate-950/80 border border-slate-855 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-855 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm transition-all"
                >
                  <option>Entry Level</option>
                  <option>Mid Level</option>
                  <option>Senior Level</option>
                  <option>Executive</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-855 hover:border-slate-700 focus:border-emerald-500 text-white rounded-xl p-3 outline-none text-sm transition-all"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartInterview}
            disabled={loading}
            className="w-full md:w-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 h-[48px] self-center mt-4"
          >
            {loading ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                <span>Simulating interview setup...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Begin Simulation Session</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* STAGE: ACTIVE INTERVIEW QUESTION */}
      {stage === 'question' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Progress Tracker */}
          <div className="bg-slate-950/40 border border-slate-855 rounded-2xl p-4 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-400">Question {currentIndex + 1} of {questions.length}</span>
            <div className="flex items-center gap-1.5">
              {questions.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2.5 h-2.5 rounded-full border transition-all ${
                    i === currentIndex 
                      ? 'bg-emerald-400 border-emerald-400 shadow-lg shadow-emerald-400/40' 
                      : i < currentIndex 
                      ? 'bg-emerald-950 border-emerald-600' 
                      : 'bg-slate-900 border-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Question Text block */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold text-sm border border-emerald-500/20 shrink-0">
                Q
              </span>
              <h2 className="text-lg font-bold text-white leading-normal pt-0.5">
                {questions[currentIndex]}
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                <span>Write Your Response Answer</span>
                <span className={`${currentAnswer.length > 150 ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {currentAnswer.length} characters
                </span>
              </div>
              <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="Type your structured, detailed interview answer response here. Take your time..."
                rows={6}
                className="w-full bg-slate-950/80 border border-slate-855 hover:border-slate-700 focus:border-emerald-500 text-white text-sm rounded-xl p-4 outline-none resize-none transition-all leading-relaxed"
              />
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-slate-950 border border-slate-855 hover:border-slate-800 text-slate-400 rounded-lg hover:text-white transition-all text-xs font-semibold"
              >
                Quit Session
              </button>
              
              <button
                onClick={handleEvaluateAnswer}
                disabled={evaluating || !currentAnswer.trim()}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
              >
                {evaluating ? (
                  <>
                    <RefreshCw className="animate-spin" size={14} />
                    <span>Evaluating answer...</span>
                  </>
                ) : (
                  <>
                    <Send size={12} />
                    <span>Evaluate & Continue</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE: TURN EVALUATION FEEDBACK */}
      {stage === 'evaluation' && feedbacks[currentIndex] && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Question display */}
          <div className="bg-slate-950/40 border border-slate-855 rounded-2xl p-6 flex flex-col gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Question evaluated</span>
            <h3 className="text-sm font-semibold text-slate-200 leading-normal">{questions[currentIndex]}</h3>
          </div>

          {/* Evaluation Report block */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-md shadow-2xl flex flex-col gap-6 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <span className="text-md font-bold text-white flex items-center gap-2">
                <ThumbsUp size={16} className="text-emerald-400" />
                Live Evaluation Feedback
              </span>
              
              {/* Score bubble badge */}
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold rounded-xl px-4 py-2 text-sm">
                <span>Score:</span>
                <span className="text-base">{feedbacks[currentIndex].score}</span>
                <span className="opacity-60 text-xs">/ 10</span>
              </div>
            </div>

            {/* Rendered feedback Markdown */}
            <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans break-words bg-slate-950/40 border border-slate-855 p-6 rounded-2xl select-text">
              {feedbacks[currentIndex].content}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-slate-950 border border-slate-855 hover:border-slate-800 text-slate-400 rounded-lg hover:text-white transition-all text-xs font-semibold"
              >
                End Session
              </button>

              <button
                onClick={handleNext}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Simulation'}</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE: COMPLETED REPORT SUMMARY */}
      {stage === 'completed' && (
        <div className="flex flex-col gap-8 animate-fadeIn">
          {/* Overall performance Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Score circle gauge */}
            <div className="bg-slate-900/40 border border-slate-855 rounded-3xl p-6 backdrop-blur-md flex flex-col items-center justify-center text-center gap-3 col-span-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Average Score</span>
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    className="stroke-slate-800 fill-transparent"
                    strokeWidth="10"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    className="stroke-emerald-500 fill-transparent"
                    strokeWidth="10"
                    strokeDasharray={351.8}
                    strokeDashoffset={351.8 - (351.8 * getAverageScore()) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-white">{(getAverageScore() / 10).toFixed(1)}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">out of 10</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 px-4">
                Excellent progression across {questions.length} simulated questions.
              </p>
            </div>

            {/* Stats list card */}
            <div className="bg-slate-900/40 border border-slate-855 rounded-3xl p-6 backdrop-blur-md col-span-2 flex flex-col gap-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-855 pb-2">Session Parameters</span>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-1 bg-slate-950/40 border border-slate-855/80 p-3.5 rounded-xl">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Job Target Role</span>
                  <span className="text-slate-200 font-bold">{role}</span>
                </div>

                <div className="flex flex-col gap-1 bg-slate-950/40 border border-slate-855/80 p-3.5 rounded-xl">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Company Environment</span>
                  <span className="text-slate-200 font-bold">{company || 'General MNC'}</span>
                </div>

                <div className="flex flex-col gap-1 bg-slate-950/40 border border-slate-855/80 p-3.5 rounded-xl">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Difficulty Scale</span>
                  <span className="text-slate-200 font-bold">{difficulty}</span>
                </div>

                <div className="flex flex-col gap-1 bg-slate-950/40 border border-slate-855/80 p-3.5 rounded-xl">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider text-[9px]">Career Level</span>
                  <span className="text-slate-200 font-bold">{experienceLevel}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mt-2 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl">
                <Award size={14} className="shrink-0 animate-pulse" />
                <span>Simulation results successfully generated and logged in your profile history tab.</span>
              </div>
            </div>
          </div>

          {/* Section details breakdown */}
          <div className="flex flex-col gap-5">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              Question & Feedback Logs
            </h3>

            <div className="flex flex-col gap-6">
              {questions.map((q, idx) => (
                <div key={idx} className="bg-slate-900/30 border border-slate-855 rounded-2xl overflow-hidden">
                  {/* Header bar */}
                  <div className="p-4 bg-slate-950/40 border-b border-slate-855 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-400">Question {idx + 1}</span>
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold px-2.5 py-1 rounded-lg">
                      Score: {feedbacks[idx]?.score}/10
                    </span>
                  </div>

                  {/* Body question answers feedback */}
                  <div className="p-6 flex flex-col gap-4 text-xs leading-relaxed">
                    <div className="flex flex-col gap-1 bg-slate-950/20 p-3 rounded-lg border border-slate-855/50">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Question Asked</span>
                      <p className="text-slate-300 font-semibold">{q}</p>
                    </div>

                    <div className="flex flex-col gap-1 bg-slate-950/20 p-3 rounded-lg border border-slate-855/50">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Your Response Answer</span>
                      <p className="text-slate-355 italic break-words">{answers[idx]}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Recruiter Evaluation</span>
                      <div className="p-4 bg-slate-950/40 rounded-lg text-slate-200 whitespace-pre-wrap select-text break-words border border-slate-855/60 leading-normal">
                        {feedbacks[idx]?.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <button
            onClick={handleRestart}
            className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.99] text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 self-center w-fit"
          >
            <RotateCcw size={16} />
            <span>Restart New Simulation Session</span>
          </button>
        </div>
      )}
    </div>
  );
}
