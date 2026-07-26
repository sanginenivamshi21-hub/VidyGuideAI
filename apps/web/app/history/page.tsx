'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Search, Trash2, ChevronRight, Eye, Calendar, AlertCircle } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

interface HistoryItem {
  id: number;
  actionType: string;
  title: string;
  payload: any;
  result: string;
  createdAt: string;
}

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [error, setError] = useState('');
  const [isGuest, setIsGuest] = useState(false);

  const fetchHistory = async () => {
    setError('');
    setLoading(true);

    try {
      const resp = await fetch('http://localhost:8000/history', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (resp.status === 401) {
        // Unauthorized
        setIsGuest(true);
        setLoading(false);
        return;
      }

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || 'Failed to fetch history logs.');
      }

      setHistory(data || []);
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user object exists in localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      router.push(ROUTES.AUTH);
      return;
    }

    const user = JSON.parse(userStr);
    if (user.id === null) {
      setIsGuest(true);
      setLoading(false);
    } else {
      fetchHistory();
    }
  }, [router]);

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this log?')) return;

    try {
      const resp = await fetch(`http://localhost:8000/history/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (resp.ok) {
        setHistory(history.filter((item) => item.id !== id));
        if (selectedItem?.id === id) {
          setSelectedItem(null);
        }
      } else {
        alert('Failed to delete log.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear your entire history? This cannot be undone.')) return;

    try {
      const resp = await fetch('http://localhost:8000/history', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (resp.ok) {
        setHistory([]);
        setSelectedItem(null);
      } else {
        alert('Failed to clear history.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredHistory = history.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.actionType.toLowerCase().includes(search.toLowerCase())
  );

  if (isGuest) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto gap-4 min-h-[50vh]">
        <div className="p-3.5 bg-slate-900 border border-slate-800 text-slate-500 rounded-full text-2xl">
          🔒
        </div>
        <h2 className="text-xl font-bold text-white">History is Disabled</h2>
        <p className="text-xs text-slate-405 leading-relaxed">
          You are currently signed in as a Guest. History logging, career roadmap persistence, and user profiles are only available for registered student accounts.
        </p>
        <button
          onClick={() => {
            localStorage.removeItem('user');
            router.push(ROUTES.AUTH);
          }}
          className="mt-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-4 max-w-6xl mx-auto h-[85vh]">
      {/* Log list column */}
      <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Clock className="text-emerald-400" size={20} />
            History Logs
          </h2>
          {history.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-xs font-bold text-red-400 hover:underline"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-slate-500" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full bg-slate-950 border border-slate-850 focus:border-emerald-500 text-white rounded-lg pl-9 pr-4 py-2.5 outline-none text-xs transition-all"
          />
        </div>

        {loading ? (
          <div className="text-xs font-semibold text-slate-500 text-center py-8">
            Loading logs...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="text-xs italic text-slate-600 text-center py-8">
            No history logs found.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-3.5 rounded-xl border cursor-pointer flex flex-col gap-2 transition-all select-none ${
                  selectedItem?.id === item.id
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-sm'
                    : 'bg-slate-900/60 border-slate-850 hover:border-slate-750 text-slate-350 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-slate-950 border border-slate-850 text-slate-400">
                    {item.actionType}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-xs font-semibold truncate leading-normal pr-4">
                  {item.title}
                </h4>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log detail view column */}
      <div className="lg:col-span-2 bg-slate-950/40 border border-slate-850 rounded-2xl p-6 h-full overflow-hidden flex flex-col justify-between">
        {selectedItem ? (
          <div className="flex flex-col gap-4 h-full overflow-hidden justify-between">
            <div className="flex justify-between items-center border-b border-slate-850 pb-4">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-slate-900 border border-slate-850 text-slate-400 w-fit">
                  {selectedItem.actionType}
                </span>
                <h3 className="text-md font-bold text-white leading-normal pr-4">
                  {selectedItem.title}
                </h3>
              </div>
              <button
                onClick={() => handleDeleteItem(selectedItem.id)}
                className="p-2 rounded-lg bg-slate-900 hover:bg-red-500/10 border border-slate-850 hover:border-red-500/20 text-slate-450 hover:text-red-400 transition-all duration-200"
                title="Delete Log"
              >
                <Trash2 size={15} />
              </button>
            </div>

            {/* Results display scroll block */}
            <div className="flex-1 overflow-y-auto my-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800 text-slate-200 text-xs font-mono leading-relaxed whitespace-pre-wrap selection:bg-emerald-500/30 p-4 bg-slate-950/80 border border-slate-850 rounded-xl">
              {selectedItem.result}
            </div>

            <div className="text-[10px] text-slate-600 font-semibold font-mono border-t border-slate-850 pt-3 flex justify-between">
              <span>Log ID: #{selectedItem.id}</span>
              <span>Generated: {new Date(selectedItem.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-550 gap-2">
            <Eye size={24} />
            <p className="text-xs italic font-semibold">Select a history log from the sidebar list to view details.</p>
          </div>
        )}
      </div>
    </div>
  );
}
