const client_id = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;


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
	/* payload 
		family_name: "EXAMPLE"
		given_name: "EXAMPLE"
		email: "example@gmail.com"
	*/
	console.log("payload", decoded)
	return decoded.email;
}


function handleCredentialResponse(response: any) {
	// console.log("RESPONSE FROM GOOGLE LOGIN", response.credential);
	if(response.credential)
	{
		const email = decodeJWTToken(response.credential);
		localStorage.setItem("googleSignInEmail", email);
		const popup = document.getElementById("loginPopup");
		if (popup) {
			popup.style.display = "none";  // Hide google popup login
		}
	}
	
}

export function loadGoogleSignInScript(): Promise<void> {
	return new Promise((resolve, reject) => {
	  const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
	
	  if (existingScript) {
		resolve(); // Script is already loaded
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

	// Check user sign-in state
	const email = localStorage.getItem("googleSignInEmail");
	if(email)
	{
		console.log("There is already user");
		return;
	}
	// if there is not user signed-in, google pop up happens
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
    
	
		// Ask users to login with Google
		google.accounts.id.renderButton(
			document.getElementById("loginPopup")!,
			{ theme: "filled_black", size: "large" }
		);
		// Ask confirmatin to login with Google
		google.accounts.id.prompt(); // Optional: show One Tap prompts
	}
}

export function setupLogoutButton() {
	const button = document.getElementById("logoutButton");
	if (button) {
		button.onclick = () => {
			const email = localStorage.getItem("googleSignInEmail");
			if (!email) {
				console.log("No email found for logout");
				return;
			}

			if (typeof google !== 'undefined') {
				// This just removes the remembered selection
				google.accounts.id.disableAutoSelect();
				console.log("Logged out (email cleared)");
				localStorage.removeItem("googleSignInEmail");
			}
		};
	}
}

