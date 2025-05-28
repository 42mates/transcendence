import JsonToken from "../../types/JsonTokenType";
import { handlePostRequest } from "../main";

const client_id = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;


const saveToLocalStorage = (decoded : JsonToken) => {
	const email = decoded.email;
	const familyName = decoded.family_name;
	const givenName = decoded.given_name;
	const imgProfil = decoded.picture;

	localStorage.setItem("googleSignInEmail", email);
	localStorage.setItem("familyName", familyName);
	localStorage.setItem("givenName", givenName);
	localStorage.setItem("imgProfil", imgProfil);
}

const handleCredentialResponse = async (response: any) =>{
	if(response.credential)
	{
		const popup = document.getElementById("loginPopup");
		const token = response.credential;
		console.log("dfsdfsdf");
		const data = await handlePostRequest("/api/auth/login", token);
		console.log(3, data);
		// if (popup) 
		// 	popup.style.display = "none";
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

	const email = localStorage.getItem("googleSignInEmail");
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
		localStorage.removeItem("googleSignInEmail");
		localStorage.removeItem("familyName");
		localStorage.removeItem("givenName");
		localStorage.removeItem("imgProfil");
	}
}