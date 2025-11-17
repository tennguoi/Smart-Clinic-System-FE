import { vi } from './vi.js';
import { en } from './en.js';

export const translations = {
  vi,
  en
};

export const getTranslation = (language, key) => {
  const keys = key.split('.');
  let translation = translations[language] || translations.vi;
  
  for (const k of keys) {
    translation = translation[k];
    if (!translation) break;
  }
  
  return translation || key;
};
