// Override console methods to send logs to /api/log
const originalConsole = { ...console };

function sendLog(method: string, args: any[]) {
	const logData = JSON.stringify({
		level: method,
		message: args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg)).join(" "),
		timestamp: new Date().toISOString(),
	});

	if (navigator.sendBeacon)
		navigator.sendBeacon("/api/log", logData);
	else 
	{
		fetch("/api/log", {
			method: "POST",
			body: logData,
			headers: {
				"Content-Type": "application/json",
			},
		}).catch((error) => {
			console.error("Failed to send log to server:", error);
		});
	}
}

["log", "info", "warn", "error", "debug"].forEach((method) => {
	const originalMethod = console[method];
	console[method] = function (...args: any[]) {
		// Call the original console method to ensure logs still appear in the console
		originalMethod.apply(console, args);

		// Send the log to the server
		sendLog(method, args);
	};
});

window.onunhandledrejection = function (event) {
	sendLog("unhandledrejection", [
		event.reason?.message || "Unhandled promise rejection",
		event.reason?.stack || "No stack trace",
	]);
};

window.onerror = function (message, source, lineno, colno, error) {
	sendLog("error", [
		message,
		`Source: ${source}`,
		`Line: ${lineno}`,
		`Column: ${colno}`,
		error?.stack || "No stack trace",
	]);
};