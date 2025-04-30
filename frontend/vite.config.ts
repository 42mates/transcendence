import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		outDir: 'dist', // Output directory for the build
	},
	//! Vite server logs for debugging
	//server: {
	//	host: '0.0.0.0',
	//	port: 5173,
	//},
	//plugins: [
	//	{
	//		name: 'request-logger',
	//		configureServer(server) {
	//			server.middlewares.use((req, res, next) => {
	//				console.log(`Request received: ${req.method} ${req.url}`);
	//				next();
	//			});
	//		},
	//	},
	//],
});

