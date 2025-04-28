export function initLogin() {
	console.log('Login page loaded');

	const loginBtn = document.getElementById('loginButton');
	if (loginBtn) {
		loginBtn.addEventListener('click', () => {
			alert('Login clicked!');
		});
	}
}
