'use client';

import React from 'react';

export type MascotState =
  | 'idle'
  | 'typing'
  | 'thinking'
  | 'confused'
  | 'failure'
  | 'debugging'
  | 'success'
  | 'coffee'
  | 'celebrating'
  | 'winner'
  | 'running';

interface CodeMascotProps {
  state?: MascotState;
  size?: number;
  className?: string;
  showSpeechBubble?: boolean;
  customQuote?: string;
  reactionText?: string;
}

const STATE_MESSAGES: Record<MascotState, string> = {
  idle: 'Ready to write your first line? 🚀',
  typing: 'char *ptr = malloc(sizeof(int));',
  thinking: 'There must be an O(N log N) approach...',
  confused: 'Wait... where did that edge case come from? 🤔',
  failure: 'Segmentation fault (core dumped)... 😭',
  debugging: 'Inspecting memory bounds & pointer offsets... 🔍',
  success: 'All test cases green! Accepted ✓',
  running: 'Executing against automated test suite...',
  coffee: 'Coffee: O(1) energy boost for the finals ☕',
  celebrating: 'Three rounds down! Unstoppable! 🎉',
  winner: 'Grand Champion 2026 🏆'
};

export const CodeMascot: React.FC<CodeMascotProps> = ({
  state = 'idle',
  size = 220,
  className = '',
  showSpeechBubble = true,
  customQuote,
  reactionText
}) => {
  const quote = customQuote || STATE_MESSAGES[state] || STATE_MESSAGES.idle;

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      {/* Speech Bubble */}
      {showSpeechBubble && (
        <div
          className={`mb-3 px-3.5 py-1.5 rounded-xl brutal-border brutal-shadow-sm font-mono text-xs font-black tracking-tight relative flex items-center gap-1.5 z-10 transition-all ${
            state === 'failure'
              ? 'bg-red-50 text-red-900 border-red-900'
              : state === 'confused'
              ? 'bg-amber-50 text-amber-950 border-amber-900'
              : state === 'debugging'
              ? 'bg-blue-50 text-blue-950 border-blue-900'
              : state === 'success'
              ? 'bg-emerald-50 text-emerald-950 border-emerald-900'
              : state === 'winner'
              ? 'bg-[#FFD84D] text-[#171717]'
              : 'bg-white text-[#171717]'
          }`}
        >
          <span>{quote}</span>
          <div
            className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${
              state === 'failure'
                ? 'border-t-red-900'
                : state === 'confused'
                ? 'border-t-amber-900'
                : state === 'debugging'
                ? 'border-t-blue-900'
                : state === 'success'
                ? 'border-t-emerald-900'
                : 'border-t-[#171717]'
            }`}
          />
        </div>
      )}

      {/* Floating Reaction Pill */}
      {reactionText && (
        <div className="absolute -top-3 -right-2 px-2 py-0.5 bg-[#FF6B35] text-white text-[10px] font-mono font-black uppercase rounded brutal-border rotate-6 z-20 animate-bounce">
          {reactionText}
        </div>
      )}

      {/* Vector Student Programmer Mascot */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:scale-105"
      >
        {/* Subtle Background Circle Stamp */}
        <circle
          cx="120"
          cy="120"
          r="105"
          fill="#F7F4ED"
          stroke="#171717"
          strokeWidth="4"
          strokeDasharray="6 6"
        />

        {/* Hoodie / Torso */}
        <path
          d="M60 210C60 168 82 148 120 148C158 148 180 168 180 210"
          fill={
            state === 'failure'
              ? '#4B5563'
              : state === 'winner'
              ? '#171717'
              : state === 'debugging'
              ? '#0284C7'
              : state === 'confused'
              ? '#D97706'
              : '#3155FF'
          }
          stroke="#171717"
          strokeWidth="5"
          strokeLinejoin="round"
        />

        {/* Hoodie Drawstrings */}
        <path d="M108 148L108 175M132 148L132 175" stroke="#FFD84D" strokeWidth="4" strokeLinecap="round" />

        {/* Head / Face */}
        <rect
          x="75"
          y="50"
          width="90"
          height="85"
          rx="32"
          fill={state === 'failure' ? '#FED7AA' : '#FDE68A'}
          stroke="#171717"
          strokeWidth="5"
        />

        {/* Beanie / Hair */}
        <path d="M75 80C75 55 90 40 120 40C150 40 165 55 165 80" fill="#171717" />
        <path d="M120 35C125 25 135 30 130 40" stroke="#171717" strokeWidth="4" strokeLinecap="round" />

        {/* Glasses */}
        <rect x="85" y="75" width="28" height="24" rx="6" fill="#FFFFFF" stroke="#171717" strokeWidth="4" />
        <rect x="127" y="75" width="28" height="24" rx="6" fill="#FFFFFF" stroke="#171717" strokeWidth="4" />
        <line x1="113" y1="87" x2="127" y2="87" stroke="#171717" strokeWidth="4" />

        {/* State-specific Eyes & Expressions */}
        {state === 'typing' && (
          <>
            <circle cx="99" cy="87" r="4" fill="#171717" />
            <circle cx="141" cy="87" r="4" fill="#171717" />
            <circle cx="97" cy="85" r="1.5" fill="#FFFFFF" />
            <circle cx="139" cy="85" r="1.5" fill="#FFFFFF" />
          </>
        )}

        {state === 'thinking' && (
          <>
            <circle cx="99" cy="82" r="4" fill="#171717" />
            <circle cx="141" cy="82" r="4" fill="#171717" />
            <circle cx="150" cy="125" r="14" fill="#FDE68A" stroke="#171717" strokeWidth="4" />
          </>
        )}

        {state === 'confused' && (
          <>
            {/* Tilted eyes & swirl marks */}
            <circle cx="97" cy="85" r="4" fill="#171717" />
            <circle cx="139" cy="89" r="4" fill="#171717" />
            <path d="M88 71C94 67 104 69 108 73" stroke="#171717" strokeWidth="3" strokeLinecap="round" />
            <path d="M126 73C130 77 140 79 146 75" stroke="#171717" strokeWidth="3" strokeLinecap="round" />
            {/* Floating question mark */}
            <text x="165" y="75" fontSize="20" fontWeight="bold" fill="#FF6B35">?</text>
          </>
        )}

        {state === 'debugging' && (
          <>
            {/* Focused squint */}
            <path d="M92 87L106 87" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
            <path d="M134 87L148 87" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
            {/* Magnifying glass overlay */}
            <g transform="translate(140, 65)">
              <circle cx="12" cy="12" r="9" fill="#93C5FD" fillOpacity="0.4" stroke="#171717" strokeWidth="3" />
              <line x1="18" y1="18" x2="26" y2="26" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
            </g>
          </>
        )}

        {state === 'failure' && (
          <>
            <path d="M94 82L104 92M104 82L94 92" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
            <path d="M136 82L146 92M146 82L136 92" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
          </>
        )}

        {state === 'success' && (
          <>
            <path d="M92 86L99 92L106 82" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M134 86L141 92L148 82" stroke="#059669" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}

        {(state === 'celebrating' || state === 'winner') && (
          <>
            <path d="M92 88C94 80 104 80 106 88" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
            <path d="M134 88C136 80 146 80 148 88" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
            {state === 'winner' ? (
              <path
                d="M90 45L105 24L120 40L135 24L150 45Z"
                fill="#FFD84D"
                stroke="#171717"
                strokeWidth="4"
                strokeLinejoin="round"
              />
            ) : (
              <path
                d="M100 40L120 12L140 40Z"
                fill="#FF6B35"
                stroke="#171717"
                strokeWidth="4"
                strokeLinejoin="round"
              />
            )}
          </>
        )}

        {state === 'coffee' && (
          <>
            <circle cx="99" cy="87" r="4" fill="#171717" />
            <circle cx="141" cy="87" r="4" fill="#171717" />
            <path d="M92 95C98 97 102 96 106 94" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
            <path d="M134 95C140 97 144 96 148 94" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {(state === 'idle' || state === 'running') && (
          <>
            <circle cx="99" cy="87" r="4" fill="#171717" />
            <circle cx="141" cy="87" r="4" fill="#171717" />
          </>
        )}

        {/* Mouth Expressions */}
        {state === 'failure' ? (
          <path d="M110 118C115 112 125 112 130 118" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
        ) : state === 'confused' ? (
          <path d="M110 116C115 112 125 118 130 114" stroke="#171717" strokeWidth="3" strokeLinecap="round" />
        ) : state === 'debugging' ? (
          <line x1="112" y1="115" x2="128" y2="115" stroke="#171717" strokeWidth="3" strokeLinecap="round" />
        ) : state === 'success' || state === 'celebrating' || state === 'winner' ? (
          <path d="M108 112C112 122 128 122 132 112" stroke="#171717" strokeWidth="4" strokeLinecap="round" fill="#EF4444" />
        ) : state === 'thinking' ? (
          <line x1="112" y1="114" x2="128" y2="110" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
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
          {/* Laptop Screen */}
          <rect x="80" y="130" width="80" height="45" rx="4" fill="#171717" stroke="#171717" strokeWidth="4" />

          {/* Lines of code */}
          <line
            x1="88"
            y1="140"
            x2="115"
            y2="140"
            stroke={state === 'failure' ? '#EF4444' : state === 'debugging' ? '#38BDF8' : '#B8E63E'}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <line x1="88" y1="148" x2="145" y2="148" stroke="#3155FF" strokeWidth="3" strokeLinecap="round" />
          <line x1="95" y1="156" x2="135" y2="156" stroke="#FF6B35" strokeWidth="3" strokeLinecap="round" />
          <line x1="88" y1="164" x2="105" y2="164" stroke="#FFD84D" strokeWidth="3" strokeLinecap="round" />

          {/* GCT Mini Logo Sticker */}
          <circle cx="120" cy="188" r="8" fill="#FF6B35" stroke="#171717" strokeWidth="2" />
          <text x="120" y="191" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#FFFFFF">GCT</text>
        </g>

        {/* Steaming Coffee accessory for coffee state */}
        {state === 'coffee' && (
          <g id="coffee-accessory" transform="translate(165, 155)">
            <rect x="0" y="10" width="22" height="28" rx="4" fill="#FFFFFF" stroke="#171717" strokeWidth="3" />
            <path d="M22 16C28 16 28 26 22 26" fill="none" stroke="#171717" strokeWidth="3" />
            <text x="11" y="27" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#FF6B35">☕</text>
            <path d="M6 5C6 0 10 2 10 -3" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
            <path d="M14 6C14 1 18 3 18 -2" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};
