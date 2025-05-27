import './style.css';
import './logger/logger';
import i18n from './i18n/i18n';

import { loadRoute } from './router';

try {
	const socket =  new WebSocket('wss://localhost:8443/api/game');
	socket.addEventListener("message", (event) => {
  		// If there is new message to server i send a connection
		socket.send("PONG ");
	});
	
	socket.onopen = () => {
		console.log('****WebSocket connection opened********');
		const username = localStorage.getItem("givenName");
		console.log(`USER NAME : ${username}`);
	};

	socket.onmessage = (event) => {
		// when I got message
		// console.log('Message from server:', event.data);
		console.log(`PONG ! I RECIVED A MESSAGE FRON SERVER: ${event.data}`);
	};

	socket.onclose = (event) => {
		console.log('WebSocket connection closed:', event);
	};

	socket.onerror = (error) => {
		console.error('WebSocket error:', error);
	};
}
catch (err) {
  console.log('This never prints');
  console.log(err);
}

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

export async function handleGetRequest(endpoint: string, username: string) {
	console.log(endpoint);
	try {
		const response = await fetch(endpoint, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			// body: JSON.stringify({ username }),
		});
		const data = await response.json();
		alert('POST ' + endpoint + ': ' + data.message);
	} catch (error) {
		alert('An error occurred: ' + error);
	}
}
