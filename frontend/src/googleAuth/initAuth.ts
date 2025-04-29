import JsonToken from "../../types/JsonTokenType";

const client_id = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;

const saveToLocalStorage = (decoded : JsonToken)=>{
	const email = decoded.email;
	const familyName = decoded.family_name;
	const givenName = decoded.given_name;
	const imgProfil = decoded.picture;

	localStorage.setItem("googleSignInEmail", email);
	localStorage.setItem("familyName", familyName);
	localStorage.setItem("givenName", givenName);
	localStorage.setItem("imgProfil", imgProfil);
}

const decodeJWTToken = (token : string) => {
	const base64Url = token.split('.')[1];
	const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
	const jsonPayload = decodeURIComponent(
		atob(base64)
			.split('')
			.map((c) => {
				return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
			})
			.join('')
	);

	const decoded = JSON.parse(jsonPayload);
	saveToLocalStorage(decoded);

	return decoded.email;
}


function handleCredentialResponse(response: any) {
	if(response.credential)
	{
		decodeJWTToken(response.credential);
		const popup = document.getElementById("loginPopup");
		if (popup) {
			popup.style.display = "none";
		}
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
		console.error("There is already user");
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
	const button = document.getElementById("logoutButton");
	if (button) {
		button.onclick = () => {
			const email = localStorage.getItem("googleSignInEmail");
			if (!email) {
				console.error("No email found for logout");
				return;
			}

			if (typeof google !== 'undefined') {
				google.accounts.id.disableAutoSelect();
				localStorage.removeItem("googleSignInEmail");
				localStorage.removeItem("familyName");
				localStorage.removeItem("givenName");
				localStorage.removeItem("imgProfil");
				localStorage.removeItem("i18nextLng");
			}
		};
	}
}