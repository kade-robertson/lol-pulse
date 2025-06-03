import * as v from 'valibot';
import type { Browser } from 'wxt/browser';
import type { Channel } from '../message';

const ApolloConfigResponse = v.object({
	clientName: v.string(),
	clientVersion: v.string(),
	pqlManifest: v.any(),
});
export type ApolloConfigResponse = v.InferOutput<typeof ApolloConfigResponse>;

const GetApolloConfigMessage = v.object({
	kind: v.literal('get-apollo-config'),
});
export type GetApolloConfigMessage = v.InferOutput<typeof GetApolloConfigMessage>;

const handleClientInfo = (tabId: number): Promise<Omit<ApolloConfigResponse, 'pqlManifest'>> => {
	return new Promise<Omit<ApolloConfigResponse, 'pqlManifest'>>((resolve) => {
		const listener = (details: Browser.webRequest.OnBeforeSendHeadersDetails) => {
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
				resolve({
					clientName: clientNameMatch.value,
					clientVersion: clientVersionMatch.value,
				});
			}
			return undefined;
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

const CHUNK_PATTERN = /_next\/static\/chunks\/([^\s]+)\.js/;
const JSON_PARSE_PATTERN = /JSON.parse\('([^']+)'\)/;
const handlePqlManifest = async (tabId: number): Promise<ApolloConfigResponse['pqlManifest']> => {
	return new Promise<ApolloConfigResponse['pqlManifest']>((resolve) => {
		const listener = async (details: Browser.webRequest.OnBeforeSendHeadersDetails) => {
			const chunkMatch = CHUNK_PATTERN.exec(details.url);
			if (chunkMatch != null) {
				const chunkResponse = await fetch(
					`https://lolesports.com/_next/static/chunks/${chunkMatch[1]}.js`,
				);
				const text = await chunkResponse.text();
				if (text.includes('apollo-persisted-query-manifest')) {
					const pqlMatch = JSON_PARSE_PATTERN.exec(text);
					if (pqlMatch != null) {
						browser.webRequest.onBeforeSendHeaders.removeListener(wrapped);
						resolve(JSON.parse(pqlMatch[1]));
					}
				}
			}
		};

		const wrapped = (details: Browser.webRequest.OnBeforeSendHeadersDetails) => {
			listener(details);
			return undefined;
		};

		browser.webRequest.onBeforeSendHeaders.addListener(
			wrapped,
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

	if (tab.id == null) {
		throw new Error('Failed to open lolesports.com');
	}

	// We need to both:
	// - Listen for API requests to determine the client name and version
	// - Listen for chunk requests to then scan and extract the PQL manifest

	const [clientInfo, pqlManifest] = await Promise.all([
		handleClientInfo(tab.id),
		handlePqlManifest(tab.id),
	]);
	console.log('hi', clientInfo, pqlManifest);
	await browser.tabs.remove(tab.id);

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
		if (v.safeParse(GetApolloConfigMessage, message).success) {
			return await getApolloConfig();
		}
	},
};
