'use client';

import React from 'react';
import { SeasonEffectConfig } from '@/config/season';

export default function SparklesWarm({ config }: { config: SeasonEffectConfig }) {
  const count = Math.max(15, Math.min(50, Math.floor(config.density * 0.5)));

  return (
    <>
      <style>{`
        .effect-sparkle {
          position: absolute;
          background: #FFD700;
          border-radius: 50%;
          opacity: 0;
          animation: twinkleSparkle ease-in-out infinite;
          box-shadow: 0 0 10px 2px rgba(255, 215, 0, 0.4);
        }
        @keyframes twinkleSparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .effect-sparkle {
            animation-duration: 8s !important;
          }
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => {
          const left = Math.random() * 100;
          const top = Math.random() * 100;
          const delay = Math.random() * 5;
          const duration = 2 + Math.random() * 4;
          const size = 2 + Math.random() * 4;

          return (
             <div
              key={i}
              className="effect-sparkle"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${size}px`,
                height: `${size}px`,
                animationDelay: `${delay}s`,
                animationDuration: `${duration}s`,
              }}
            />
          );
        })}
      </div>
    </>
  );
}
