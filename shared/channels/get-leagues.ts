import { z } from 'zod';
import type { SafeChannel } from '../message';
import { fastQuery, getClient } from './gql-client';
import { type ShapeOf, ZLeague } from './shared-types';

const LeaguesData = z.object({
	leagues: z.array(ZLeague),
});
export type LeaguesData = z.infer<typeof LeaguesData>;

const LeaguesResponse = z.object({
	data: LeaguesData,
});
export type LeaguesResponse = z.infer<typeof LeaguesResponse>;

const getLeagues = async (): Promise<ReturnType<(typeof LeaguesResponse)['safeParse']>> => {
	const client = await getClient();
	if (client == null) {
		throw new Error('Could not initialize gql client');
	}

	const res = await fastQuery<LeaguesResponse>(client, 'homeLeagues', {
		hl: 'en-US',
		sport: ['lol'],
		flags: ['excludeHidden', 'excludeWithoutTournaments'],
	});
	return LeaguesResponse.safeParse(res);
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
