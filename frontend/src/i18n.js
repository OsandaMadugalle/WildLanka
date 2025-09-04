import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './translations/en';
import si from './translations/si';
import ta from './translations/ta';

// Add more languages as needed
const resources = {
  en: { translation: en },
  si: { translation: si },
  ta: { translation: ta },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
