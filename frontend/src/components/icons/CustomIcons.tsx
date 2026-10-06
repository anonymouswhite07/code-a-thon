'use client';

import React from 'react';

interface IconProps {
  size?: number;
  className?: string;
}

/**
 * 1. Brand Terminal Icon:
 * Distinctive dual-tone terminal console with glowing prompt and circuit nodes
 */
export const BrandTerminalIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2" y="4" width="28" height="24" rx="6" fill="#171717" stroke="#171717" strokeWidth="2" />
    <path d="M2 11H30" stroke="#374151" strokeWidth="1.5" />
    <circle cx="6.5" cy="7.5" r="1.5" fill="#EF4444" />
    <circle cx="11.5" cy="7.5" r="1.5" fill="#F59E0B" />
    <circle cx="16.5" cy="7.5" r="1.5" fill="#10B981" />
    {/* Terminal Command Prompt */}
    <path d="M7 16L12 20L7 24" stroke="#B8E63E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="15" y1="24" x2="22" y2="24" stroke="#FFD84D" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

/**
 * 2. Championship Cup Icon:
 * Architectural dual-tone trophy with laurel engravings, star crest, and pedestal
 */
export const ChampionshipCupIcon: React.FC<IconProps> = ({ size = 28, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Trophy Cup */}
    <path
      d="M9 6H27V16C27 21 23 25 18 25C13 25 9 21 9 16V6Z"
      fill="#FFD84D"
      stroke="#171717"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    {/* Star Crest */}
    <path
      d="M18 10L19.2 13.5H23L20 15.6L21.2 19L18 17L14.8 19L16 15.6L13 13.5H16.8L18 10Z"
      fill="#FF6B35"
      stroke="#171717"
      strokeWidth="1"
    />
    {/* Left Handle */}
    <path d="M9 10H5C3.5 10 2.5 12 3 14C4 18 7 19 9 19" stroke="#171717" strokeWidth="2.5" strokeLinecap="round" />
    {/* Right Handle */}
    <path d="M27 10H31C32.5 10 33.5 12 33 14C32 18 29 19 27 19" stroke="#171717" strokeWidth="2.5" strokeLinecap="round" />
    {/* Stem */}
    <path d="M18 25V29" stroke="#171717" strokeWidth="3" strokeLinecap="round" />
    {/* Pedestal Base */}
    <rect x="10" y="29" width="16" height="4" rx="1.5" fill="#3155FF" stroke="#171717" strokeWidth="2" />
  </svg>
);

/**
 * 3. Algorithmic Snake Icon:
 * Stylized geometric segmented serpent for Python logic
 */
export const AlgorithmicSnakeIcon: React.FC<IconProps> = ({ size = 28, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Upper Python Head / Body */}
    <path
      d="M18 3H10C6 3 4 5 4 9V14C4 18 6 20 10 20H18V16H10C8.5 16 8 15 8 13.5V9.5C8 8 8.5 7 10 7H18V3Z"
      fill="#3155FF"
      stroke="#171717"
      strokeWidth="2"
    />
    <circle cx="9" cy="6" r="1.5" fill="white" />
    {/* Lower Body */}
    <path
      d="M18 33H26C30 33 32 31 32 27V22C32 18 30 16 26 16H18V20H26C27.5 20 28 21 28 22.5V26.5C28 28 27.5 29 26 29H18V33Z"
      fill="#FFD84D"
      stroke="#171717"
      strokeWidth="2"
    />
    <circle cx="27" cy="30" r="1.5" fill="#171717" />
  </svg>
);

/**
 * 4. Code Play Icon:
 * Sharp faceted triangular action trigger with brutalist edge
 */
export const CodePlayIcon: React.FC<IconProps> = ({ size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M6 4L20 12L6 20V4Z"
      fill="#B8E63E"
      stroke="#171717"
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
    <circle cx="10" cy="12" r="1.5" fill="#171717" />
  </svg>
);

/**
 * 5. High-Voltage Logic Lightning Glyph:
 * Precision angular bolt with shadow
 */
export const LogicBoltIcon: React.FC<IconProps> = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M13 2L4 14H12L11 22L20 10H12L13 2Z"
      fill="#FF6B35"
      stroke="#171717"
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 6. Steaming Collegiate Coffee Mug:
 * Retro ceramic mug with dual steam ribbons
 */
export const SteamingMugIcon: React.FC<IconProps> = ({ size = 24, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Steam Ribbons */}
    <path d="M10 3C10 5 12 6 12 8" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" />
    <path d="M16 2C16 4 18 5 18 7" stroke="#FFD84D" strokeWidth="2" strokeLinecap="round" />
    <path d="M22 3C22 5 24 6 24 8" stroke="#B8E63E" strokeWidth="2" strokeLinecap="round" />
    {/* Mug Body */}
    <rect x="6" y="10" width="18" height="17" rx="4" fill="#FDFBF7" stroke="#171717" strokeWidth="2" />
    {/* Mug Handle */}
    <path d="M24 13H27C28.5 13 29.5 14.5 29 16C28 19 26 21 24 21" stroke="#171717" strokeWidth="2.5" strokeLinecap="round" />
    {/* Liquid Line */}
    <line x1="9" y1="14" x2="21" y2="14" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/**
 * 7. Hexagonal Verified Check:
 * Brutalist badge with bold check
 */
export const HexCheckIcon: React.FC<IconProps> = ({ size = 22, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" fill="#10B981" stroke="#171717" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M8 14L12 18L20 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * 8. Gateway Portal Emblem:
 * Concentric architectural arches with core ignition point
 */
export const GatewayPortalIcon: React.FC<IconProps> = ({ size = 32, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Outer Arch */}
    <path d="M6 32V16C6 9.4 11.4 4 18 4C24.6 4 30 9.4 30 16V32" stroke="#171717" strokeWidth="2.5" strokeLinecap="round" />
    {/* Inner Arch */}
    <path d="M11 32V17C11 13.1 14.1 10 18 10C21.9 10 25 13.1 25 17V32" fill="#FFD84D" fillOpacity="0.4" stroke="#FF6B35" strokeWidth="2" />
    {/* Portal Energy Core */}
    <circle cx="18" cy="21" r="4" fill="#3155FF" stroke="#171717" strokeWidth="2" />
    <circle cx="18" cy="21" r="1.5" fill="#B8E63E" />
    <line x1="2" y1="32" x2="34" y2="32" stroke="#171717" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
