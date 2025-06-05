const hostname = () => window.location.hostname;

const serviceName = "frontend";

const originalLog = console.log;

function sendLog(method: string, args: any[]) {
	const logEntry = {
		timestamp: new Date().toISOString(),
		level: method,
		service: serviceName,
		message: args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg) : arg)).join(" "),
		context: {
			pid: "browser",
			host: hostname(),
			port: window.location.port || "unknown",
		},
	};

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
			originalLog("Failed to send log to server:", error);
		});
	}
}

// Override only console log to preserve stack trace in browser devtools
console.log = function (...args: any[]) {
	originalLog.apply(console, args);
	sendLog("log", args);
};

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