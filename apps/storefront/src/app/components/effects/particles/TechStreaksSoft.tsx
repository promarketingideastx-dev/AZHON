'use client';

import React from 'react';
import { SeasonEffectConfig } from '@/config/season';

export default function TechStreaksSoft({ config }: { config: SeasonEffectConfig }) {
  const count = Math.max(5, Math.min(20, Math.floor(config.density * 0.2)));

  return (
    <>
      <style>{`
        .effect-streak {
          position: absolute;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,165,0,0.8) 50%, rgba(255,255,255,0) 100%);
          border-radius: 100%;
          opacity: 0;
          animation: driftStreak linear infinite;
          filter: blur(2px);
        }
        @keyframes driftStreak {
          0% {
            transform: translate(-100vw, 10vh) rotate(15deg) scaleX(1);
            opacity: 0;
          }
          20% {
            opacity: 0.6;
          }
          80% {
            opacity: 0.6;
          }
          100% {
            transform: translate(100vw, -10vh) rotate(15deg) scaleX(3);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .effect-streak {
            animation-duration: 25s !important;
            opacity: 0.2 !important;
          }
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => {
          const top = Math.random() * 100;
          const delay = Math.random() * 10;
          const duration = 15 + Math.random() * 15; // Slow, premium, ambient movement
          const width = 100 + Math.random() * 200;
          const height = 1 + Math.random() * 3;

          return (
             <div
              key={i}
              className="effect-streak"
              style={{
                top: `${top}%`,
                left: '-20%',
                width: `${width}px`,
                height: `${height}px`,
                animationDelay: `-${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        })}
      </div>
    </>
  );
}
