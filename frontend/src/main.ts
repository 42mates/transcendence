import './style.css';
import i18n from './i18n/i18n';
import {initGoogleAuth, loadGoogleSignInScript, setupLogoutButton} from './googleAuth/initAuth';"./googleAuth"

async function initApp() {
	const app = document.getElementById('app')!;

	try {
		const response = await fetch('/demo.html');
		const html = await response.text();

		// Initialize Google Sign-In object
		loadGoogleSignInScript();

		// Inject the HTML content into the app element
		app.innerHTML = html;

		// Translate the document
		translateDOM();

		// Handle language change buttons
		document.querySelectorAll('[id^="changeLangButton-"]').forEach((button) => {
			button.addEventListener('click', (event) => {
				const target = event.target as HTMLElement;
				const newLang = target.getAttribute('data-lang');
				if (newLang) {
					i18n.changeLanguage(newLang).then(() => initApp());
				}
			});
		});

		document.getElementById('loginButton')!.addEventListener('click', () => googleSignIn());
		// document.getElementById('loginButton')!.addEventListener('click', () => handlePostRequest('/api/auth/login', ''));
		document.getElementById("logoutButton")!.addEventListener("click",()=> setupLogoutButton());
		document.getElementById('gameButton')!.addEventListener('click', () => handlePostRequest('/api/game/join', ''));
		document.getElementById('checkUsernameButton')!.addEventListener('click', () => {
			const username = (document.getElementById('usernameInput') as HTMLInputElement).value;
			handlePostRequest('/api/auth/doesuserexist', username);
		});
	} catch (error) {
		console.error('Failed to load demo.html:', error);
	}
}

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


async function googleSignIn(){
	initGoogleAuth();
}

async function googleSignOut(){
	
}
async function handlePostRequest(endpoint: string, username: string) {
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

initApp();
