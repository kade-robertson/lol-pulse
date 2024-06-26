import { z } from 'zod';
import { Channel } from '../message';

const ApiKeyResponse = z.string();
export type ApiKeyResponse = z.infer<typeof ApiKeyResponse>;

const GetApiKeyMessage = z.object({
	kind: z.enum(['get-api-key']),
});
export type GetApiKeyMessage = z.infer<typeof GetApiKeyMessage>;

const getApiKey = async (): Promise<ApiKeyResponse> => {
	// Open a tab to the LoL Esports website and intercept network requests
	// to the esports API.
	const tab = await browser.tabs.create({
		url: 'https://lolesports.com/',
	});

	return await new Promise<string>((resolve) => {
		const listener = ((details) => {
			const apiKeyMatch = details.requestHeaders?.find((h) => h.name === 'x-api-key');
			if (apiKeyMatch != null && apiKeyMatch.value != null) {
				browser.tabs.remove(tab.id!);
				browser.webRequest.onBeforeSendHeaders.removeListener(listener);
				resolve(apiKeyMatch.value);
			}
		}) satisfies Parameters<typeof browser.webRequest.onBeforeSendHeaders.addListener>[0];

		browser.webRequest.onBeforeSendHeaders.addListener(
			listener,
			{
				urls: ['https://esports-api.lolesports.com/*'],
				tabId: tab.id,
			},
			['requestHeaders'],
		);
	});
};

export const GetApiKeyChannel: Channel<GetApiKeyMessage, ApiKeyResponse> = {
	async send() {
		return await browser.runtime.sendMessage({
			kind: 'get-api-key',
		});
	},

	async receive(message: GetApiKeyMessage) {
		if (GetApiKeyMessage.safeParse(message).success) {
			return await getApiKey();
		}
	},
};
