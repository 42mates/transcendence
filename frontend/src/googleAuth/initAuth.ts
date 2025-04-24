const client_id = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;
console.log(client_id);


function handleCredentialResponse(response: any) {
	console.log("Encoded JWT ID token: " + response.credential);
	console.log("RESPONSE", response);
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
  
function initGoogleAuth() {
	loadGoogleSignInScript()
	  .then(() => {
		// Make sure `google` is available
		if (typeof google !== 'undefined') {
		  google.accounts.id.initialize({
			client_id: client_id,
			callback: handleCredentialResponse,
		  });
		  google.accounts.id.renderButton(
			document.getElementById("buttonDiv")!,
			{ theme: "outline", size: "large" }
		  );
		  google.accounts.id.prompt(); // Optional: show One Tap prompt
		} else {
		  console.error("Google object not found after loading script.");
		}
	  })
	  .catch(console.error);
  }
  
  export default initGoogleAuth;
