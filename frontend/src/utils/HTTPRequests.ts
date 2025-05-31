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
		return data;
	} catch (error) {
		alert('[DEBUG] An error occurred: ' + error);
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
		alert('[DEBUG] GET ' + endpoint + ': ' + data.message);
	} catch (error) {
		alert('[DEBUG] An error occurred: ' + error);
	}
}
