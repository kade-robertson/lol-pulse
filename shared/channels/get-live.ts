import { z } from 'zod';
import { SafeChannel } from '../message';
import fixture from './__fixtures__/get-live-01';
import { ShapeOf, ZMaybeLiveEvent } from './shared-types';

const Schedule = z.object({
	events: z.array(ZMaybeLiveEvent),
});
export type Schedule = z.infer<typeof Schedule>;

const Data = z.object({
	schedule: Schedule,
});
export type Data = z.infer<typeof Data>;

const LiveResponse = z.object({
	data: Data,
});
export type LiveResponse = z.infer<typeof LiveResponse>;

const GetLiveMessage = z.object({
	kind: z.enum(['fetch-live']),
});
export type GetLiveMessage = z.infer<typeof GetLiveMessage>;

export const getLive = async (): Promise<ReturnType<(typeof LiveResponse)['safeParse']>> => {
	const apiKey = await browser.storage.local.get('apiKey').then((r) => r.apiKey);
	const res = await fetch('https://esports-api.lolesports.com/persisted/gw/getLive?hl=en-US', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
		},
	});
	const resJson = await res.json();
	return LiveResponse.safeParse(resJson);
};

export const GetLiveChannel: SafeChannel<
	GetLiveMessage,
	ShapeOf<typeof LiveResponse>,
	typeof LiveResponse
> = {
	async send() {
		return await browser.runtime.sendMessage({ kind: 'fetch-live' });
	},

	async receive(message: GetLiveMessage) {
		if (GetLiveMessage.safeParse(message).success) {
			return await getLive();
		}
	},
};
