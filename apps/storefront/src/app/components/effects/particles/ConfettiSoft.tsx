'use client';

import React from 'react';
import { SeasonEffectConfig } from '@/config/season';

export default function ConfettiSoft({ config }: { config: SeasonEffectConfig }) {
  const count = Math.max(20, Math.min(60, Math.floor(config.density * 0.6)));
  const colors = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa'];

  return (
    <>
      <style>{`
        .effect-confetti {
          position: absolute;
          opacity: 0;
          animation: fallConfetti linear infinite;
        }
        @keyframes fallConfetti {
          0% {
            transform: translateY(-20px) rotate(0deg) rotateX(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          90% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(100vh) rotate(360deg) rotateX(360deg);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .effect-confetti {
            animation-duration: 20s !important;
            opacity: 0.5 !important;
          }
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 10;
          const duration = 6 + Math.random() * 8;
          const width = 6 + Math.random() * 6;
          const height = 10 + Math.random() * 10;
          const color = colors[Math.floor(Math.random() * colors.length)];

          return (
             <div
              key={i}
              className="effect-confetti"
              style={{
                left: `${left}%`,
                top: '-20px',
                width: `${width}px`,
                height: `${height}px`,
                backgroundColor: color,
                animationDelay: `-${delay}s`,
                animationDuration: `${duration}s`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px'
              }}
            />
          );
        })}
      </div>
    </>
  );
}
