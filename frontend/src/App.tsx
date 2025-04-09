import React from 'react';

function App(): JSX.Element {
	const handlePostRequest = async (endpoint: string) => {
		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({}),
			});
			const data = await response.json();
			alert(JSON.stringify(data));
		} catch (error) {
			alert('An error occurred: ' + error);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center h-screen bg-gray-100 space-y-4">
			<h1 className="text-4xl font-bold text-blue-600">Welcome to Transcendence</h1>
			<button
				className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
				onClick={() => handlePostRequest('/api/auth/login')}
			>
				Login
			</button>
			<button
				className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
				onClick={() => handlePostRequest('/api/game/join')}
			>
				Game
			</button>
		</div>
	);
}

export default App;
