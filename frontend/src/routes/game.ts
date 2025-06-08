import Game from '../game/Game';
import GameForm from '../game/GameForm';
import { loadGoogleSignInScript, setupLogoutButton } from '../googleAuth/initAuth';"../googleAuth";
import { googleSignIn } from '../router';
import { getDefaultKeyBindings } from '../utils/gameInfos';

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
		} else {
			iconLogout?.classList.add('hidden');
			iconLogin?.classList.remove('hidden');
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

		let game: Game;
		if (data.mode === 'online')
			game = new Game(data.onlineType, data.alias, [{up: 'ArrowUp', down: 'ArrowDown'}]);
		else if (data.mode === 'local')
			game = new Game('local', data.alias, [getDefaultKeyBindings(), {up: 'ArrowUp', down: 'ArrowDown'}]);
		else
			throw new Error("Invalid game mode selected");

		game.connect();
		await game.waitForJoin();

		if (data.mode === 'online') console.log(`[${game.gameId}] Player ${data.alias} connected.`);
		if (data.mode === 'local')  console.log(`[${game.gameId}] Local game started for players: '${data.alias.join(' and ')}'`);
	}
	catch (error) {
		console.error('Error initializing game logic:', error);
	}
}