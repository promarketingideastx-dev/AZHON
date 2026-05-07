export const SUPPORTED_COUNTRIES = ['hn', 'sv', 'gt', 'mx'];
export const DEFAULT_COUNTRY = 'hn';

export interface CountryConfig {
  code: string;
  currency: string;
  localeFallback: string;
}

export const COUNTRIES: Record<string, CountryConfig> = {
  hn: { code: 'HN', currency: 'HNL', localeFallback: 'es' },
  sv: { code: 'SV', currency: 'USD', localeFallback: 'es' },
  gt: { code: 'GT', currency: 'GTQ', localeFallback: 'es' },
  mx: { code: 'MX', currency: 'MXN', localeFallback: 'es' },
};
