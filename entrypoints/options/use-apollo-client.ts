import {
	type ApolloConfigResponse,
	GetApolloConfigChannel,
} from '@/shared/channels/get-apollo-config';
import { useEffect, useState } from 'react';

export const useApolloConfig = () => {
	const [apolloConfig, setApolloConfig] = useState<ApolloConfigResponse | null>(null);

	useEffect(() => {
		const listener = () => {
			browser.storage.local.get('apolloConfig').then((result) => {
				if (result.apolloConfig != null) {
					setApolloConfig(result.apolloConfig as ApolloConfigResponse);
				}
			});
		};
		listener();
		browser.storage.onChanged.addListener(listener);
		return () => {
			browser.storage.onChanged.removeListener(listener);
		};
	}, []);

	const fetchApolloConfig = async () => {
		const apolloConfig = await GetApolloConfigChannel.send();
		browser.storage.local.set({ apolloConfig });
	};

	return { config: apolloConfig, fetchApolloConfig };
};
