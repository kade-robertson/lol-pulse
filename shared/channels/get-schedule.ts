import { z } from 'zod';
import { Channel } from '../message';

const League = z.object({
	name: z.string(),
	slug: z.string(),
});
export type League = z.infer<typeof League>;

const Flag = z.enum(['hasVod', 'isSpoiler']);
export type Flag = z.infer<typeof Flag>;

const StrategyType = z.enum(['bestOf', 'playAll']);
export type StrategyType = z.infer<typeof StrategyType>;

const Record = z.object({
	wins: z.number(),
	losses: z.number(),
});
export type Record = z.infer<typeof Record>;

const Outcome = z.enum(['loss', 'win', 'tie']);
export type Outcome = z.infer<typeof Outcome>;

const State = z.string();
export type State = z.infer<typeof State>;

const EventType = z.enum(['match']);
export type EventType = z.infer<typeof EventType>;

const Pages = z.object({
	older: z.string().nullable(),
	newer: z.string().nullable(),
});
export type Pages = z.infer<typeof Pages>;

const Result = z.object({
	outcome: Outcome.nullable(),
	gameWins: z.number(),
});
export type Result = z.infer<typeof Result>;

const Team = z.object({
	name: z.string(),
	code: z.string(),
	image: z.string(),
	result: Result.nullable(),
	record: Record.nullable(),
});
export type Team = z.infer<typeof Team>;

const Strategy = z.object({
	type: StrategyType,
	count: z.number(),
});
export type Strategy = z.infer<typeof Strategy>;

const Match = z.object({
	id: z.string(),
	flags: z.array(Flag),
	teams: z.array(Team),
	strategy: Strategy,
});
export type Match = z.infer<typeof Match>;

const Event = z.object({
	startTime: z.string().transform((s) => new Date(s)),
	state: State,
	type: EventType,
	blockName: z.string(),
	league: League,
	match: Match,
});
export type Event = z.infer<typeof Event>;

const Schedule = z.object({
	pages: Pages,
	events: z.array(Event),
});
export type Schedule = z.infer<typeof Schedule>;

const Data = z.object({
	schedule: Schedule,
});
export type Data = z.infer<typeof Data>;

const ScheduleResponse = z.object({
	data: Data,
});
export type ScheduleResponse = z.infer<typeof ScheduleResponse>;

const getSchedule = async (leagueId: string): Promise<ScheduleResponse> => {
	const apiKey = await browser.storage.local.get('apiKey').then((r) => r.apiKey);
	if (apiKey == null) {
		return {
			data: { schedule: { pages: { older: null, newer: null }, events: [] } },
		};
	}
	const res = await fetch(
		`https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=en-US&leagueId=${leagueId}`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': apiKey,
			},
		},
	);
	const resJson = await res.json();
	return ScheduleResponse.parse(resJson);
};

const GetScheduleMessage = z.object({
	kind: z.enum(['fetch-schedule']),
	leagueId: z.string(),
});
export type GetScheduleMessage = z.infer<typeof GetScheduleMessage>;

export const GetScheduleChannel: Channel<GetScheduleMessage, ScheduleResponse> = {
	async send(options?: { leagueId: string }) {
		return await browser.runtime.sendMessage({
			kind: 'fetch-schedule',
			...options,
		});
	},

	async receive(message: GetScheduleMessage) {
		if (GetScheduleMessage.safeParse(message).success) {
			return await getSchedule(message.leagueId);
		}
	},
};
