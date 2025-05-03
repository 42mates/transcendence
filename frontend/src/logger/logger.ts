const hostname = () => window.location.hostname;

const serviceName = "frontend"; // Replace with your service name

// Override console methods to send logs to /api/log
const originalConsole = { ...console };

function sendLog(method: string, args: any[]) {
	const logEntry = {
		timestamp: new Date().toISOString(),
		level: method,
		service: serviceName,
		message: args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg)).join(" "),
		context: {
			pid: "browser", // Replace with a static value since process.pid is unavailable in the browser
			host: hostname(),
			port: window.location.port || "unknown",
		},
	};

	// Log the formatted entry to the console
	originalConsole.log(JSON.stringify(logEntry));

	const logData = JSON.stringify(logEntry);

	if (navigator.sendBeacon) {
		navigator.sendBeacon("/api/log", logData);
	} else {
		fetch("/api/log", {
			method: "POST",
			body: logData,
			headers: {
				"Content-Type": "application/json",
			},
		}).catch((error) => {
			originalConsole.error("Failed to send log to server:", error);
		});
	}
}

["log", "info", "warn", "error", "debug"].forEach((method) => {
	const originalMethod = (console as any)[method];
	(console as any)[method] = function (...args: any[]) {
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