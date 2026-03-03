'use client';

import React from 'react';

/* ========================================
   Pixel Cat SVG Components
   All cats are inline SVGs for zero-latency rendering.
   Each cat is a pixel-art style design on a virtual 16x16 grid.
   ======================================== */

// Idle cat - sitting and blinking occasionally
export function PixelCatIdle({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={`pixel-cat ${className}`}
      style={{ imageRendering: 'pixelated' }} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ears */}
      <rect x="3" y="2" width="2" height="2" fill="var(--primary)" />
      <rect x="11" y="2" width="2" height="2" fill="var(--primary)" />
      {/* Ear insides */}
      <rect x="4" y="3" width="1" height="1" fill="var(--paw-pink)" />
      <rect x="11" y="3" width="1" height="1" fill="var(--paw-pink)" />
      {/* Head */}
      <rect x="4" y="4" width="8" height="5" fill="var(--primary)" />
      <rect x="3" y="5" width="1" height="3" fill="var(--primary)" />
      <rect x="12" y="5" width="1" height="3" fill="var(--primary)" />
      {/* Eyes */}
      <rect x="5" y="5" width="2" height="2" fill="var(--text)" className="cat-eye" />
      <rect x="9" y="5" width="2" height="2" fill="var(--text)" className="cat-eye" />
      {/* Eye shine */}
      <rect x="5" y="5" width="1" height="1" fill="white" />
      <rect x="9" y="5" width="1" height="1" fill="white" />
      {/* Nose */}
      <rect x="7" y="7" width="2" height="1" fill="var(--paw-pink)" />
      {/* Mouth */}
      <rect x="6" y="8" width="1" height="1" fill="var(--primary-dark)" />
      <rect x="9" y="8" width="1" height="1" fill="var(--primary-dark)" />
      {/* Body */}
      <rect x="4" y="9" width="8" height="4" fill="var(--primary)" />
      <rect x="3" y="10" width="1" height="2" fill="var(--primary)" />
      <rect x="12" y="10" width="1" height="2" fill="var(--primary)" />
      {/* Belly */}
      <rect x="6" y="10" width="4" height="2" fill="var(--surface)" />
      {/* Paws */}
      <rect x="4" y="13" width="2" height="1" fill="var(--paw-pink)" />
      <rect x="10" y="13" width="2" height="1" fill="var(--paw-pink)" />
      {/* Tail */}
      <rect x="12" y="11" width="1" height="1" fill="var(--primary)" />
      <rect x="13" y="10" width="1" height="1" fill="var(--primary)" />
      <rect x="14" y="9" width="1" height="1" fill="var(--primary)" />
    </svg>
  );
}

// Waving cat - greeting animation
export function PixelCatWave({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={`pixel-cat ${className}`}
      style={{ imageRendering: 'pixelated' }} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ears */}
      <rect x="3" y="2" width="2" height="2" fill="var(--accent)" />
      <rect x="11" y="2" width="2" height="2" fill="var(--accent)" />
      <rect x="4" y="3" width="1" height="1" fill="var(--paw-pink)" />
      <rect x="11" y="3" width="1" height="1" fill="var(--paw-pink)" />
      {/* Head */}
      <rect x="4" y="4" width="8" height="5" fill="var(--accent)" />
      <rect x="3" y="5" width="1" height="3" fill="var(--accent)" />
      <rect x="12" y="5" width="1" height="3" fill="var(--accent)" />
      {/* Happy eyes (^_^) */}
      <rect x="5" y="6" width="2" height="1" fill="var(--text)" />
      <rect x="9" y="6" width="2" height="1" fill="var(--text)" />
      {/* Nose + smile */}
      <rect x="7" y="7" width="2" height="1" fill="var(--paw-pink)" />
      <rect x="6" y="8" width="4" height="1" fill="var(--primary-dark)" />
      {/* Body */}
      <rect x="4" y="9" width="8" height="4" fill="var(--accent)" />
      <rect x="6" y="10" width="4" height="2" fill="var(--surface)" />
      {/* Waving paw (raised) */}
      <rect x="2" y="7" width="1" height="1" fill="var(--paw-pink)" />
      <rect x="3" y="8" width="1" height="2" fill="var(--accent)" />
      {/* Other paw */}
      <rect x="10" y="13" width="2" height="1" fill="var(--paw-pink)" />
      <rect x="4" y="13" width="2" height="1" fill="var(--paw-pink)" />
      {/* Tail */}
      <rect x="12" y="11" width="1" height="1" fill="var(--accent)" />
      <rect x="13" y="10" width="1" height="2" fill="var(--accent)" />
    </svg>
  );
}

// Sleeping cat - curled up, zzz
export function PixelCatSleep({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={`pixel-cat ${className}`}
      style={{ imageRendering: 'pixelated' }} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ears */}
      <rect x="2" y="6" width="2" height="2" fill="var(--secondary)" />
      <rect x="3" y="7" width="1" height="1" fill="var(--paw-pink)" />
      {/* Curled body */}
      <rect x="3" y="8" width="10" height="4" fill="var(--secondary)" />
      <rect x="2" y="9" width="1" height="2" fill="var(--secondary)" />
      {/* Head on paws */}
      <rect x="3" y="8" width="5" height="3" fill="var(--secondary)" />
      {/* Closed eyes */}
      <rect x="4" y="9" width="2" height="1" fill="var(--text)" />
      {/* Nose */}
      <rect x="5" y="10" width="1" height="1" fill="var(--paw-pink)" />
      {/* Tail wrapping around */}
      <rect x="12" y="8" width="1" height="1" fill="var(--secondary)" />
      <rect x="13" y="7" width="1" height="1" fill="var(--secondary)" />
      <rect x="13" y="6" width="1" height="1" fill="var(--secondary)" />
      {/* Belly showing */}
      <rect x="8" y="9" width="3" height="2" fill="var(--surface)" />
      {/* Paws */}
      <rect x="3" y="12" width="2" height="1" fill="var(--paw-pink)" />
      {/* Zzz */}
      <rect x="7" y="4" width="1" height="1" fill="var(--text-muted)" className="zzz-1" />
      <rect x="9" y="3" width="2" height="1" fill="var(--text-muted)" className="zzz-2" />
      <rect x="11" y="1" width="3" height="2" fill="var(--text-muted)" className="zzz-3" />
    </svg>
  );
}

// Happy cat - jumping with sparkles
export function PixelCatHappy({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={`pixel-cat ${className}`}
      style={{ imageRendering: 'pixelated' }} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Sparkles */}
      <rect x="1" y="2" width="1" height="1" fill="var(--accent)" className="sparkle-1" />
      <rect x="14" y="1" width="1" height="1" fill="var(--accent)" className="sparkle-2" />
      <rect x="0" y="6" width="1" height="1" fill="var(--accent)" className="sparkle-3" />
      {/* Ears (perked up) */}
      <rect x="3" y="1" width="2" height="3" fill="var(--yarn-red)" />
      <rect x="11" y="1" width="2" height="3" fill="var(--yarn-red)" />
      <rect x="4" y="2" width="1" height="1" fill="var(--paw-pink)" />
      <rect x="11" y="2" width="1" height="1" fill="var(--paw-pink)" />
      {/* Head */}
      <rect x="4" y="4" width="8" height="5" fill="var(--yarn-red)" />
      <rect x="3" y="5" width="1" height="3" fill="var(--yarn-red)" />
      <rect x="12" y="5" width="1" height="3" fill="var(--yarn-red)" />
      {/* Big happy eyes */}
      <rect x="5" y="5" width="2" height="2" fill="var(--text)" />
      <rect x="9" y="5" width="2" height="2" fill="var(--text)" />
      <rect x="5" y="5" width="1" height="1" fill="white" />
      <rect x="9" y="5" width="1" height="1" fill="white" />
      {/* Big smile */}
      <rect x="7" y="7" width="2" height="1" fill="var(--paw-pink)" />
      <rect x="6" y="8" width="1" height="1" fill="var(--yarn-red)" opacity="0.7" />
      <rect x="9" y="8" width="1" height="1" fill="var(--yarn-red)" opacity="0.7" />
      {/* Body (floating - gap before ground) */}
      <rect x="4" y="9" width="8" height="3" fill="var(--yarn-red)" />
      <rect x="6" y="10" width="4" height="1" fill="var(--surface)" />
      {/* Raised paws */}
      <rect x="3" y="9" width="1" height="1" fill="var(--paw-pink)" />
      <rect x="12" y="9" width="1" height="1" fill="var(--paw-pink)" />
      {/* Feet (in air) */}
      <rect x="5" y="12" width="2" height="1" fill="var(--paw-pink)" />
      <rect x="9" y="12" width="2" height="1" fill="var(--paw-pink)" />
    </svg>
  );
}

// Typing cat - at keyboard, for AI/chat states
export function PixelCatType({ size = 48, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={`pixel-cat ${className}`}
      style={{ imageRendering: 'pixelated' }} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ears */}
      <rect x="3" y="1" width="2" height="2" fill="var(--fish-blue)" />
      <rect x="11" y="1" width="2" height="2" fill="var(--fish-blue)" />
      <rect x="4" y="2" width="1" height="1" fill="var(--paw-pink)" />
      <rect x="11" y="2" width="1" height="1" fill="var(--paw-pink)" />
      {/* Head */}
      <rect x="4" y="3" width="8" height="5" fill="var(--fish-blue)" />
      <rect x="3" y="4" width="1" height="3" fill="var(--fish-blue)" />
      <rect x="12" y="4" width="1" height="3" fill="var(--fish-blue)" />
      {/* Focused eyes */}
      <rect x="5" y="4" width="2" height="2" fill="var(--text)" />
      <rect x="9" y="4" width="2" height="2" fill="var(--text)" />
      <rect x="6" y="4" width="1" height="1" fill="white" />
      <rect x="10" y="4" width="1" height="1" fill="white" />
      {/* Nose */}
      <rect x="7" y="6" width="2" height="1" fill="var(--paw-pink)" />
      {/* Tongue sticking out (concentrating) */}
      <rect x="8" y="7" width="1" height="1" fill="var(--paw-pink)" />
      {/* Body */}
      <rect x="4" y="8" width="8" height="3" fill="var(--fish-blue)" />
      <rect x="6" y="9" width="4" height="1" fill="var(--surface)" />
      {/* Keyboard */}
      <rect x="2" y="11" width="12" height="2" fill="var(--border)" />
      <rect x="3" y="11" width="1" height="1" fill="var(--text-muted)" />
      <rect x="5" y="11" width="1" height="1" fill="var(--text-muted)" />
      <rect x="7" y="11" width="1" height="1" fill="var(--text-muted)" />
      <rect x="9" y="11" width="1" height="1" fill="var(--text-muted)" />
      <rect x="11" y="11" width="1" height="1" fill="var(--text-muted)" />
      {/* Paws on keyboard */}
      <rect x="4" y="11" width="1" height="1" fill="var(--paw-pink)" />
      <rect x="10" y="11" width="1" height="1" fill="var(--paw-pink)" />
    </svg>
  );
}

// Floating cats background — random cats drift across the page
const FLOAT_CATS = [PixelCatIdle, PixelCatSleep, PixelCatHappy, PixelCatWave];

export function FloatingCats({ count = 6 }: { count?: number }) {
  const cats = React.useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const CatComponent = FLOAT_CATS[i % FLOAT_CATS.length];
      const top = 10 + (i * 67) % 80;
      const left = 5 + (i * 37) % 85;
      const delay = (i * 1.3) % 5;
      const dur = 8 + (i % 4) * 3;
      return { CatComponent, top, left, delay, dur, id: i };
    });
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {cats.map(({ CatComponent, top, left, delay, dur, id }) => (
        <div key={id} className="absolute opacity-[0.07]"
          style={{
            top: `${top}%`, left: `${left}%`,
            animation: `catFloat ${dur}s ease-in-out ${delay}s infinite alternate`,
          }}>
          <CatComponent size={32} />
        </div>
      ))}
    </div>
  );
}

// Cat paw print trail (decorative)
export function PawPrint({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" className={className}
      style={{ imageRendering: 'pixelated' }} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="8" width="4" height="4" rx="1" />
      <rect x="4" y="4" width="2" height="3" rx="1" />
      <rect x="7" y="3" width="2" height="3" rx="1" />
      <rect x="10" y="4" width="2" height="3" rx="1" />
      <rect x="12" y="7" width="2" height="2" rx="1" />
    </svg>
  );
}
