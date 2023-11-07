import { GetApiKeyChannel } from '@/shared/channels';
import { useEffect, useState } from 'react';

export const useApiKey = () => {
	const [apiKey, setApiKey] = useState('');

	useEffect(() => {
		const listener = () => {
			browser.storage.local.get('apiKey').then((result) => {
				if (result.apiKey != null) {
					setApiKey(result.apiKey);
				}
			});
		};
		listener();
		browser.storage.onChanged.addListener(listener);
		return () => {
			browser.storage.onChanged.removeListener(listener);
		};
	}, []);

	const fetchApiKey = async () => {
		const apiKey = await GetApiKeyChannel.send();
		browser.storage.local.set({ apiKey });
	};

	return { apiKey, fetchApiKey };
};
