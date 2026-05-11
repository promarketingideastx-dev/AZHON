import { GLOBAL_SEASON_CONFIG } from '@/config/season';

export default function ActiveSeasonBadge({ dict }: { dict: any }) {
  const isDefault = GLOBAL_SEASON_CONFIG.id === 'AZHON_DEFAULT';
  
  // If we are in default mode, use the normal AZHON badge from dict.
  // Otherwise, use the campaign ID. (Ideally this would come from a CMS or dict mapped to id)
  const badgeText = isDefault 
    ? (dict?.home?.normal_badge || 'Descubre AZHON') 
    : GLOBAL_SEASON_CONFIG.id.replace(/_/g, ' ').toUpperCase() + ' CAMPAIGN';

  return (
    <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-6 shadow-sm ${
      isDefault 
        ? 'bg-black text-white' // Premium standard look
        : 'bg-white text-orange-500' // Seasonal / Promo look
    }`}>
      {badgeText}
    </span>
  );
}
