import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources } from '../resources/i18n.resources';

export const initI18n = () =>
  i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      lng: 'en', // Add explicit default language
      debug: process.env.NODE_ENV === 'development',
      
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
      
      interpolation: {
        escapeValue: false, // React already escapes
      },
      
      react: {
        useSuspense: false, // ✅ CHANGE THIS TO FALSE
      },
      
      // Add these for better loading
      load: 'languageOnly',
      preload: ['en', 'hi', 'ar'],
      
      // Ensure immediate availability
      initImmediate: false,
    });
