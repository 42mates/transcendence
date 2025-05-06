import './style.css';
import './logger/logger';
import i18n from './i18n/i18n';

import { loadRoute } from './router';

window.addEventListener('DOMContentLoaded', () => {
	loadRoute(window.location.pathname);

	document.body.addEventListener('click', (e) => {
		const target = e.target as HTMLElement;
		if (target.matches('[id^="changeLangButton-"]')) {
			const newLang = target.getAttribute('data-lang');
			if (newLang) {
				i18n.changeLanguage(newLang).then(() => {
					translateDOM(); // remet à jour les textes traduits
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

export async function handlePostRequest(endpoint: string, username: string) {
	try {
		const response = await fetch(endpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ username }),
		});
		const data = await response.json();
		alert('POST ' + endpoint + ': ' + data.message);
	} catch (error) {
		alert('An error occurred: ' + error);
	}
}