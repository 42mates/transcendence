import i18n from "../i18n/i18n";
import GoogleLoginType from "../types/GoogleLoginType"
import { handlePostRequest } from "../utils/HTTPRequests";

const client_id = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;

const saveToLocalStorage = ({ givenName, picture, email }: GoogleLoginType) => {
	localStorage.setItem("email", email);
	localStorage.setItem("givenName", givenName);
	localStorage.setItem("picture", picture);
}

export const handleCredentialResponse = async (response: any) =>{
	if(response.credential)
	{
		const popup = document.getElementById("loginPopup");
		const token = response.credential;
		const userInfo = await handlePostRequest("/api/auth/login", token);
		saveToLocalStorage(userInfo);
		
		window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: userInfo }));
		
		if(userInfo)
			alert(i18n.t('login:loginSuccess', { user: userInfo.givenName }));
		if (popup) 
			popup.style.display = "none";
	}
}

export function loadGoogleSignInScript(): Promise<void> {
	return new Promise((resolve, reject) => {
	  const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
	
	  if (existingScript) {
		resolve();
		return;
	  }
  
	  const script = document.createElement('script');
	  script.src = "https://accounts.google.com/gsi/client";
	  script.async = true;
	  script.defer = true;
  
	  script.onload = () => {
		resolve();
		
	  };
  
	  script.onerror = () => {
		reject(new Error("Failed to load the Google Sign-In script"));
	  };
  
	  document.head.appendChild(script);
	});
  }
  
export function initGoogleAuth() {
	const email = localStorage.getItem("email");
	if (email) {
		const alreadyLoggedIn = "User is already logged IN";
		console.error(alreadyLoggedIn);
		alert(i18n.t('login:error.alreadyLoggedIn'));
		return;
	}

	if (typeof google !== 'undefined') {
		google.accounts.id.initialize({
			client_id: client_id,
			callback: handleCredentialResponse,
		});


			// Remove any existing popup
			let popup = document.getElementById("loginPopup");
			if (popup) popup.remove();

			// Create and show popup
			popup = document.createElement("div");
			popup.setAttribute("id", "loginPopup");
			popup.setAttribute("data-size", "medium");
			popup.style.position = "absolute";
			popup.style.top = "50%";
			popup.style.left = "50%";
			popup.style.transform = "translate(-50%, -50%)";
			popup.style.zIndex = "9999";
			popup.style.background = "white";
			popup.style.border = "1px solid #ccc";
			popup.style.padding = "0px 35px 0px 0px";
			popup.style.borderRadius = "4px";
			popup.style.boxShadow = "0 4px 24px rgba(0,0,0,0.2)";
			popup.style.overflow = "visible";

			// Add a close button
			const closeBtn = document.createElement("button");
			closeBtn.textContent = "✕";
			closeBtn.style.position = "absolute";
			closeBtn.style.top = "4px";
			closeBtn.style.right = "7px";
			closeBtn.style.border = "none";
			closeBtn.style.fontSize = "1.5rem";
			closeBtn.style.zIndex = "10000";
			closeBtn.addEventListener("click", () => {
				popup.remove();
			});
			popup.appendChild(closeBtn);

			// Create a wrapper for the Google button
			const googleBtnWrapper = document.createElement("div");
			googleBtnWrapper.style.position = "relative";
			googleBtnWrapper.style.zIndex = "1";
			popup.appendChild(googleBtnWrapper);

			document.body.appendChild(popup);

			// Initialize Google Sign-In
			google.accounts.id.initialize({
				client_id: client_id,
				callback: handleCredentialResponse,
			});
			google.accounts.id.renderButton(
				googleBtnWrapper,
				{ theme: "filled_black", size: "large" }
			);
	}
}

export function setupLogoutButton() {
	const email = localStorage.getItem("email");
	if (!email) {
		alert(i18n.t('login:error.emailLogoutNotFound'));
		console.error("No email found for logout");
		return;
	}


	if (typeof google !== 'undefined') {
		google.accounts.id.disableAutoSelect();
		localStorage.removeItem("email");
		localStorage.removeItem("givenName");
		localStorage.removeItem("picture");
		alert(i18n.t('login:logoutSuccess', { user: email }));
	}
}