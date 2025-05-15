import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

// Define the supported languages
const supportedLngs = ['en', 'ar', 'hi'];

i18next
  // Use the HTTP backend to load translation files
  .use(HttpBackend)
  // Detect user language (browser, cookies, localStorage, etc.)
  .use(LanguageDetector)
  // Pass i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Supported languages
    supportedLngs,
    // Fallback language if the user's language is not supported
    fallbackLng: 'en',
    // Debug mode (set to false in production)
    debug: process.env.NODE_ENV === 'development',
    // Detection options for LanguageDetector
    detection: {
      // Order of language detection methods
      order: ['localStorage', 'navigator', 'path'],
      // Where to store the language (localStorage key)
      lookupLocalStorage: 'i18nextLng',
      // Cache the language in localStorage
      caches: ['localStorage'],
    },
    // Backend options for loading translation files
    backend: {
      // Path to translation files
      loadPath: '/locales/{{lng}}/translation.json',
    },
    // React-i18next options
    react: {
      useSuspense: false, // Set to false to avoid Suspense issues
    },
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18next;