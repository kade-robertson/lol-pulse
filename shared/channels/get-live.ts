import { z } from 'zod';
import type { SafeChannel } from '../message';
import { fastQuery, getClient } from './gql-client';
import { type ShapeOf, ZMaybeLiveEvent } from './shared-types';

const Schedule = z.object({
	events: z.array(ZMaybeLiveEvent),
});
export type Schedule = z.infer<typeof Schedule>;

const Data = z.object({
	esports: Schedule,
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
	const client = await getClient();
	if (client == null) {
		throw new Error('Could not initialize gql client');
	}

	const res = await fastQuery<LiveResponse>(client, 'homeEvents', {
		hl: 'en-US',
		sport: 'lol',
		eventState: ['inProgress'],
		eventType: 'all',
		pageSize: 100,
	});
	return LiveResponse.safeParse(res);
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
