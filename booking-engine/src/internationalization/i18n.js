import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enTranslation from './translations/en/translation.json';
import hiTranslation from './translations/hi/translation.json';
import arTranslation from './translations/ar/translation.json';

// Define resources
const resources = {
  en: {
    translation: enTranslation,
  },
  hi: {
    translation: hiTranslation,
  },
  ar: {
    translation: arTranslation,
  },
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en', // Fallback language if translation is missing
    react: {
      useSuspense: true, // Enable suspense for React
    },
  });

export default i18next;