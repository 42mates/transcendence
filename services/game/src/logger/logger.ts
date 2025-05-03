import { hostname } from "os";

const serviceName = "game";

const originalConsole = { ...console };
const consoleMethods = ["log", "info", "warn", "error", "debug"] as const;
type ConsoleMethods = typeof consoleMethods[number];

function sendLog(method: string, args: any[]) {
	const logEntry = {
		timestamp: new Date().toISOString(),
		level: method,
		service: serviceName,
		message: args.map(arg => (typeof arg === "object" ? JSON.stringify(arg) : arg)).join(" "),
		context: {
			pid: process.pid,
			host: hostname(),
			port: process.env.PORT || "unknown",
		},
	};

	// Send the formatted log as JSON to your logging service
	originalConsole.log(JSON.stringify(logEntry));
}


consoleMethods.forEach((method: ConsoleMethods) => {
	const originalMethod = console[method];
	console[method] = function (...args: any[]) {
		sendLog(method, args); // Send the log to your custom logger
		//originalMethod.apply(console, args); // Preserve the original console behavior
	};
});


// PINO SETUP
import pino from 'pino'

const logger = pino({
  level: 'info',
  base: { service: serviceName },
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
	level(label: string) {
      return { level: label }
    }
  }
})

export default logger