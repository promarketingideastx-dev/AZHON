import es from './locales/es.json';
import en from './locales/en.json';
import ptBR from './locales/pt-BR.json';

const dictionaries: Record<string, any> = {
  es,
  en,
  'pt-BR': ptBR,
};

export const defaultLocale = 'es';

export function getDictionary(locale: string = defaultLocale) {
  return dictionaries[locale] || dictionaries[defaultLocale];
}
