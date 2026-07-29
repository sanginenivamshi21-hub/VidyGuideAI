'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Pin, Trash2, Pencil, Check, SquarePen, Star } from 'lucide-react';
import Logo from '@/components/Logo';
import type { Conversation } from '../types';

interface ConversationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConvId: number | null;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onPin: (conv: Conversation) => void;
  onNewChat: () => void;
  onRename: (id: number, title: string) => void;
}

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = now - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function getGroupLabel(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const weekAgo = today - 7 * 86400000;
  const time = d.getTime();
  if (time >= today) return 'Today';
  if (time >= yesterday) return 'Yesterday';
  if (time >= weekAgo) return 'Last 7 Days';
  return 'Earlier';
}

export default function ConversationDrawer({
  isOpen,
  onClose,
  conversations,
  activeConvId,
  onSelect,
  onDelete,
  onPin,
  onNewChat,
  onRename,
}: ConversationDrawerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinned = filtered.filter((c) => c.pinned);
  const unpinned = filtered.filter((c) => !c.pinned);

  const groups: Record<string, Conversation[]> = {};
  for (const conv of unpinned) {
    const label = getGroupLabel(conv.updatedAt || conv.createdAt);
    if (!groups[label]) groups[label] = [];
    groups[label].push(conv);
  }
  const groupOrder = ['Today', 'Yesterday', 'Last 7 Days', 'Earlier'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'var(--overlay)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] max-w-[85vw] z-50 flex flex-col"
            style={{ backgroundColor: 'var(--bg-primary)', borderRight: '1px solid var(--border-default)' }}
          >
            <div className="flex items-center justify-between px-4 py-3.5 shrink-0" style={{ borderBottom: '1px solid var(--border-default)' }}>
              <div className="flex items-center gap-2.5">
                <Logo size={22} />
                <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Conversations</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { onNewChat(); onClose(); }}
                  className="p-2 rounded-lg transition-colors touch-manipulation"
                  style={{ color: 'var(--text-secondary)' }}
                  aria-label="New chat"
                >
                  <SquarePen size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-colors touch-manipulation"
                  style={{ color: 'var(--text-secondary)' }}
                  aria-label="Close drawer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-3 py-2.5">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full text-xs rounded-xl pl-8 pr-3 py-2.5 outline-none border transition-colors"
                  style={{ backgroundColor: 'var(--bg-tertiary)', borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4">
              {pinned.length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 flex items-center gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
                    <Star size={10} /> Pinned
                  </div>
                  {pinned.map((conv) => (
                    <ConvItem
                      key={conv.id}
                      conv={conv}
                      isActive={activeConvId === conv.id}
                      editing={editingId === conv.id}
                      editValue={editValue}
                      relativeTime={getRelativeTime(conv.updatedAt || conv.createdAt)}
                      onSelect={() => { onSelect(conv.id); onClose(); }}
                      onDelete={() => onDelete(conv.id)}
                      onPin={() => onPin(conv)}
                      onStartEdit={() => { setEditingId(conv.id); setEditValue(conv.title); }}
                      onEditChange={(v) => setEditValue(v)}
                      onSaveEdit={() => { onRename(conv.id, editValue); setEditingId(null); }}
                      onCancelEdit={() => setEditingId(null)}
                    />
                  ))}
                </div>
              )}
              {groupOrder.map((label) => {
                const convs = groups[label];
                if (!convs || convs.length === 0) return null;
                return (
                  <div key={label} className="mb-3">
                    <div className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5" style={{ color: 'var(--text-tertiary)' }}>
                      {label}
                    </div>
                    {convs.map((conv) => (
                      <ConvItem
                        key={conv.id}
                        conv={conv}
                        isActive={activeConvId === conv.id}
                        editing={editingId === conv.id}
                        editValue={editValue}
                        relativeTime={getRelativeTime(conv.updatedAt || conv.createdAt)}
                        onSelect={() => { onSelect(conv.id); onClose(); }}
                        onDelete={() => onDelete(conv.id)}
                        onPin={() => onPin(conv)}
                        onStartEdit={() => { setEditingId(conv.id); setEditValue(conv.title); }}
                        onEditChange={(v) => setEditValue(v)}
                        onSaveEdit={() => { onRename(conv.id, editValue); setEditingId(null); }}
                        onCancelEdit={() => setEditingId(null)}
                      />
                    ))}
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className="text-xs text-center py-8 px-4" style={{ color: 'var(--text-muted)' }}>
                  {searchQuery ? 'No matching conversations' : 'No conversations yet'}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ConvItem({
  conv, isActive, onSelect, onDelete, onPin, editing, editValue, onStartEdit, onEditChange, onSaveEdit, onCancelEdit, relativeTime,
}: {
  conv: Conversation; isActive: boolean; onSelect: () => void; onDelete: () => void; onPin: () => void;
  editing: boolean; editValue: string; onStartEdit: () => void; onEditChange: (v: string) => void; onSaveEdit: () => void; onCancelEdit: () => void;
  relativeTime: string;
}) {
  return (
    <div
      className="flex items-center gap-1 px-2.5 py-2 rounded-xl group text-xs mb-0.5 transition-colors"
      style={{ backgroundColor: isActive ? 'var(--accent-10)' : 'transparent' }}
    >
      {editing ? (
        <input
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onSaveEdit}
          onKeyDown={(e) => { if (e.key === 'Enter') onSaveEdit(); if (e.key === 'Escape') onCancelEdit(); }}
          autoFocus
          className="flex-1 text-xs rounded-lg px-2 py-1 outline-none border"
          style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', borderColor: 'var(--border-default)' }}
        />
      ) : (
        <div className="flex-1 min-w-0">
          <button onClick={onSelect} className="block w-full text-left truncate text-xs" style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }}>
            {conv.title}
          </button>
          <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{relativeTime}</span>
        </div>
      )}
      {!editing && (
        <>
          <button
            onClick={onPin}
            className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ color: conv.pinned ? 'var(--accent)' : 'var(--text-muted)' }}
          >
            <Pin size={11} />
          </button>
          <button onClick={onStartEdit} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }}>
            <Pencil size={11} />
          </button>
          <button onClick={onDelete} className="p-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }}>
            <Trash2 size={11} />
          </button>
        </>
      )}
    </div>
  );
}
