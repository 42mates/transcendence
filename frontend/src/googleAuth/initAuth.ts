import i18n from "../i18n/i18n";
import GoogleLoginType from "../types/GoogleLoginType"
import { handlePostRequest } from "../utils/HTTPRequests";

const client_id = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;

const saveToLocalStorage = ({ givenName, picture, email }: GoogleLoginType) => {
	localStorage.setItem("email", email);
	localStorage.setItem("givenName", givenName);
	localStorage.setItem("picture", picture);
}

const handleCredentialResponse = async (response: any) =>{
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

		// Ajoutez un callback pour surveiller l'état du One Tap
		google.accounts.id.prompt((notification: any) => {
			// Affiche le bouton si One Tap n'est pas affiché OU ignoré
			// if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
			//	 const reason = notification.isNotDisplayed()
			//		 ? notification.getNotDisplayedReason()
			//		 : notification.getSkippedReason();
			//	 console.log("Affichage du bouton central (motif) :", reason);

			//	 let popup = document.getElementById("loginPopup");
			//	 if (!popup) {
			//		 popup = document.createElement("div");
			//		 popup.setAttribute("id", "loginPopup");
			//		 popup.setAttribute("data-size", "medium");
			//		 document.body.appendChild(popup);
			//		 popup.style.position = "absolute";
			//		 popup.style.top = "50%";
			//		 popup.style.left = "50%";
			//		 popup.style.transform = "translateX(-50%)";
			//	 }
			//	 google.accounts.id.renderButton(
			//		 popup,
			//		 { theme: "filled_black", size: "large" }
			//	 );
			// }

			if (notification.isNotDisplayed()) {
				console.log("One Tap non affiché :", notification.getNotDisplayedReason());
			} else if (notification.isSkippedMoment()) {
				console.log("One Tap ignoré :", notification.getSkippedReason());
			} else if (notification.isDismissedMoment()) {
				console.log("One Tap fermé :", notification.getDismissedReason());
			} else {
				console.log("One Tap affiché (prompt ouvert)");
			}
		});
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