'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Compass, FileText, MessageSquare, ShieldAlert, Settings, Menu, ChevronLeft } from 'lucide-react';

interface SidebarItem {
  icon: any;
  label: string;
  id: string;
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const menuItems: SidebarItem[] = [
    { icon: Home, label: 'Dashboard', id: 'dashboard' },
    { icon: Compass, label: 'Career Guidance', id: 'career' },
    { icon: FileText, label: 'Resume Builder', id: 'resume' },
    { icon: MessageSquare, label: 'AI Mentor', id: 'mentor' },
    { icon: ShieldAlert, label: 'OCR Scanner', id: 'ocr' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  return (
    <motion.div
      animate={{ width: isOpen ? 240 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="h-screen bg-slate-900 border-r border-slate-800 text-slate-200 flex flex-col justify-between p-4 relative"
    >
      <div className="flex flex-col gap-8">
        {/* Header Title / Logo */}
        <div className="flex items-center justify-between h-10 px-2">
          {isOpen ? (
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold text-emerald-400 tracking-wider"
            >
              VidyGuideAI
            </motion.h1>
          ) : (
            <div className="w-6 h-6 rounded bg-emerald-500 mx-auto" />
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 absolute -right-3 top-5 border border-slate-700 z-50"
          >
            {isOpen ? <ChevronLeft size={16} /> : <Menu size={16} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-4 p-3 rounded-lg w-full transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer metadata */}
      {isOpen && (
        <div className="text-xs text-slate-500 text-center">
          VidyGuideAI v2.0.0
        </div>
      )}
    </motion.div>
  );
}
