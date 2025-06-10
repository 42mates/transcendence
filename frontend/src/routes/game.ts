import Game from '../game/Game';
import GameForm from '../game/GameForm';
import i18n from '../i18n/i18n';
import { GameFormType } from '../types/GameForm';
import { loadGoogleSignInScript, setupLogoutButton } from '../googleAuth/initAuth';"../googleAuth";
import { googleSignIn } from '../router';

async function playOnline(data: Extract<GameFormType, { mode: "online" }>) {
	let game = new Game(data.onlineType, data.alias);
	game.connect();
	await game.waitForJoin();
}

async function playLocal(data: Extract<GameFormType, { mode: "local" }>) {
	try {
		let game1 = new Game("local", data.alias1, null, { up: "w", down: "s" });
		game1.connect();
		let gameId = await game1.waitForJoin();
		console.log('gameId:', gameId);
		let game2 = new Game("local", data.alias2, gameId);
		game2.connect();
		console.log('Local game started with aliases:', data.alias1, data.alias2);
	}
	catch (error) {
		console.error('Error starting local game:', error);
		if (error instanceof Error) {
			alert(error.message);
		} else {
			alert('An unknown error occurred while starting the local game.');
		}
	}
}

function setupHeaderIcons() {
	const iconLogout = document.getElementById('icon-logout') as SVGElement | null;
	const iconLogin = document.getElementById('icon-login') as SVGElement | null;
	const userActionButton = document.getElementById('userActionButton') as HTMLButtonElement | null;

	if (!iconLogout || !iconLogin || !userActionButton) {
		console.warn('Header icon elements not found. Skipping icon setup.');
		return;
	}

	const emailKey = 'email';
	let isLoadingAuthAction = false;

	function updateUserIconVisibility() {
		const isLoggedIn = localStorage.getItem(emailKey) !== null;
		console.log('[Auth] Updating icon visibility. Is logged in:', isLoggedIn);
		if (isLoggedIn) {
			iconLogout?.classList.remove('hidden');
			iconLogin?.classList.add('hidden');
			userActionButton!.title = i18n.t('login:logoutTitel');
		} else {
			iconLogout?.classList.add('hidden');
			iconLogin?.classList.remove('hidden');
			userActionButton!.title = i18n.t('login:loginTitel');
		}
	}

	async function handleLoginAttempt() {
		isLoadingAuthAction = true;
		try {
			await loadGoogleSignInScript();
			await googleSignIn();
		} catch (error) {
			console.error('[Auth] Error during login attempt:', error);
		} finally {
			updateUserIconVisibility();
			isLoadingAuthAction = false;
		}
	}

	async function handleLogoutAttempt() {
		if (isLoadingAuthAction) {
			console.log('[Auth] Logout action already in progress.');
			return;
		}
		isLoadingAuthAction = true;
		console.log('[Auth] Attempting logout...');
		try {
			await setupLogoutButton();
		} catch (error) {
			console.error('[Auth] Error during logout attempt:', error);
		} finally {
			updateUserIconVisibility();
			isLoadingAuthAction = false;
		}
	}
	updateUserIconVisibility();

	userActionButton.addEventListener('click', () => {
		const isLoggedIn = localStorage.getItem(emailKey) !== null;
		console.log('[Auth] User action button clicked. Currently logged in:', isLoggedIn);
		if (isLoggedIn) {
			handleLogoutAttempt();
		} else {
			handleLoginAttempt();
		}
	});

	window.addEventListener('userLoggedIn', () => {
		console.log('[Auth] Custom login event detected');
		updateUserIconVisibility();
	});
	
	window.addEventListener('storage', (event) => {
		console.log('[Auth] Storage event detected:', event.key, event.oldValue, event.newValue);
		if (event.key === emailKey || (event.key === null && localStorage.getItem(emailKey) === null)) {
			console.log('[Auth] Relevant storage change detected, updating icon visibility.');
			updateUserIconVisibility();
		}
	});
	
	loadGoogleSignInScript()
		.then(() => {
			updateUserIconVisibility();
		})
		.catch(error => {
			console.error('[Auth] Failed to pre-load Google Sign-In script on page init:', error);
		});
}

export async function initGame() {
	console.log('Game page loaded');
	setupHeaderIcons();
	try {
		const form = new GameForm();
		const data = await form.getGameForm();
		if (data.mode === 'online') 
			await playOnline(data);
		else
			await playLocal(data);
	}
	catch (error) {
		console.error('Error initializing game logic:', error);
	}
}