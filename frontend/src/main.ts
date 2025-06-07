import './styles/style.css';
import './logger/logger';
import i18n from './i18n/i18n';
import { loadRoute } from './router';
import { translateDOM } from './utils/translate';

window.addEventListener('DOMContentLoaded', () => {

	loadRoute(window.location.pathname);

	document.body.addEventListener('click', (e) => {
		const target = e.target as HTMLElement;
		if (target.matches('[id^="changeLangButton-"]')) {
			const newLang = target.getAttribute('data-lang');
			if (newLang) {
				i18n.changeLanguage(newLang).then(() => {
					translateDOM();
				});
			}
		}

		// Correction du sélecteur et de la récupération de l'attribut
		const spaButton = target.closest('button[data-spa]');
		if (spaButton) {
			e.preventDefault();
			// Correction du typage et de la récupération de l'attribut
			const linkElement = spaButton as HTMLButtonElement;
			const path = linkElement.dataset.link; // Utiliser dataset.link
			if (path) {
				history.pushState({}, '', path);
				loadRoute(path);
			}
		}
	});

	window.addEventListener('popstate', () => {
		loadRoute(window.location.pathname);
	});
});

function translateDOM() {
	// Select all elements containing `data-i18nkey`
	document.querySelectorAll<HTMLElement>('[data-i18nkey]').forEach((el) => {
		const key = el.getAttribute('data-i18nkey');
		if (key) {
			// Insert the translation
			el.textContent = i18n.t(key);
		}
	});
}
