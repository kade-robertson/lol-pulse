import { z } from 'zod';
import { SafeChannel } from '../message';
import { ShapeOf, ZMaybeLiveEvent } from './shared-types';
import { fastQuery, getClient } from './gql-client';

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

	const res = await fastQuery<LiveResponse>(client, 'watchLiveQuery', {
		hl: 'en-US',
		sport: 'lol',
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
