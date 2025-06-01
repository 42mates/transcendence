import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon		from './locales/en/common.json';
import esCommon		from './locales/es/common.json';
import frCommon		from './locales/fr/common.json';
import krCommon		from './locales/kr/common.json';

import enLogin		from './locales/en/login.json';
import esLogin		from './locales/es/login.json';
import frLogin		from './locales/fr/login.json';
import krLogin		from './locales/kr/login.json';

import enGame		from './locales/en/game.json';
import esGame		from './locales/es/game.json';
import frGame		from './locales/fr/game.json';
import krGame		from './locales/kr/game.json';

import enRegister	from './locales/en/register.json';
import esRegister	from './locales/es/register.json';
import frRegister	from './locales/fr/register.json';
import krRegister	from './locales/kr/register.json';

i18n
	.use(LanguageDetector)
	.init({
		fallbackLng: 'en',
		debug: false,
		interpolation: {
			escapeValue: false,
		},
		resources: {
			en: {
				common: enCommon,
				login: enLogin,
				game: enGame,
				register: enRegister,
			},
			es: {
				common: esCommon,
				login: esLogin,
				game: esGame,
				register: esRegister,
			},
			fr: {
				common: frCommon,
				login: frLogin,
				game: frGame,
				register: frRegister,
			},
			kr: {
				common: krCommon,
				login: krLogin,
				game: krGame,
				register: krRegister,
			}
		},
		ns: ['common', 'login', 'game', 'register'],
		defaultNS: 'common',
	});


export function translateDOM() {
	document.querySelectorAll<HTMLElement>('[data-i18nkey]').forEach((el) => {
		const key = el.getAttribute('data-i18nkey');
		if (key) {
			el.textContent = i18n.t(key);
		}
	});
}


export default i18n;
