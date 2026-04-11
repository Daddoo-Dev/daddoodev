import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { marketminderDevApi } from './vite-plugin-marketminder-dev';

export default defineConfig({
	plugins: [sveltekit(), marketminderDevApi()],
	build: {
		// html2pdf.js and similar vendor chunks are legitimately large; default 500 kB warns on every build.
		chunkSizeWarningLimit: 1000
	}
});
