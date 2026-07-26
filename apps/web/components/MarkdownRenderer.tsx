import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

type ScoreSegment = { type: 'score'; value: number; color: string };
type TextSegment = { type: 'text'; content: string };
type Segment = ScoreSegment | TextSegment;

function parseScoreSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  const scoreRegex = /(\*\*ATS Score:\*\*\s*(\d+)\/100)/g;
  let lastIndex = 0;
  let match;

  while ((match = scoreRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    const score = parseInt(match[2], 10);
    const color = score >= 80 ? 'emerald' : score >= 60 ? 'amber' : 'red';
    segments.push({ type: 'score', value: score, color });
    lastIndex = scoreRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return segments;
}

function ScoreCallout({ score }: { score: ScoreSegment }) {
  const colorMap: Record<string, string> = {
    emerald: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    amber: 'border-amber-500/30 bg-amber-500/5 text-amber-400',
    red: 'border-red-500/30 bg-red-500/5 text-red-400',
  };
  const barColorMap: Record<string, string> = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
  };
  const c = colorMap[score.color] || colorMap.emerald;
  const bc = barColorMap[score.color] || barColorMap.emerald;

  return (
    <div className={`my-4 p-4 rounded-xl border ${c} flex items-center gap-4`}>
      <div className="relative w-20 h-20 shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" className="fill-transparent stroke-current opacity-20" strokeWidth="3" />
          <circle
            cx="18" cy="18" r="15"
            className={`fill-transparent ${bc}`}
            strokeWidth="3"
            strokeDasharray={94.25}
            strokeDashoffset={94.25 - (94.25 * score.value) / 100}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-extrabold">{score.value}</span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase tracking-widest">ATS Match Score</span>
        <span className="text-[10px] text-slate-500">out of 100</span>
      </div>
    </div>
  );
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listKeyCounter = 0;
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockContent: string[] = [];

  const parseInline = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="text-white font-extrabold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return <code key={idx} className="bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-800">{part.slice(1, -1)}</code>;
      }
      if (part.includes('**') || part.includes('`')) {
        return part.split(/(\*\*.*?\*\*|`.*?`)/g).map((subPart, subIdx) => {
          if (subPart.startsWith('**') && subPart.endsWith('**')) {
            return <strong key={`sub-${idx}-${subIdx}`} className="text-white font-extrabold">{subPart.slice(2, -2)}</strong>;
          }
          if (subPart.startsWith('`') && subPart.endsWith('`') && subPart.length > 2) {
            return <code key={`sub-${idx}-${subIdx}`} className="bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-800">{subPart.slice(1, -1)}</code>;
          }
          return subPart;
        });
      }
      return part;
    });
  };

  const flushList = () => {
    if (currentList.length > 0) {
      renderedElements.push(
        <ul key={`ul-${listKeyCounter++}`} className="list-disc pl-5 my-3 flex flex-col gap-1.5 text-slate-300">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  const flushOrderedList = () => {
    if (currentList.length > 0) {
      renderedElements.push(
        <ol key={`ol-${listKeyCounter++}`} className="list-decimal pl-5 my-3 flex flex-col gap-1.5 text-slate-300">
          {currentList}
        </ol>
      );
      currentList = [];
    }
  };

  const flushTable = () => {
    if (inTable) {
      renderedElements.push(
        <div key={`table-${listKeyCounter++}`} className="overflow-x-auto my-4 border border-slate-800 rounded-xl bg-slate-950/40">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                {tableHeaders.map((h, i) => (
                  <th key={i} className="p-3 font-bold uppercase tracking-wider text-[10px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i} className="border-b border-slate-850/50 hover:bg-slate-900/20">
                  {row.map((cell, j) => (
                    <td key={j} className="p-3 text-slate-300">{parseInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableHeaders = [];
      tableRows = [];
    }
  };

  const flushCodeBlock = () => {
    if (inCodeBlock && codeBlockContent.length > 0) {
      const codeStr = codeBlockContent.join('\n');
      renderedElements.push(
        <div key={`code-${listKeyCounter++}`} className="my-4 border border-slate-800 rounded-xl bg-slate-950/60 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/40">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{codeBlockLang || 'Code'}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(codeStr);
              }}
              className="text-[10px] text-slate-500 hover:text-emerald-400 transition-colors font-semibold"
            >
              Copy
            </button>
          </div>
          <pre className="p-4 text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto">
            <code>{codeStr}</code>
          </pre>
        </div>
      );
      inCodeBlock = false;
      codeBlockLang = '';
      codeBlockContent = [];
    }
  };

  const addToCurrentList = (item: React.ReactNode) => {
    currentList.push(item);
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Code block start/end
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        flushList();
        flushTable();
        codeBlockLang = line.slice(3).trim();
        inCodeBlock = true;
        codeBlockContent = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Table parsing
    if (line.startsWith('|')) {
      flushList();
      flushOrderedList();
      const cells = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

      const isSeparator = cells.every(c => c.startsWith('-'));
      if (isSeparator) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else {
      flushTable();
    }

    // Ordered list
    if (line.match(/^\d+\.\s/)) {
      flushList();
      const cleanLine = line.replace(/^\d+\.\s*/, '');
      addToCurrentList(
        <li key={`oli-${i}`} className="leading-relaxed pl-1">
          {parseInline(cleanLine)}
        </li>
      );
      continue;
    }

    // Unordered list
    if (line.startsWith('- ') || line.startsWith('* ')) {
      flushOrderedList();
      const cleanLine = line.replace(/^[-*]\s*/, '');
      addToCurrentList(
        <li key={`uli-${i}`} className="leading-relaxed">
          {parseInline(cleanLine)}
        </li>
      );
      continue;
    } else {
      flushList();
      flushOrderedList();
    }

    // Score callout
    if (line.includes('**ATS Score:**')) {
      flushList();
      const segments = parseScoreSegments(line);
      renderedElements.push(
        <div key={`score-${i}`} className="my-4">
          {segments.map((seg, si) =>
            seg.type === 'score' ? (
              <ScoreCallout key={`score-${i}-${si}`} score={seg} />
            ) : (
              <p key={`score-text-${i}-${si}`} className="my-2 text-slate-300 leading-relaxed text-sm">
                {parseInline(seg.content)}
              </p>
            )
          )}
        </div>
      );
      continue;
    }

    // Progress bar line (format: "Progress: X%")
    const progressMatch = line.match(/(?:Progress|Completion)[:\s]+(\d+)%?/i);
    if (progressMatch) {
      flushList();
      const pct = Math.min(100, Math.max(0, parseInt(progressMatch[1], 10)));
      renderedElements.push(
        <div key={`progress-${i}`} className="my-3 flex flex-col gap-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Progress</span>
            <span className="text-emerald-400 font-bold">{pct}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950 border border-slate-800 rounded-full overflow-hidden">
            <div className={`h-full ${pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'} rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      );
      continue;
    }

    // Horizontal rule
    if (line === '---' || line === '***') {
      flushList();
      flushTable();
      flushCodeBlock();
      renderedElements.push(
        <hr key={`hr-${i}`} className="my-6 border-slate-800" />
      );
      continue;
    }

    // Headings
    if (line.startsWith('## ') || line.startsWith('# ')) {
      flushCodeBlock();
      const cleanText = line.startsWith('## ') ? line.slice(3) : line.slice(2);
      renderedElements.push(
        <h2 key={i} className="text-white font-extrabold text-base mt-6 mb-3 flex items-center gap-2 border-b border-slate-850 pb-2">
          {parseInline(cleanText)}
        </h2>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      flushCodeBlock();
      renderedElements.push(
        <h3 key={i} className="text-white font-bold text-sm mt-4 mb-2">
          {parseInline(line.slice(4))}
        </h3>
      );
      continue;
    }

    // Blockquote / Callout
    if (line.startsWith('> ')) {
      flushCodeBlock();
      renderedElements.push(
        <blockquote key={i} className="bg-emerald-500/5 border-l-4 border-emerald-500 text-emerald-400 p-4 rounded-r-xl my-4 text-xs font-semibold leading-relaxed">
          {parseInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Regular line
    if (line !== '') {
      flushCodeBlock();
      renderedElements.push(
        <p key={i} className="my-2 text-slate-300 leading-relaxed text-sm">
          {parseInline(line)}
        </p>
      );
    } else {
      flushCodeBlock();
    }
  }

  flushList();
  flushOrderedList();
  flushTable();
  flushCodeBlock();

  return <div className="flex flex-col gap-1 select-text">{renderedElements}</div>;
}
