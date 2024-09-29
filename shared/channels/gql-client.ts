import { ApolloClient, gql, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import { createPersistedQueryLink } from '@apollo/client/link/persisted-queries';
import { ApolloConfigResponse } from './get-apollo-config';
import { generatePersistedQueryIdsFromManifest } from '@apollo/persisted-query-lists';

let client: ApolloClient<NormalizedCacheObject> | null = null;
interface Operation {
	id: string;
	name: string;
	body: string;
}

let operations: Record<string, Operation> = {};
export const getClient = async (): Promise<typeof client> => {
	if (client == null) {
		const config = (await browser.storage.local.get('apolloConfig')) as
			| { apolloConfig: ApolloConfigResponse }
			| undefined;
		if (config == null) {
			return null;
		}

		operations = config.apolloConfig.pqlManifest.operations.reduce(
			(acc: Record<string, Operation>, op: Operation) => {
				acc[op.name] = op;
				return acc;
			},
			{} as Record<string, Operation>,
		);

		const pql = createPersistedQueryLink(
			generatePersistedQueryIdsFromManifest({
				loadManifest: async () => config.apolloConfig.pqlManifest,
			}),
		);

		console.log(operations);

		const httpLink = new HttpLink({
			uri: 'https://lolesports.com/api/gql',
			useGETForQueries: true,
			headers: {
				'apollographql-client-name': config.apolloConfig.clientName,
				'apollographql-client-version': config.apolloConfig.clientVersion,
			},
		});

		client = new ApolloClient({
			link: pql.concat(httpLink),
			cache: new InMemoryCache(),
			name: config.apolloConfig.clientName,
			version: config.apolloConfig.clientVersion,
			queryDeduplication: false,
		});
	}

	return client;
};

export const fastQuery = async <T>(
	apolloClient: NonNullable<typeof client>,
	operation: string,
	variables: Record<string, unknown>,
) => {
	const gqlOperation = operations[operation];
	if (gqlOperation == null) {
		throw new Error(`Operation ${operation} not found`);
	}

	return apolloClient.query<T>({
		query: gql(gqlOperation.body.replaceAll('\\n', '\n')),
		variables,
		fetchPolicy: 'cache-first',
		notifyOnNetworkStatusChange: false,
		context: {
			fetchOptions: {
				next: {
					revalidate: 60,
				},
			},
		},
	});
};
