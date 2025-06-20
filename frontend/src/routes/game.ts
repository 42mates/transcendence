import Game from '../game/Game';
import LocalGame from '../game/Game.Local';
import SingleGame from '../game/Game.Single';
import TournamentGame from '../game/Game.Tournament';
import GameForm from '../game/GameForm';

import i18n from '../i18n/i18n';

import { loadGoogleSignInScript, setupLogoutButton } from '../googleAuth/initAuth';"../googleAuth";
import { googleSignIn } from '../router';
import { getKeyBindings } from '../utils/gameInfos';

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
		//console.log('[Auth] Storage event detected:', event.key, event.oldValue, event.newValue);
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

function listenForQuit(game: Game){
	const quitBtn = document.getElementById('quitButton');
	const modal = document.getElementById('quit-modal');
	const yesBtn = document.getElementById('quit-modal-yes');
	const noBtn = document.getElementById('quit-modal-no');

	updateQuitButtonText(game);

	const checkGameStatus = setInterval(() => {
	updateQuitButtonText(game);
	if (game.status === "ended") {
		clearInterval(checkGameStatus);
	}
	}, 500);

	if (quitBtn && modal && yesBtn && noBtn) {
		quitBtn.addEventListener('click', () => {
			if (game.status === "ended") {
				// Skip confirmation modal when game is already ended
				game.sendQuitRequest("User clicked play again");
			} else {
				// Show confirmation modal for active games
				modal.classList.remove('hidden');
			}
		});
		yesBtn.addEventListener('click', () => {
			modal.classList.add('hidden');
			game.sendQuitRequest("User clicked quit");
		});
		noBtn.addEventListener('click', () => {
			modal.classList.add('hidden');
		});
	}
}

function updateQuitButtonText(game: Game) {
	const quitBtn = document.getElementById('quitButton');
	
	if (quitBtn) {
		if (game.status === "ended") {
			quitBtn.textContent = i18n.t('game:quit:newGameButton') || "Play again";
		} else {
			quitBtn.textContent = i18n.t('game:quit.quitButton') || "Quit";
		}
	}
}

export async function initGame() {
	console.log('Game page loaded');
	setupHeaderIcons();
	try {
		const form = new GameForm();
		const data = await form.getGameForm();

		const defaultKeyBindings = {up: 'ArrowUp', down: 'ArrowDown'};
		let game: Game;
		if (data.mode === 'local')
			game = new LocalGame(data.alias, [getKeyBindings(), defaultKeyBindings]);
		else if (data.mode === 'online' && data.onlineType === '1v1')
			game = new SingleGame(data.alias, [defaultKeyBindings]);
		else if (data.mode === 'online' && data.onlineType === 'tournament')
			game = new TournamentGame(data.alias, [defaultKeyBindings]);
		else
			throw new Error("Invalid game mode selected");

		game.connect();
		listenForQuit(game);
	}
	catch (error) {
		console.error('Error initializing game logic:', error);
	}
}