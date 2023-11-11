import { z } from 'zod';
import { Channel, SafeChannel } from '../message';
import { ShapeOf, ZLeague } from './shared-types';

const LeaguesData = z.object({
	leagues: z.array(ZLeague),
});
export type LeaguesData = z.infer<typeof LeaguesData>;

const LeaguesResponse = z.object({
	data: LeaguesData,
});
export type LeaguesResponse = z.infer<typeof LeaguesResponse>;

const getLeagues = async (): Promise<ReturnType<(typeof LeaguesResponse)['safeParse']>> => {
	const apiKey = await browser.storage.local.get('apiKey').then((r) => r.apiKey);
	const res = await fetch('https://esports-api.lolesports.com/persisted/gw/getLeagues?hl=en-US', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
		},
	});
	const resJson = await res.json();
	return LeaguesResponse.safeParse(resJson);
};

const GetLeaguesMessage = z.object({
	kind: z.enum(['fetch-leagues']),
});
export type GetLeaguesMessage = z.infer<typeof GetLeaguesMessage>;

export const GetLeaguesChannel: SafeChannel<
	GetLeaguesMessage,
	ShapeOf<typeof LeaguesResponse>,
	typeof LeaguesResponse
> = {
	async send() {
		return await browser.runtime.sendMessage({ kind: 'fetch-leagues' });
	},

	async receive(message: GetLeaguesMessage) {
		if (GetLeaguesMessage.safeParse(message).success) {
			return await getLeagues();
		}
	},
};
