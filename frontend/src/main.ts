import './style.css';
import i18n from './i18n/i18n';

function initApp() {
	const app = document.getElementById('app')!;
	app.innerHTML = `
		<div class="flex flex-col items-center justify-center h-screen bg-gray-100 space-y-4">
			<h1 class="text-4xl font-bold text-blue-600">${i18n.t('common:welcome')}</h1>
			<button id="loginButton" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
				${i18n.t('common:login')}
			</button>
			<button id="gameButton" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
				${i18n.t('common:game')}
			</button>
			<div class="flex flex-col items-center space-y-2">
				<input
					type="text"
					placeholder="Check if username exists"
					class="px-4 py-2 border rounded w-64"
					id="usernameInput"
				/>
				<button
					id="checkUsernameButton"
					class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
				>
					Check Username
				</button>
			</div>
		</div>
	`;

	document.getElementById('loginButton')!.addEventListener('click', () => handlePostRequest('/api/auth/login', ''));
	document.getElementById('gameButton')!.addEventListener('click', () => handlePostRequest('/api/game/join', ''));
	document.getElementById('checkUsernameButton')!.addEventListener('click', () => {
		const username = (document.getElementById('usernameInput') as HTMLInputElement).value;
		handlePostRequest('/api/auth/doesuserexist', username);
	});
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
