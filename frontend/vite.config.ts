import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	build: {
		outDir: 'dist', // Output directory for the build
	},
	plugins: [react()],
});
