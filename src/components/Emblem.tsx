import React from 'react';
import { useBranding } from '../context/BrandingContext';

interface EmblemProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  customSrc?: string | null;
}

export const Emblem: React.FC<EmblemProps> = ({ className = '', size = 'md', customSrc }) => {
  const { logoUrl } = useBranding();
  const activeLogo = customSrc !== undefined ? customSrc : logoUrl;

  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const currentSize = sizeMap[size];

  // If a custom logo has been uploaded by the admin, render it with the light green outer border
  if (activeLogo) {
    return (
      <div 
        className={`relative shrink-0 flex items-center justify-center rounded-full bg-white/95 border-2 border-emerald-500/80 shadow-xs p-0.5 overflow-hidden select-none ${currentSize} ${className}`}
        title="DARE ARQAM Institutional Emblem"
      >
        <img
          src={activeLogo}
          alt="DARE ARQAM Official Logo"
          className="w-full h-full object-contain select-none max-w-full max-h-full"
          loading="eager"
          decoding="sync"
          style={{ imageRendering: 'auto' }}
        />
      </div>
    );
  }

  // Default Vector Emblem
  return (
    <div className={`relative shrink-0 flex items-center justify-center rounded-full bg-emerald-900 border-2 border-amber-600/40 shadow-sm ${currentSize} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full p-0.5 text-white"
        aria-hidden="true"
      >
        {/* Outer Circular Rims */}
        <circle cx="50" cy="50" r="47" stroke="#064E3B" strokeWidth="2.5" fill="#064E3B" />
        <circle cx="50" cy="50" r="43" stroke="#D97706" strokeWidth="1" strokeDasharray="1.5 2" />
        <circle cx="50" cy="50" r="38" stroke="#10B981" strokeWidth="0.75" />

        {/* Crescent and Star in upper zone */}
        <path
          d="M 50 18 A 12 12 0 1 0 58 37 A 9.5 9.5 0 1 1 50 18 Z"
          fill="#FFFFFF"
        />
        <polygon
          points="58,23 60,27 64,27 61,30 62,34 58,31 54,34 55,30 52,27 56,27"
          fill="#FDE68A"
        />

        {/* Open Academic Book */}
        <path
          d="M 32 54 C 40 50, 48 51, 50 56 C 52 51, 60 50, 68 54 L 68 70 C 60 66, 52 67, 50 72 C 48 67, 40 66, 32 70 Z"
          fill="#FFFFFF"
          stroke="#064E3B"
          strokeWidth="1.2"
        />
        {/* Book spine line */}
        <line x1="50" y1="56" x2="50" y2="72" stroke="#064E3B" strokeWidth="1.2" />

        {/* Laurel / Olive Wreath on sides */}
        <path
          d="M 22 55 C 20 64, 25 76, 35 81"
          stroke="#FDE68A"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M 78 55 C 80 64, 75 76, 65 81"
          stroke="#FDE68A"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Foundation Year Accent */}
        <text
          x="50"
          y="84"
          textAnchor="middle"
          fill="#FDE68A"
          fontSize="5.5"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
          letterSpacing="0.5"
        >
          EST. 1998
        </text>
      </svg>
    </div>
  );
};

