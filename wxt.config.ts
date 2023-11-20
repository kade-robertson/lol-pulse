import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		name: 'LoL Pulse',
		host_permissions: ['https://*.lolesports.com/*'],
		permissions: ['webRequest', 'storage', 'alarms', 'https://*.lolesports.com/*'],
	},
	vite: () => ({
		plugins: [react()],
	}),
});
