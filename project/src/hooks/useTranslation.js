import { useLanguage } from '../contexts/LanguageContext';
import { getTranslation } from '../locales';

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key, fallback = null) => {
    const translation = getTranslation(language, key);
    return translation !== key ? translation : (fallback || key);
  };

  return { t, language };
};
