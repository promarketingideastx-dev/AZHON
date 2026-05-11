export type EffectType = 
  | 'none' 
  | 'hearts_soft' 
  | 'confetti_soft' 
  | 'snow_light' 
  | 'sparkles_warm';

export type EffectZone = 
  | 'homeHero' 
  | 'homeSecondaryBanner' 
  | 'homeSeasonStrip' 
  | 'categoryHero' 
  | 'plpAccent' 
  | 'pdpAccent' 
  | 'promoCard' 
  | 'landingHero';

export interface SeasonEffectConfig {
  enabled: boolean;
  type: EffectType;
  intensity: 'low' | 'medium' | 'high';
  density: number; // 1-100
  mobileEnabled: boolean;
  reducedMotionBehavior: 'disable' | 'reduce_speed';
  zIndexMode: 'behind' | 'overlay';
  colorMode: 'light' | 'dark' | 'brand';
}

export interface SeasonConfig {
  id: string; // e.g. 'San_Valentin', 'Navidad'
  active: boolean;
  effects: Partial<Record<EffectZone, SeasonEffectConfig>>;
}

// Master Active Configuration
// Can be swapped out by changing 'active' or modifying the zones.
export const GLOBAL_SEASON_CONFIG: SeasonConfig = {
  id: 'San_Valentin', // Example active season
  active: true,
  effects: {
    homeHero: {
      enabled: true,
      type: 'hearts_soft',
      intensity: 'medium',
      density: 50,
      mobileEnabled: true,
      reducedMotionBehavior: 'disable',
      zIndexMode: 'behind',
      colorMode: 'brand',
    },
    // Other zones can be configured here structurally but will only render
    // if a `<SeasonEffectRenderer zone="categoryHero" />` is actually mounted in the UI.
    categoryHero: {
      enabled: false,
      type: 'hearts_soft',
      intensity: 'low',
      density: 20,
      mobileEnabled: false,
      reducedMotionBehavior: 'disable',
      zIndexMode: 'behind',
      colorMode: 'light',
    }
  }
};
