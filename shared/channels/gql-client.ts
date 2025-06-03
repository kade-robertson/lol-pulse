import {
	ApolloClient,
	type DocumentNode,
	HttpLink,
	type NormalizedCacheObject,
	gql,
} from '@apollo/client';
import { createPersistedQueryLink } from '@apollo/client/link/persisted-queries';
import { generatePersistedQueryIdsFromManifest } from '@apollo/persisted-query-lists';
import { InvalidationPolicyCache } from '@nerdwallet/apollo-cache-policies';
import type { ApolloConfigResponse } from './get-apollo-config';

interface Operation {
	id: string;
	name: string;
	body: string;
}
type OperationMap = Record<string, Omit<Operation, 'body'> & { body: DocumentNode }>;

let client: ApolloClient<NormalizedCacheObject> | null = null;
let operations: OperationMap = {};

export const getClient = async (): Promise<typeof client> => {
	if (client == null) {
		const config = await browser.storage.local.get<{ apolloConfig: ApolloConfigResponse }>('apolloConfig');
		if (config == null) {
			return null;
		}

		operations = config.apolloConfig.pqlManifest.operations.reduce(
			(acc: OperationMap, op: Operation) => {
				acc[op.name] = {
					id: op.id,
					name: op.name,
					body: gql(op.body.replaceAll('\\n', '\n')),
				};
				return acc;
			},
			{} as OperationMap,
		);

		const pql = createPersistedQueryLink(
			generatePersistedQueryIdsFromManifest({
				loadManifest: async () => config.apolloConfig.pqlManifest,
			}),
		);

		const httpLink = new HttpLink({
			uri: 'https://lolesports.com/api/gql',
			useGETForQueries: true,
			headers: {
				'apollographql-client-name': config.apolloConfig.clientName,
				'apollographql-client-version': config.apolloConfig.clientVersion,
			},
		});

		const cache = new InvalidationPolicyCache({
			invalidationPolicies: {
				timeToLive: 30_000,
			},
		});

		client = new ApolloClient({
			link: pql.concat(httpLink),
			cache,
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
		query: gqlOperation.body,
		variables,
		fetchPolicy: 'cache-first',
		notifyOnNetworkStatusChange: false,
	});
};
