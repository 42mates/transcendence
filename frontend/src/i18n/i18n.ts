import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon	from './locales/en/common.json';
import esCommon	from './locales/es/common.json';
import frCommon	from './locales/fr/common.json';
import krCommon	from './locales/kr/common.json';

import enLogin	from './locales/en/login.json';
import esLogin	from './locales/es/login.json';
import frLogin	from './locales/fr/login.json';
import krLogin	from './locales/kr/login.json';

import enGame	from './locales/en/game.json';
import esGame	from './locales/es/game.json';
import frGame	from './locales/fr/game.json';
import krGame	from './locales/kr/game.json';

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
				common: enCommon,
				login: enLogin,
				game: enGame,
			},
			es: {
				common: esCommon,
				login: esLogin,
				game: esGame,
			},
			fr: {
				common: frCommon,
				login: frLogin,
				game: frGame,
			},
			kr: {
				common: krCommon,
				login: krLogin,
				game: krGame,
			}
		},
		ns: ['common', 'login'],
		defaultNS: 'common',
	});

export default i18n;
