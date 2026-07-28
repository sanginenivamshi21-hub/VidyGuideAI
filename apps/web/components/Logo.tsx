'use client';

interface LogoProps {
  size?: number;
  mono?: boolean;
  showText?: boolean;
  textSize?: string;
}

export default function Logo({ size = 32, mono, showText, textSize }: LogoProps) {
  const accent = mono ? '#94a3b8' : 'var(--accent)';
  const fill = mono ? 'rgba(148,163,184,0.1)' : 'var(--accent-10)';
  const secondary = mono ? '#475569' : 'var(--accent-light)';

  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        {/* Outer ring - knowledge graph */}
        <circle cx="16" cy="16" r="14" stroke={accent} strokeWidth="1.2" fill={fill} />
        {/* Inner node connections - neural pathway */}
        <path d="M16 4C16 4 18 12 16 16C14 12 16 4 16 4Z" fill={secondary} opacity="0.6" />
        <path d="M16 28C16 28 14 20 16 16C18 20 16 28 16 28Z" fill={secondary} opacity="0.6" />
        <path d="M4 16C4 16 12 14 16 16C12 18 4 16 4 16Z" fill={secondary} opacity="0.6" />
        <path d="M28 16C28 16 20 18 16 16C20 14 28 16 28 16Z" fill={secondary} opacity="0.6" />
        {/* Center node */}
        <circle cx="16" cy="16" r="4" fill={accent} />
        {/* Guidance compass arrow */}
        <path d="M16 8L18 14L16 12L14 14L16 8Z" fill="white" opacity="0.9" />
        {/* Surrounding nodes */}
        <circle cx="16" cy="6" r="1.5" fill={accent} opacity="0.5" />
        <circle cx="16" cy="26" r="1.5" fill={accent} opacity="0.5" />
        <circle cx="6" cy="16" r="1.5" fill={accent} opacity="0.5" />
        <circle cx="26" cy="16" r="1.5" fill={accent} opacity="0.5" />
        <circle cx="9" cy="9" r="1.5" fill={accent} opacity="0.3" />
        <circle cx="23" cy="9" r="1.5" fill={accent} opacity="0.3" />
        <circle cx="9" cy="23" r="1.5" fill={accent} opacity="0.3" />
        <circle cx="23" cy="23" r="1.5" fill={accent} opacity="0.3" />
      </svg>
      {showText && (
        <span className={`font-bold tracking-tight ${textSize || 'text-base'}`} style={{ color: mono ? '#94a3b8' : 'var(--text-primary)' }}>
          VidyGuideAI
        </span>
      )}
    </div>
  );
}
