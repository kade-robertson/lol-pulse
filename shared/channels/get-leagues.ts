import { z } from 'zod';
import { Channel } from '../message';

const Status = z.enum(['force_selected', 'not_selected', 'selected']);
export type Status = z.infer<typeof Status>;

const DisplayPriority = z.object({
	position: z.number(),
	status: Status,
});
export type DisplayPriority = z.infer<typeof DisplayPriority>;

const League = z.object({
	id: z.string(),
	slug: z.string(),
	name: z.string(),
	region: z.string(),
	image: z.string(),
	priority: z.number(),
	displayPriority: DisplayPriority,
});
export type League = z.infer<typeof League>;

const LeaguesData = z.object({
	leagues: z.array(League),
});
export type LeaguesData = z.infer<typeof LeaguesData>;

const LeaguesResponse = z.object({
	data: LeaguesData,
});
export type LeaguesResponse = z.infer<typeof LeaguesResponse>;

const getLeagues = async (): Promise<LeaguesResponse> => {
	const apiKey = await browser.storage.local.get('apiKey').then((r) => r.apiKey);
	if (apiKey == null) {
		return { data: { leagues: [] } };
	}
	const res = await fetch('https://esports-api.lolesports.com/persisted/gw/getLeagues?hl=en-US', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
		},
	});
	const resJson = await res.json();
	return LeaguesResponse.parse(resJson);
};

const GetLeaguesMessage = z.object({
	kind: z.enum(['fetch-leagues']),
});
export type GetLeaguesMessage = z.infer<typeof GetLeaguesMessage>;

export const GetLeaguesChannel: Channel<GetLeaguesMessage, LeaguesResponse> = {
	async send() {
		return await browser.runtime.sendMessage({ kind: 'fetch-leagues' });
	},

	async receive(message: GetLeaguesMessage) {
		if (GetLeaguesMessage.safeParse(message).success) {
			return await getLeagues();
		}
	},
};
