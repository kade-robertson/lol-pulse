import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';
import App from './app.tsx';
import 'antd/dist/reset.css';
import './style.css';
import { AlarmContextProvider } from './contexts/alarm-ctx.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
			<AlarmContextProvider>
				<App />
			</AlarmContextProvider>
		</ConfigProvider>
	</React.StrictMode>,
);
