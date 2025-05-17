import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from '../resources/i18n.resources';

// Initialize i18next
export const initI18n = () =>
  i18next
    .use(initReactI18next)
    .init({
      resources,
      lng: 'en', // Default language
      fallbackLng: 'en',
      react: {
        useSuspense: true,
      },
});
