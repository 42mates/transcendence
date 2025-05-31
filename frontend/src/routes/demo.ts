import { handlePostRequest, handleGetRequest } from '../utils/HTTPRequests';

export function initDemo() {

	document.getElementById('checkUsernameButton')!.addEventListener('click', () => {
		const username = (document.getElementById('usernameInput') as HTMLInputElement).value;
		handlePostRequest('/api/auth/doesuserexist', username);
	});
	document.getElementById('gameButton')!.addEventListener('click', () => handlePostRequest('/api/game/join', ''));
	console.log('Demo page loaded');
}
