export type HomeMode = 'HOME_NORMAL' | 'HOME_PRODUCT_FEED';

export const GLOBAL_HOME_CONFIG = {
  // Master switch for the Home Architecture.
  // 'HOME_PRODUCT_FEED' prioritizes discovery blocks.
  // 'HOME_NORMAL' prioritizes categorized marketplace layout.
  activeMode: 'HOME_PRODUCT_FEED' as HomeMode,
};
