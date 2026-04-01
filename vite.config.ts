import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		// html2pdf.js and similar vendor chunks are legitimately large; default 500 kB warns on every build.
		chunkSizeWarningLimit: 1000
	}
});
