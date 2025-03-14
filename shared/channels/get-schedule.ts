import * as v from "valibot";
import type { SafeChannel } from "../message";
import { fastQuery, getClient } from "./gql-client";
import { type ShapeOf, VResult, VStrategy, safeVEnum } from "./shared-types";

const League = v.object({
	name: v.string(),
	slug: v.string(),
});
export type League = v.InferOutput<typeof League>;

const Flag = safeVEnum(["hasVod", "isSpoiler", "unknown"] as const, "unknown");
export type Flag = v.InferOutput<typeof Flag>;

const State = safeVEnum(
	["completed", "inProgress", "unstarted", "unknown"] as const,
	"unknown"
);
export type State = v.InferOutput<typeof State>;

const EventType = safeVEnum(["match", "unknown"] as const, "unknown");
export type EventType = v.InferOutput<typeof EventType>;

const Pages = v.object({
	older: v.nullable(v.string()),
	newer: v.nullable(v.string()),
});
export type Pages = v.InferOutput<typeof Pages>;

const Team = v.object({
	name: v.string(),
	code: v.string(),
	image: v.string(),
	result: v.nullable(VResult),
});
export type Team = v.InferOutput<typeof Team>;

const Match = v.object({
	id: v.string(),
	flags: v.array(Flag),
	matchTeams: v.array(Team),
	strategy: VStrategy,
});
export type Match = v.InferOutput<typeof Match>;

const Event = v.object({
	startTime: v.pipe(v.string(), v.isoTimestamp()),
	state: State,
	type: EventType,
	blockName: v.string(),
	league: League,
	match: Match,
});
export type Event = v.InferOutput<typeof Event>;

const Schedule = v.object({
	pages: Pages,
	events: v.array(Event),
});
export type Schedule = v.InferOutput<typeof Schedule>;

const Data = v.object({
	esports: Schedule,
});
export type Data = v.InferOutput<typeof Data>;

const ScheduleResponse = v.object({
	data: Data,
});
export type ScheduleResponse = v.InferOutput<typeof ScheduleResponse>;

const getSchedule = async (leagueId: string) => {
	const client = await getClient();
	if (client == null) {
		throw new Error("Could not initialize gql client");
	}

	const res = await fastQuery<ScheduleResponse>(client, "homeEvents", {
		hl: "en-US",
		sport: "lol",
		eventState: ["unstarted", "inProgress", "completed"],
		eventType: "match",
		pageSize: 100,
		leagues: [leagueId],
	});
	return v.safeParse(ScheduleResponse, res);
};

const GetScheduleMessage = v.object({
	kind: v.literal("fetch-schedule"),
	leagueId: v.string(),
});
export type GetScheduleMessage = v.InferOutput<typeof GetScheduleMessage>;

export const GetScheduleChannel: SafeChannel<
	GetScheduleMessage,
	ShapeOf<typeof ScheduleResponse>,
	typeof ScheduleResponse
> = {
	async send(options?: { leagueId: string }) {
		return await browser.runtime.sendMessage({
			kind: "fetch-schedule",
			...options,
		});
	},

	async receive(message: GetScheduleMessage) {
		if (v.safeParse(GetScheduleMessage, message).success) {
			return await getSchedule(message.leagueId);
		}
	},
};
