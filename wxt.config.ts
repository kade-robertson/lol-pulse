import react from '@vitejs/plugin-react';
import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		name: 'LoL Pulse',
		host_permissions: ['https://*.lolesports.com/*'],
		permissions: ['webRequest', 'storage', 'alarms', 'https://*.lolesports.com/*'],
	},
	vite: (env) => ({
		plugins: [react()],
		define: {
			'globalThis.__DEV__': JSON.stringify(env.mode !== 'production'),
		},
	}),
});
