'use client';

import React from 'react';
import { SeasonEffectConfig } from '@/config/season';

export default function SnowLight({ config }: { config: SeasonEffectConfig }) {
  const count = Math.max(20, Math.min(80, Math.floor(config.density * 0.8)));

  return (
    <>
      <style>{`
        .effect-snow {
          position: absolute;
          background: white;
          border-radius: 50%;
          opacity: 0;
          animation: fallSnow linear infinite;
        }
        @keyframes fallSnow {
          0% {
            transform: translateY(-20px) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(100vh) translateX(20px);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .effect-snow {
            animation-duration: 25s !important;
            opacity: 0.4 !important;
          }
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 10;
          const duration = 8 + Math.random() * 10;
          const size = 3 + Math.random() * 5;

          return (
            <div
              key={i}
              className="effect-snow shadow-sm"
              style={{
                left: \`\${left}%\`,
                top: '-20px',
                width: \`\${size}px\`,
                height: \`\${size}px\`,
                animationDelay: \`-\${delay}s\`,
                animationDuration: \`\${duration}s\`,
                filter: \`blur(\${Math.random() * 2}px)\`
              }}
            />
          );
        })}
      </div>
    </>
  );
}
