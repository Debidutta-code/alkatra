import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector'; // ✅ import the plugin
import { resources } from '../resources/i18n.resources';

export const initI18n = () =>
  i18next
    .use(LanguageDetector) // ✅ use the plugin before initReactI18next
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage'],
      },
      react: {
        useSuspense: true,
      },
    });
