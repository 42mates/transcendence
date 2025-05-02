import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		outDir: 'dist', // Output directory for the build
	},
	// receive and print logs from the frontend
	server: {
		host: '0.0.0.0',
		port: 5173,
	},
	plugins: [
		{
			name: 'log-capture-middleware',
			configureServer(server) {
				server.middlewares.use('/api/log', (req, res, next) => {
					if (req.method === 'POST') {
						let body = '';
						req.on('data', (chunk) => {
							body += chunk.toString();
						});
						req.on('end', () => {
							try {
								const logEntry = JSON.parse(body);
								console.log(`${logEntry.message}`);
							} catch (error) {
								console.error('Failed to parse log entry:', error);
							}
							res.statusCode = 200;
							res.end();
						});
					} else {
						next();
					}
				});
			},
		},
	],
});