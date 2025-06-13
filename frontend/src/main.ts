import './styles/style.css';
import './logger/logger';
import i18n, { translateDOM } from './i18n/i18n';
import { loadRoute } from './router';

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

		const spaButton = target.closest('button[data-spa]');
		if (spaButton) {
			e.preventDefault();
			const linkElement = spaButton as HTMLButtonElement;
			const path = linkElement.dataset.link;
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

