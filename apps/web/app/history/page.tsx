'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Search, Trash2, Eye, Calendar, Inbox } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api';
import { ROUTES } from '@/lib/routes';
import { useAuth, useRequireRegistered } from '@/hooks/useAuth';
import { useI18n } from '@/lib/i18n';
import { useAnimationsEnabled } from '@/hooks/useAnimations';

interface HistoryItem {
  id: number;
  actionType: string;
  title: string;
  payload: any;
  result: string;
  createdAt: string;
}

const TYPE_COLORS: Record<string, string> = {
  roadmap: 'var(--accent)',
  resume: 'rgba(129,140,248,1)',
  resume_build: 'rgba(129,140,248,1)',
  mentor: 'rgba(34,211,238,1)',
  interview: 'rgba(167,139,250,1)',
  career: 'var(--accent)',
  ocr: 'rgba(251,146,60,1)',
};

function typeColor(type: string) {
  for (const key of Object.keys(TYPE_COLORS)) {
    if (type.toLowerCase().includes(key)) return TYPE_COLORS[key];
  }
  return 'var(--text-muted)';
}

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isGuest } = useAuth();
  const { loading: authLoading } = useRequireRegistered();
  const { t } = useI18n();
  const animationsEnabled = useAnimationsEnabled();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [error, setError] = useState('');
  const [guest, setGuest] = useState(false);

  const fetchHistory = async () => {
    setError('');
    setLoading(true);
    try {
      const resp = await fetchWithAuth('/history', {
        method: 'GET', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      });
      if (resp.status === 401) { setGuest(true); setLoading(false); return; }
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.message || 'Failed to fetch history logs.');
      setHistory(data || []);
    } catch (err: any) {
      setError(err.message || 'Connection error.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { router.push(ROUTES.AUTH); return; }
    if (isGuest) { setGuest(true); setLoading(false); return; }
    fetchHistory();
  }, [authLoading, isAuthenticated, isGuest, router]);

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this log?')) return;
    try {
      const resp = await fetchWithAuth('/history/' + id, { method: 'DELETE' });
      if (resp.ok) {
        setHistory(history.filter((item) => item.id !== id));
        if (selectedItem?.id === id) setSelectedItem(null);
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
      const resp = await fetchWithAuth('/history', { method: 'DELETE' });
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

  const types = useMemo(() => {
    const set = new Set<string>();
    history.forEach(h => set.add(h.actionType));
    return Array.from(set);
  }, [history]);

  const filteredHistory = useMemo(() => history.filter(
    (item) =>
      (typeFilter === 'all' || item.actionType === typeFilter) &&
      (item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.actionType.toLowerCase().includes(search.toLowerCase())),
  ), [history, search, typeFilter]);

  if (guest) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto gap-4 min-h-[50vh]">
        <div className="p-3.5 surface-card rounded-full text-2xl">🔒</div>
        <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('history.disabledTitle')}</h2>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          {t('history.disabledDesc')}
        </p>
        <button onClick={() => { router.push(ROUTES.AUTH); }} className="btn btn-primary mt-2 px-5 py-2 text-xs">
          {t('nav.signIn')} / {t('nav.register')}
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={animationsEnabled ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4 max-w-6xl mx-auto"
    >
      <div className="lg:col-span-1 flex flex-col gap-4 h-full overflow-hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-h2 flex items-center gap-2">
            <Clock size={18} style={{ color: 'var(--accent)' }} />
            {t('history.title')}
          </h2>
          {history.length > 0 && (
            <button onClick={handleClearAll} className="text-xs font-bold hover:underline" style={{ color: 'var(--error)' }}>
              {t('history.clearAll')}
            </button>
          )}
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('history.searchLogs')}
            className="input-field pl-9"
            aria-label={t('history.searchLogs')}
          />
        </div>

        {types.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border whitespace-nowrap transition-colors ${typeFilter === 'all' ? 'btn-soft' : 'btn-secondary'}`}
              style={typeFilter === 'all' ? { backgroundColor: 'var(--accent-10)', color: 'var(--accent)', borderColor: 'var(--accent-ring)' } : {}}
              aria-pressed={typeFilter === 'all'}
            >
              All
            </button>
            {types.map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border whitespace-nowrap transition-colors ${typeFilter === type ? 'btn-soft' : 'btn-secondary'}`}
                style={typeFilter === type ? { backgroundColor: 'var(--accent-10)', color: 'var(--accent)', borderColor: 'var(--accent-ring)' } : {}}
                aria-pressed={typeFilter === type}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col gap-2.5">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton-shimmer surface-card rounded-xl h-16" />)}
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="surface-card p-8 flex flex-col items-center gap-2 text-center">
            <Inbox size={22} style={{ color: 'var(--text-muted)' }} />
            <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>{t('history.empty')}</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 pr-1 scrollbar-thin lg:max-h-[calc(100vh-260px)]">
            <AnimatePresence initial={false}>
              {filteredHistory.map((item) => (
                <motion.div
                  key={item.id}
                  layout={animationsEnabled}
                  initial={animationsEnabled ? { opacity: 0, y: 10 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  exit={animationsEnabled ? { opacity: 0, scale: 0.97 } : undefined}
                  onClick={() => setSelectedItem(item)}
                  className="p-3.5 rounded-xl border cursor-pointer flex flex-col gap-2 transition-all"
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') setSelectedItem(item); }}
                  style={{
                    backgroundColor: selectedItem?.id === item.id ? 'var(--accent-10)' : 'var(--bg-card)',
                    borderColor: selectedItem?.id === item.id ? 'var(--accent-ring)' : 'var(--border-default)',
                  }}
                  aria-pressed={selectedItem?.id === item.id}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="chip badge-neutral text-[9px] uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: typeColor(item.actionType) }} />
                      {item.actionType}
                    </span>
                    <span className="text-[10px] flex items-center gap-1 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                      <Calendar size={10} />
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold truncate leading-normal" style={{ color: 'var(--text-primary)' }}>
                    {item.title}
                  </h4>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div
        className="lg:col-span-2 surface-card rounded-2xl p-6 h-full overflow-hidden flex flex-col justify-between"
        style={{ minHeight: 320 }}
      >
        <AnimatePresence mode="wait">
          {selectedItem ? (
            <motion.div
              key={selectedItem.id}
              initial={animationsEnabled ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: 1, y: 0 }}
              exit={animationsEnabled ? { opacity: 0 } : undefined}
              transition={{ duration: 0.15 }}
              className="flex flex-col gap-4 h-full overflow-hidden justify-between"
            >
              <div className="flex justify-between items-start gap-3 pb-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <span className="chip badge-neutral text-[9px] uppercase tracking-widest w-fit">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: typeColor(selectedItem.actionType) }} />
                    {selectedItem.actionType}
                  </span>
                  <h3 className="text-md font-bold leading-normal" style={{ color: 'var(--text-primary)' }}>
                    {selectedItem.title}
                  </h3>
                </div>
                <button
                  onClick={() => handleDeleteItem(selectedItem.id)}
                  className="btn btn-danger p-2 shrink-0"
                  title={t('history.deleteLog')}
                  aria-label={t('history.deleteLog')}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div
                className="flex-1 overflow-y-auto my-4 pr-1 scrollbar-thin text-xs font-mono leading-relaxed whitespace-pre-wrap p-4 rounded-xl select-text"
                style={{
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                }}
              >
                {selectedItem.result}
              </div>

              <div className="text-[10px] font-semibold font-mono pt-3 flex flex-wrap justify-between gap-2" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)' }}>
                <span>Log ID: #{selectedItem.id}</span>
                <span>{new Date(selectedItem.createdAt).toLocaleString()}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={animationsEnabled ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-center gap-2"
              style={{ color: 'var(--text-muted)' }}
            >
              <Eye size={24} />
              <p className="text-xs italic font-semibold">{t('history.selectLog')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
