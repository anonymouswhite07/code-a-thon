'use client';

import React from 'react';

export type LottieAccentType =
  | 'compiler-spinner'
  | 'success-badge'
  | 'celebration-spark'
  | 'terminal-prompt'
  | 'trophy-shine';

interface LottieAccentProps {
  type: LottieAccentType;
  size?: number;
  className?: string;
}

export const LottieAccent: React.FC<LottieAccentProps> = ({
  type,
  size = 48,
  className = ''
}) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`inline-flex items-center justify-center select-none ${className}`}
    >
      {type === 'compiler-spinner' && (
        <svg width={size} height={size} viewBox="0 0 50 50" className="animate-spin text-[#B8E63E]">
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeDasharray="80"
            strokeDashoffset="60"
            strokeLinecap="round"
          />
        </svg>
      )}

      {type === 'success-badge' && (
        <svg width={size} height={size} viewBox="0 0 60 60" fill="none" className="transition-transform duration-300 hover:scale-110">
          <circle cx="30" cy="30" r="26" fill="#10B981" fillOpacity="0.2" stroke="#10B981" strokeWidth="4" />
          <path d="M18 30L26 38L42 22" stroke="#10B981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      {type === 'celebration-spark' && (
        <svg width={size} height={size} viewBox="0 0 60 60" fill="none" className="animate-pulse">
          <path d="M30 6L33 22L49 25L33 28L30 44L27 28L11 25L27 22Z" fill="#FFD84D" stroke="#171717" strokeWidth="2" />
          <circle cx="16" cy="14" r="3" fill="#FF6B35" />
          <circle cx="45" cy="42" r="3.5" fill="#3155FF" />
          <circle cx="14" cy="45" r="2.5" fill="#B8E63E" />
        </svg>
      )}

      {type === 'terminal-prompt' && (
        <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
          <rect width="40" height="40" rx="8" fill="#171717" />
          <path d="M12 14L20 20L12 26" stroke="#B8E63E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="22" y1="26" x2="28" y2="26" stroke="#FFD84D" strokeWidth="3" strokeLinecap="round" className="animate-ping" />
        </svg>
      )}

      {type === 'trophy-shine' && (
        <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
          <circle cx="30" cy="30" r="24" fill="#FFD84D" fillOpacity="0.2" />
          <path d="M30 10V20M30 40V50M10 30H20M40 30H50M16 16L23 23M37 37L44 44M44 16L37 23M23 37L16 44" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
    </div>
  );
};
