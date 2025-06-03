import ConfigProvider from 'antd/es/config-provider';
import theme from 'antd/es/theme';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app.tsx';
import 'antd/dist/reset.css';
import './style.css';
import { AlarmContextProvider } from './contexts/alarm-ctx.tsx';
import { ThemeProvider } from '@/ui/theme-provider.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
			<ThemeProvider defaultTheme="dark" storageKey="pulse-theme">
				<AlarmContextProvider>
					<App />
				</AlarmContextProvider>
			</ThemeProvider>
		</ConfigProvider>
	</React.StrictMode>,
);
