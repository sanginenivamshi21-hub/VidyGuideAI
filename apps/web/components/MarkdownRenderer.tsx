import React from 'react';

interface MarkdownRendererProps {
  content: string;
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

  const parseInline = (text: string): React.ReactNode[] => {
    const splitParts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

    return splitParts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="text-white font-extrabold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={idx} className="bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-800">{part.slice(1, -1)}</code>;
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Table parsing
    if (line.startsWith('|')) {
      flushList();
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

    // List item parsing
    if (line.startsWith('- ') || line.startsWith('* ') || line.match(/^\d+\.\s/)) {
      const cleanLine = line.replace(/^[-*\d]+\.\s*|^\s*[-*]\s*/, '');
      currentList.push(
        <li key={`li-${i}`} className="leading-relaxed">
          {parseInline(cleanLine)}
        </li>
      );
      continue;
    } else {
      flushList();
    }

    // Headings
    if (line.startsWith('## ') || line.startsWith('# ')) {
      const cleanText = line.startsWith('## ') ? line.slice(3) : line.slice(2);
      renderedElements.push(
        <h2 key={i} className="text-white font-extrabold text-base mt-6 mb-3 flex items-center gap-2 border-b border-slate-850 pb-2">
          {parseInline(cleanText)}
        </h2>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      renderedElements.push(
        <h3 key={i} className="text-white font-bold text-sm mt-4 mb-2">
          {parseInline(line.slice(4))}
        </h3>
      );
      continue;
    }

    // Blockquote / Callout
    if (line.startsWith('> ')) {
      renderedElements.push(
        <blockquote key={i} className="bg-emerald-500/5 border-l-4 border-emerald-500 text-emerald-400 p-4 rounded-r-xl my-4 text-xs font-semibold leading-relaxed">
          {parseInline(line.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Regular line
    if (line !== '') {
      renderedElements.push(
        <p key={i} className="my-2 text-slate-300 leading-relaxed text-sm">
          {parseInline(line)}
        </p>
      );
    }
  }

  // Flush remaining elements
  flushList();
  flushTable();

  return <div className="flex flex-col gap-1 select-text">{renderedElements}</div>;
}
