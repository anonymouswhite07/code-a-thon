import React from 'react';

export type MascotState =
  | 'coding'
  | 'thinking'
  | 'waiting'
  | 'success'
  | 'error'
  | 'celebrating'
  | 'winner'
  | 'countdown'
  | 'confused'
  | 'coffee';

interface MascotProps {
  state?: MascotState;
  className?: string;
  size?: number;
  showQuote?: boolean;
  customQuote?: string;
}

const DEFAULT_QUOTES: Record<MascotState, string> = {
  coding: 'One more test case...',
  thinking: 'Think before you code.',
  waiting: 'The compiler has opinions.',
  success: 'All tests green! 🚀',
  error: 'Runtime error says hello.',
  celebrating: 'Coffee. Code. Repeat. ☕',
  winner: 'Three rounds conquered! 🏆',
  countdown: 'Sharpen your IDE!',
  confused: 'It worked on my machine...',
  coffee: 'Fueling compiler neurons...'
};

export const Mascot: React.FC<MascotProps> = ({
  state = 'coding',
  className = '',
  size = 200,
  showQuote = true,
  customQuote
}) => {
  const quote = customQuote || DEFAULT_QUOTES[state];

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Speech bubble */}
      {showQuote && (
        <div className="mb-3 px-3 py-1.5 bg-white brutal-border brutal-shadow-sm rounded-lg text-xs font-bold text-[#171717] tracking-tight relative animate-bounce flex items-center gap-1.5 z-10">
          <span>{quote}</span>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#171717]" />
        </div>
      )}

      {/* Vector Mascot SVG */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:scale-105"
      >
        {/* Background decorative tactile circle */}
        <circle cx="120" cy="120" r="105" fill="#F7F4ED" stroke="#171717" strokeWidth="4" strokeDasharray="6 6" />

        {/* Mascot Body & Hoodie */}
        <path
          d="M60 210C60 170 80 150 120 150C160 150 180 170 180 210"
          fill="#3155FF"
          stroke="#171717"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        {/* Hoodie Strings / Zipper */}
        <path d="M110 150L110 175M130 150L130 175" stroke="#FFD84D" strokeWidth="4" strokeLinecap="round" />

        {/* Head / Face */}
        <rect
          x="75"
          y="50"
          width="90"
          height="85"
          rx="32"
          fill="#FDE68A"
          stroke="#171717"
          strokeWidth="5"
        />

        {/* Hair / Beanie */}
        <path
          d="M75 80C75 55 90 40 120 40C150 40 165 55 165 80"
          fill="#171717"
        />
        {/* Small tuft of hair */}
        <path d="M120 35C125 25 135 30 130 40" stroke="#171717" strokeWidth="4" strokeLinecap="round" />

        {/* Glasses Frame */}
        <rect x="85" y="75" width="28" height="24" rx="6" fill="#FFFFFF" stroke="#171717" strokeWidth="4" />
        <rect x="127" y="75" width="28" height="24" rx="6" fill="#FFFFFF" stroke="#171717" strokeWidth="4" />
        <line x1="113" y1="87" x2="127" y2="87" stroke="#171717" strokeWidth="4" />

        {/* Eyes based on state */}
        {state === 'thinking' && (
          <>
            <circle cx="102" cy="85" r="4" fill="#171717" />
            <circle cx="144" cy="85" r="4" fill="#171717" />
            {/* Hand on chin */}
            <circle cx="150" cy="125" r="14" fill="#FDE68A" stroke="#171717" strokeWidth="4" />
          </>
        )}

        {state === 'coding' && (
          <>
            <circle cx="99" cy="88" r="4" fill="#171717" />
            <circle cx="141" cy="88" r="4" fill="#171717" />
            {/* Screen reflection highlight */}
            <circle cx="96" cy="85" r="1.5" fill="#FFFFFF" />
            <circle cx="138" cy="85" r="1.5" fill="#FFFFFF" />
          </>
        )}

        {state === 'success' && (
          <>
            <path d="M92 86L99 92L106 82" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M134 86L141 92L148 82" stroke="#10B981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}

        {state === 'error' && (
          <>
            {/* X Eyes */}
            <path d="M94 82L104 92M104 82L94 92" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
            <path d="M136 82L146 92M146 82L136 92" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
          </>
        )}

        {(state === 'celebrating' || state === 'winner') && (
          <>
            <path d="M92 88C94 80 104 80 106 88" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
            <path d="M134 88C136 80 146 80 148 88" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
            {/* Party hat or Golden Crown */}
            {state === 'winner' ? (
              <path d="M90 45L105 25L120 40L135 25L150 45Z" fill="#FFD84D" stroke="#171717" strokeWidth="4" strokeLinejoin="round" />
            ) : (
              <path d="M100 40L120 10L140 40Z" fill="#FF6B35" stroke="#171717" strokeWidth="4" strokeLinejoin="round" />
            )}
          </>
        )}

        {state === 'coffee' && (
          <>
            <circle cx="99" cy="87" r="4" fill="#171717" />
            <circle cx="141" cy="87" r="4" fill="#171717" />
            {/* Baggy eyes / tired smile */}
            <path d="M92 95C98 97 102 96 106 94" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
            <path d="M134 95C140 97 144 96 148 94" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {(state === 'waiting' || state === 'countdown' || state === 'confused') && (
          <>
            <circle cx="99" cy="87" r="4" fill="#171717" />
            <circle cx="141" cy="87" r="4" fill="#171717" />
          </>
        )}

        {/* Mouth */}
        {state === 'success' || state === 'celebrating' || state === 'winner' ? (
          <path d="M108 112C112 122 128 122 132 112" stroke="#171717" strokeWidth="4" strokeLinecap="round" fill="#EF4444" />
        ) : state === 'error' ? (
          <path d="M110 118C115 112 125 112 130 118" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
        ) : state === 'thinking' || state === 'confused' ? (
          <line x1="112" y1="115" x2="128" y2="112" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
        ) : (
          <path d="M112 115C116 120 124 120 128 115" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
        )}

        {/* Laptop in foreground */}
        <g id="laptop">
          <path
            d="M70 170H170L185 205H55L70 170Z"
            fill="#E5E7EB"
            stroke="#171717"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          {/* Glowing laptop screen */}
          <rect
            x="80"
            y="130"
            width="80"
            height="45"
            rx="4"
            fill="#171717"
            stroke="#171717"
            strokeWidth="4"
          />
          {/* Code lines on screen */}
          <line x1="88" y1="140" x2="115" y2="140" stroke="#B8E63E" strokeWidth="3" strokeLinecap="round" />
          <line x1="88" y1="148" x2="145" y2="148" stroke="#3155FF" strokeWidth="3" strokeLinecap="round" />
          <line x1="95" y1="156" x2="135" y2="156" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" />
          <line x1="88" y1="164" x2="105" y2="164" stroke="#FFD84D" strokeWidth="3" strokeLinecap="round" />

          {/* GCT Mini Logo Sticker on laptop lid */}
          <circle cx="120" cy="188" r="8" fill="#FF6B35" stroke="#171717" strokeWidth="2" />
          <text x="120" y="191" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#FFFFFF">GCT</text>
        </g>

        {/* Coffee Cup Accessory for coffee state */}
        {state === 'coffee' && (
          <g id="coffee-cup" transform="translate(165, 160)">
            <rect x="0" y="10" width="22" height="28" rx="4" fill="#FFFFFF" stroke="#171717" strokeWidth="3" />
            <path d="M22 16C28 16 28 26 22 26" fill="none" stroke="#171717" strokeWidth="3" />
            <text x="11" y="27" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FF6B35">☕</text>
            {/* Steam */}
            <path d="M6 5C6 0 10 2 10 -3" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
            <path d="M14 6C14 1 18 3 18 -2" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
