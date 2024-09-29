import { z } from 'zod';
import { Channel } from '../message';
import { WebRequest } from 'wxt/browser';

const ApolloConfigResponse = z.object({
	clientName: z.string(),
	clientVersion: z.string(),
	pqlManifest: z.any(),
});
export type ApolloConfigResponse = z.infer<typeof ApolloConfigResponse>;

const GetApolloConfigMessage = z.object({
	kind: z.enum(['get-apollo-config']),
});
export type GetApolloConfigMessage = z.infer<typeof GetApolloConfigMessage>;

const handleClientInfo = (tabId: number): Promise<ApolloConfigResponse> => {
	return new Promise<ApolloConfigResponse>((resolve) => {
		const listener = (details: WebRequest.OnBeforeSendHeadersDetailsType) => {
			const clientNameMatch = details.requestHeaders?.find(
				(h) => h.name === 'apollographql-client-name',
			);
			const clientVersionMatch = details.requestHeaders?.find(
				(h) => h.name === 'apollographql-client-version',
			);
			if (
				clientNameMatch != null &&
				clientNameMatch.value != null &&
				clientVersionMatch != null &&
				clientVersionMatch.value != null
			) {
				browser.webRequest.onBeforeSendHeaders.removeListener(listener);
				resolve({ clientName: clientNameMatch.value, clientVersion: clientVersionMatch.value });
			}
		};

		browser.webRequest.onBeforeSendHeaders.addListener(
			listener,
			{
				urls: ['https://lolesports.com/api/*'],
				tabId,
			},
			['requestHeaders'],
		);
	});
};

const handlePqlManifest = async (tabId: number): Promise<ApolloConfigResponse['pqlManifest']> => {
	return new Promise<ApolloConfigResponse['pqlManifest']>((resolve) => {
		const listener = async (details: WebRequest.OnBeforeSendHeadersDetailsType) => {
			const chunkMatch = /_next\/static\/chunks\/([^\s]+)\.js/.exec(details.url);
			if (chunkMatch != null) {
				const chunkResponse = await fetch(
					`https://lolesports.com/_next/static/chunks/${chunkMatch[1]}.js`,
				);
				const text = await chunkResponse.text();
				if (text.includes('apollo-persisted-query-manifest')) {
					const pqlMatch = /JSON.parse\('([^']+)'\)/.exec(text);
					if (pqlMatch != null) {
						resolve(JSON.parse(pqlMatch[1]));
					}
				}
			}
			return {};
		};

		browser.webRequest.onBeforeSendHeaders.addListener(
			listener,
			{ urls: ['https://lolesports.com/_next/static/chunks/*'], tabId },
			['requestHeaders'],
		);
	});
};

const getApolloConfig = async (): Promise<ApolloConfigResponse> => {
	// Open a tab to the LoL Esports website and intercept network requests
	// to the esports API.

	const tab = await browser.tabs.create({
		url: 'https://lolesports.com/',
	});

	// We need to both:
	// - Listen for API requests to determine the client name and version
	// - Listen for chunk requests to then scan and extract the PQL manifest

	const [clientInfo, pqlManifest] = await Promise.all([
		handleClientInfo(tab.id!),
		handlePqlManifest(tab.id!),
	]);
	await browser.tabs.remove(tab.id!);

	return {
		clientName: clientInfo.clientName,
		clientVersion: clientInfo.clientVersion,
		pqlManifest,
	};
};

export const GetApolloConfigChannel: Channel<GetApolloConfigMessage, ApolloConfigResponse> = {
	async send() {
		return await browser.runtime.sendMessage({
			kind: 'get-apollo-config',
		});
	},

	async receive(message: GetApolloConfigMessage) {
		if (GetApolloConfigMessage.safeParse(message).success) {
			return await getApolloConfig();
		}
	},
};
