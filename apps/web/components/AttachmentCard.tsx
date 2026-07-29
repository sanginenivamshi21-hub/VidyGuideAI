'use client';

import { useState } from 'react';
import { FileText, Image, File, X, Loader2 } from 'lucide-react';

interface AttachmentCardProps {
  file: File;
  index: number;
  onRemove: (index: number) => void;
  uploading?: boolean;
  preview?: string;
}

export default function AttachmentCard({ file, index, onRemove, uploading, preview }: AttachmentCardProps) {
  const [imgError, setImgError] = useState(false);
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext);
  const isPdf = ext === 'pdf';
  const isDoc = ['doc', 'docx'].includes(ext);
  const isCode = ['py', 'js', 'ts', 'java', 'cpp', 'c', 'rs', 'go', 'rb', 'php', 'swift'].includes(ext);
  const isCsv = ['csv', 'xlsx', 'xls'].includes(ext);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getIcon = () => {
    if (isImage) return <Image size={20} className="text-blue-400" />;
    if (isPdf) return <FileText size={20} className="text-red-400" />;
    if (isDoc) return <FileText size={20} className="text-blue-500" />;
    if (isCode) return <File size={20} className="text-emerald-400" />;
    if (isCsv) return <FileText size={20} className="text-green-400" />;
    return <File size={20} className="text-tertiary" />;
  };

  return (
    <div className="relative flex items-center gap-2 px-3 py-2 rounded-xl border shrink-0 group"
      style={{ backgroundColor: 'rgba(30,41,59,0.6)', borderColor: 'rgba(51,65,85,0.5)' }}>
      {isImage && preview && !imgError ? (
        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-slate-800">
          <img src={preview} alt={file.name} className="w-full h-full object-cover"
            onError={() => setImgError(true)} />
        </div>
      ) : (
        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
          {getIcon()}
        </div>
      )}
      <div className="flex flex-col min-w-0 max-w-[160px]">
        <span className="text-xs text-primary truncate font-medium">{file.name}</span>
        <span className="text-[10px] text-muted">{formatSize(file.size)}</span>
      </div>
      {uploading && (
        <Loader2 size={14} className="animate-spin text-emerald-400 ml-1" />
      )}
      <button onClick={() => onRemove(index)}
        className="p-0.5 rounded hover:bg-slate-700 text-muted hover:text-red-400 transition-all ml-1">
        <X size={12} />
      </button>
    </div>
  );
}
