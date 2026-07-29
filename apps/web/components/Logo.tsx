'use client';

interface LogoProps {
  size?: number;
  mono?: boolean;
  showText?: boolean;
  textSize?: string;
}

export default function Logo({ size = 32, mono, showText, textSize }: LogoProps) {
  const accent = mono ? '#94a3b8' : 'var(--accent)';
  const accentDim = mono ? 'rgba(148,163,184,0.3)' : 'var(--accent-20)';

  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" role="img" aria-label="VidyGuideAI">
        {/* Forward chevron — left stroke */}
        <path
          d="M20 6L10 16L20 26"
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
        {/* Forward chevron — right stroke (extends as arrow) */}
        <path
          d="M12 6L22 16L12 26"
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Accent dot at destination */}
        <circle cx="24" cy="16" r="2" fill={accent} />
        {/* Subtle glow ring */}
        <circle cx="24" cy="16" r="5" stroke={accentDim} strokeWidth="1" opacity="0.5" />
      </svg>
      {showText && (
        <span
          className="font-bold tracking-tight"
          style={{ color: mono ? '#94a3b8' : 'var(--text-primary)', fontSize: textSize || 'inherit' }}
        >
          VidyGuideAI
        </span>
      )}
    </div>
  );
}
