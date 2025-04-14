import React from 'react';

function App(): JSX.Element {
	const handlePostRequest = async (endpoint: string, username: string) => {
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
	};

	const { t } = useTranslation('login');

	return (
		<div className="flex flex-col items-center justify-center h-screen bg-gray-100 space-y-4">
			<h1 className="text-4xl font-bold text-blue-600">Welcome to Transcendence</h1>
			<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
				onClick={() => handlePostRequest('/api/auth/login', '')}
			>
				Login
			</button>
			<button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
				onClick={() => handlePostRequest('/api/game/join', '')}
			>
				Game
			</button>
			<div className="flex flex-col items-center space-y-2">
				<input
					type="text"
					placeholder="Check if username exists"
					className="px-4 py-2 border rounded w-64"
					id="usernameInput"
				/>
				<button
					className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
					onClick={() => {
						const username = (document.getElementById('usernameInput') as HTMLInputElement).value;
						console.log('Username:', username);
						handlePostRequest('/api/auth/doesuserexist', username);
					}}
				>
					Check Username
				</button>
			</div>
		</div>
	);
}

export default App;
