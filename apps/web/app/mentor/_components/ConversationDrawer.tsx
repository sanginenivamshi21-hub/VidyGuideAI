import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Pin, Trash2, Pencil, Check, SquarePen, Star } from 'lucide-react';
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
  const others = filtered.filter((c) => !c.pinned);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className="fixed left-0 top-0 bottom-0 w-72 z-50 flex flex-col bg-slate-900/98"
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 shrink-0">
              <h2 className="text-sm font-bold text-white">Conversations</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { onNewChat(); onClose(); }}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors touch-manipulation"
                  aria-label="New chat"
                >
                  <SquarePen size={16} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors touch-manipulation"
                  aria-label="Close drawer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-3 py-2.5">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full text-xs rounded-xl pl-8 pr-3 py-2.5 input-field"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-4">
              {pinned.length > 0 && (
                <div className="mb-1">
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-2 py-1.5 flex items-center gap-1.5">
                    <Star size={10} /> Pinned
                  </div>
                  {pinned.map((conv) => (
                    <ConvItem
                      key={conv.id}
                      conv={conv}
                      isActive={activeConvId === conv.id}
                      editing={editingId === conv.id}
                      editValue={editValue}
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
              <div>
                {pinned.length > 0 && (
                  <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider px-2 py-1.5">Recent</div>
                )}
                {others.map((conv) => (
                  <ConvItem
                    key={conv.id}
                    conv={conv}
                    isActive={activeConvId === conv.id}
                    editing={editingId === conv.id}
                    editValue={editValue}
                    onSelect={() => { onSelect(conv.id); onClose(); }}
                    onDelete={() => onDelete(conv.id)}
                    onPin={() => onPin(conv)}
                    onStartEdit={() => { setEditingId(conv.id); setEditValue(conv.title); }}
                    onEditChange={(v) => setEditValue(v)}
                    onSaveEdit={() => { onRename(conv.id, editValue); setEditingId(null); }}
                    onCancelEdit={() => setEditingId(null)}
                  />
                ))}
                {filtered.length === 0 && (
                  <div className="text-xs text-slate-600 text-center py-8 px-4">
                    {searchQuery ? 'No matching conversations' : 'No conversations yet'}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function ConvItem({
  conv, isActive, onSelect, onDelete, onPin, editing, editValue, onStartEdit, onEditChange, onSaveEdit, onCancelEdit,
}: {
  conv: Conversation; isActive: boolean; onSelect: () => void; onDelete: () => void; onPin: () => void;
  editing: boolean; editValue: string; onStartEdit: () => void; onEditChange: (v: string) => void; onSaveEdit: () => void; onCancelEdit: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-1 px-2.5 py-2 rounded-xl group text-xs mb-0.5 transition-colors ${
        isActive ? '' : 'hover:bg-slate-800/40'
      }`}
      style={isActive ? { backgroundColor: 'var(--accent-10)' } : {}}
    >
      {editing ? (
        <input
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onSaveEdit}
          onKeyDown={(e) => { if (e.key === 'Enter') onSaveEdit(); if (e.key === 'Escape') onCancelEdit(); }}
          autoFocus
          className="flex-1 bg-slate-700 text-xs text-white rounded-lg px-2 py-1 outline-none"
        />
      ) : (
        <button onClick={onSelect} className="flex-1 text-left truncate text-slate-400" style={isActive ? { color: 'var(--accent)' } : {}}>
          {conv.title}
        </button>
      )}
      {!editing && (
        <>
          <button
            onClick={onPin}
            className={`p-1 opacity-0 group-hover:opacity-100 transition-opacity ${conv.pinned ? '!opacity-100' : ''}`}
            style={{ color: conv.pinned ? 'var(--accent)' : 'rgba(71,85,105,1)' }}
          >
            <Pin size={11} />
          </button>
          <button onClick={onStartEdit} className="p-1 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-slate-400 transition-opacity">
            <Pencil size={11} />
          </button>
          <button onClick={onDelete} className="p-1 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-opacity">
            <Trash2 size={11} />
          </button>
        </>
      )}
    </div>
  );
}
