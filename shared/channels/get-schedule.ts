import { z } from 'zod';
import { SafeChannel } from '../message';
import { ShapeOf, ZRecord, ZResult, ZStrategy, safeZEnum } from './shared-types';
import { fastQuery, getClient } from './gql-client';
import { gql } from '@apollo/client';

const League = z.object({
	name: z.string(),
	slug: z.string(),
});
export type League = z.infer<typeof League>;

const Flag = safeZEnum(['hasVod', 'isSpoiler', 'unknown'] as const, 'unknown');
export type Flag = z.infer<typeof Flag>;

const State = safeZEnum(['completed', 'inProgress', 'unstarted', 'unknown'] as const, 'unknown');
export type State = z.infer<typeof State>;

const EventType = safeZEnum(['match', 'unknown'] as const, 'unknown');
export type EventType = z.infer<typeof EventType>;

const Pages = z.object({
	older: z.string().nullable(),
	newer: z.string().nullable(),
});
export type Pages = z.infer<typeof Pages>;

const Team = z.object({
	name: z.string(),
	code: z.string(),
	image: z.string(),
	result: ZResult.nullable(),
});
export type Team = z.infer<typeof Team>;

const Match = z.object({
	id: z.string(),
	flags: z.array(Flag),
	matchTeams: z.array(Team),
	strategy: ZStrategy,
});
export type Match = z.infer<typeof Match>;

const Event = z.object({
	startTime: z.string().datetime({ offset: true }),
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
	esports: Schedule,
});
export type Data = z.infer<typeof Data>;

const ScheduleResponse = z.object({
	data: Data,
});
export type ScheduleResponse = z.infer<typeof ScheduleResponse>;

const getSchedule = async (leagueId: string) => {
	const client = await getClient();
	if (client == null) {
		throw new Error('Could not initialize gql client');
	}

	const res = await fastQuery<ScheduleResponse>(client, 'homeEvents', {
		hl: 'en-US',
		sport: 'lol',
		eventState: ['unstarted', 'inProgress', 'completed'],
		eventType: 'all',
		vodType: ['recap'],
		pageSize: 100,
		leagues: [leagueId],
	});
	return ScheduleResponse.safeParse(res);
};

const GetScheduleMessage = z.object({
	kind: z.enum(['fetch-schedule']),
	leagueId: z.string(),
});
export type GetScheduleMessage = z.infer<typeof GetScheduleMessage>;

export const GetScheduleChannel: SafeChannel<
	GetScheduleMessage,
	ShapeOf<typeof ScheduleResponse>,
	typeof ScheduleResponse
> = {
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
