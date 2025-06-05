import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './style.css';
import { ThemeProvider } from '@/ui/theme-provider';
import { AlarmContextProvider } from './contexts/alarm-ctx';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ThemeProvider defaultTheme="dark" storageKey="pulse-theme">
			<AlarmContextProvider>
				<App />
			</AlarmContextProvider>
		</ThemeProvider>
	</React.StrictMode>,
);
