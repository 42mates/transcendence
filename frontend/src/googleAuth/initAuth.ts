import GoogleLoginType from "../../types/GoogleLoginType"
import { handlePostRequest } from "../main";

const client_id = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;


const saveToLocalStorage = ({ givenName, picture, email }: GoogleLoginType) => {
	localStorage.setItem("email", email);
	localStorage.setItem("givenName", givenName);
	localStorage.setItem("imgProfil", picture);
}

const handleCredentialResponse = async (response: any) =>{
	if(response.credential)
	{
		const popup = document.getElementById("loginPopup");
		const token = response.credential;
		const userInfo = await handlePostRequest("/api/auth/login", token);
		saveToLocalStorage(userInfo);
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
	if(email)
	{
		const alreadyLoggedIn = "User is already logged IN";
		console.error(alreadyLoggedIn);
		alert(alreadyLoggedIn);
		return;
	}
	else
	{
		if (typeof google !== 'undefined') 
		{
			google.accounts.id.initialize({
				client_id: client_id,
				callback: handleCredentialResponse,
			});
		}
			
		const popup = document.createElement("div");
		popup.setAttribute("id", "loginPopup");
		popup.setAttribute("data-size", "medium");
		document.body.appendChild(popup);
		popup.style.position = "absolute";
		popup.style.top = "50%";
		popup.style.left = "50%"; 
		popup.style.transform = "translateX(-50%)"; 
		google.accounts.id.renderButton(
			document.getElementById("loginPopup")!,
			{ theme: "filled_black", size: "large" }
		);
		google.accounts.id.prompt();
	}
}

export function setupLogoutButton() {
	const email = localStorage.getItem("googleSignInEmail");
	if (!email) {
		const emailNonExist = "No email found for logout";
		alert(emailNonExist);
		console.error(emailNonExist);
		return;
	}


	if (typeof google !== 'undefined') {
		google.accounts.id.disableAutoSelect();
		localStorage.removeItem("email");
		localStorage.removeItem("givenName");
		localStorage.removeItem("picture");
	}
}