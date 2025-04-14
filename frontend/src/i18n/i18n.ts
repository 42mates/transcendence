import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .init({
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        common: require('./locales/en/common.json'),
        login: require('./locales/en/login.json'),
      },
      fr: {
        common: require('./locales/fr/common.json'),
        login: require('./locales/fr/login.json'),
      }
    },
    ns: ['common', 'login'],
    defaultNS: 'common',
  });

export default i18n;
