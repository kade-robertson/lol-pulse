import { defineConfig } from 'wxt';
import react from '@vitejs/plugin-react';

// See https://wxt.dev/api/config.html
export default defineConfig({
	manifest: {
		host_permissions: ['https://*.lolesports.com/*'],
		permissions: ['webRequest', 'storage', 'alarms', 'tabs', 'https://*.lolesports.com/*'],
	},
	vite: () => ({
		plugins: [react()],
	}),
});
