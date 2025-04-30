import i18n from '../i18n/i18n';

export function translateDOM() {
	document.querySelectorAll<HTMLElement>('[data-i18nkey]').forEach((el) => {
		const key = el.getAttribute('data-i18nkey');
		if (key) {
			el.textContent = i18n.t(key);
		}
	});
}
