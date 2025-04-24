const client_id = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;

function handleCredentialResponse(response: any) {
	// console.log("Encoded JWT ID token: " + response.credential);
	console.log("RESPONSE FROM GOOGLE LOGIN", response);
    // I have to find correct google element to delete it after login
    const popup = document.getElementById(".loginPopup");
    if (popup) {
        popup.style.display = "none";  // Hide the element if it exists
      }
   
}

function loadGoogleSignInScript(): Promise<void> {
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
  
function initGoogleAuth(islogIn:boolean) {

	loadGoogleSignInScript()
	  .then(() => {
		// Make sure `google` is available
		if (typeof google !== 'undefined') {
		  google.accounts.id.initialize({
			client_id: client_id,
			callback: handleCredentialResponse,
		  });

          const popup = document.createElement("div");
          popup.setAttribute("id", "loginPopup");
          popup.setAttribute("class", "px-20 py-20");
          document.body.appendChild(popup);
          popup.style.position = "absolute";
          popup.style.top = "50px";
          popup.style.left = "50%"; 
          popup.style.transform = "translateX(-50%)"; 
    
		  google.accounts.id.renderButton(
			document.getElementById("loginPopup")!,
			{ theme: "outline", size: "large" }
		  );
          if(islogIn)
          {
            google.accounts.id.prompt(); // Optional: show One Tap prompt
          }
		   
          else
          {
            const button = document.getElementById('logoutButton');
            console.log(button);
            if (button) {
                button.onclick = () => {
                    google.accounts.id.revoke().then(() => {
                        console.log('Successfully logged out');
                        // Optionally, you could also hide the button or show a "logged out" state here
                    }).catch((error: any) => {
                        console.error('Error during logout', error);
                    });
                };
            }
          }
		} else {
		  console.error("Google object not found after loading script.");
		}
	  })
	  .catch(console.error);
  }
  
  export default initGoogleAuth;
