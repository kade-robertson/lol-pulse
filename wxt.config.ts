import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
	modules: ['@wxt-dev/webextension-polyfill'],
	manifest: {
		name: 'LoL Pulse',
		host_permissions: ['https://*.lolesports.com/*'],
		permissions: ['webRequest', 'storage', 'alarms', 'https://*.lolesports.com/*'],
	},
	// @ts-ignore
	vite: (env) => ({
		plugins: [react(), tailwindcss()],
		define: {
			'globalThis.__DEV__': JSON.stringify(env.mode !== 'production'),
		},
	}),
});
