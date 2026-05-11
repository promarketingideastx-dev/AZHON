'use client';

import React from 'react';
import { SeasonEffectConfig } from '@/config/season';

const PRODUCT_EMOJIS = ['🎁', '⌚', '📱', '💻', '🛍️', '🎧', '📸', '👟'];

export default function ProductRain({ config }: { config: SeasonEffectConfig }) {
  // Use a healthy amount of products raining to create an impact
  const count = Math.max(15, Math.min(30, Math.floor(config.density * 0.3)));

  return (
    <>
      <style>{`
        .effect-product {
          position: absolute;
          opacity: 0;
          animation: rainProducts linear infinite;
          user-select: none;
          filter: drop-shadow(0px 10px 15px rgba(0,0,0,0.4));
        }
        @keyframes rainProducts {
          0% {
            transform: translateY(-10vh) rotate(-20deg);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(20deg);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .effect-product {
            animation-duration: 35s !important;
            opacity: 0.5 !important;
          }
        }
      `}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {Array.from({ length: count }).map((_, i) => {
          const left = Math.random() * 100;
          const delay = Math.random() * 15;
          // Target speed of ~15s as requested by user, with some variance
          const duration = 12 + Math.random() * 8;
          const emojiIndex = Math.floor(Math.random() * PRODUCT_EMOJIS.length);
          // 100% larger and high variance: from 40px to 120px
          const size = 40 + Math.random() * 80;
          // Alternating depths (z-index simulation with scale)
          const scale = 0.8 + Math.random() * 0.7;

          return (
            <div
              key={i}
              className="effect-product flex items-center justify-center"
              style={{
                left: left + '%',
                top: '-10%',
                fontSize: size + 'px',
                animationDelay: delay + 's',
                animationDuration: duration + 's',
                // Add some random base rotation and scale for variety
                transform: 'scale(' + scale + ') rotate(' + (Math.random() * 40 - 20) + 'deg)',
              }}
            >
              {PRODUCT_EMOJIS[emojiIndex]}
            </div>
          );
        })}
      </div>
    </>
  );
}
