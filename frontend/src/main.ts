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

		if (target.closest('a[data-spa]')) {
			e.preventDefault();
			const link = target.closest('a[data-spa]') as HTMLAnchorElement;
			const href = link.getAttribute('href');
			if (href) {
				history.pushState({}, '', href);
				loadRoute(href);
			}
		}
	});

	window.addEventListener('popstate', () => {
		loadRoute(window.location.pathname);
	});
});

