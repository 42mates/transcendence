import { loadGoogleSignInScript, setupLogoutButton } from '../googleAuth/initAuth';"../googleAuth";
import { googleSignIn } from '../router'

export function initLogin() {
	console.log('Login page loaded');
		// Initialize Google Sign-In object
		loadGoogleSignInScript();

		document.getElementById('loginButton')!.addEventListener('click', googleSignIn);
		document.getElementById("logoutButton")!.addEventListener("click",setupLogoutButton);
}
