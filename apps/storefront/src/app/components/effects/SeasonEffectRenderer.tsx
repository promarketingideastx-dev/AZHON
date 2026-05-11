'use client';

import React, { useEffect, useState } from 'react';
import { EffectZone, GLOBAL_SEASON_CONFIG } from '@/config/season';
import HeartsSoft from './particles/HeartsSoft';
import SnowLight from './particles/SnowLight';
import SparklesWarm from './particles/SparklesWarm';
import ConfettiSoft from './particles/ConfettiSoft';
import TechStreaksSoft from './particles/TechStreaksSoft';
import ProductRain from './particles/ProductRain';

const EffectMap = {
  none: () => null,
  hearts_soft: HeartsSoft,
  snow_light: SnowLight,
  sparkles_warm: SparklesWarm,
  confetti_soft: ConfettiSoft,
  tech_streaks_soft: TechStreaksSoft,
  product_rain: ProductRain,
};

export default function SeasonEffectRenderer({ zone }: { zone: EffectZone }) {
  // Use state to delay rendering to client to avoid hydration mismatches
  // and safely check mobile viewport sizes if needed.
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) return null;

  const config = GLOBAL_SEASON_CONFIG.active ? GLOBAL_SEASON_CONFIG.effects[zone] : null;

  if (!config || !config.enabled || config.type === 'none') {
    return null;
  }

  if (isMobile && !config.mobileEnabled) {
    return null;
  }

  const ParticleComponent = EffectMap[config.type as keyof typeof EffectMap];

  if (!ParticleComponent) {
    return null; // Fallback for unsupported effect types
  }

  // Pointer events none is strictly enforced on the wrapper
  return (
    <div 
      className={`absolute inset-0 pointer-events-none overflow-hidden ${config.zIndexMode === 'behind' ? 'z-0' : 'z-50'}`}
      aria-hidden="true"
    >
      <ParticleComponent config={config} />
    </div>
  );
}
