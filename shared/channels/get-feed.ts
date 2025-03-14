import * as v from "valibot";
import type { SafeChannel } from "../message";
import {
	type ShapeOf,
	VMaybeLiveEvent,
	VParticipant,
	safeVEnum,
} from "./shared-types";

const ParticipantMetadata = v.object({
	participantId: v.number(),
	esportsPlayerId: v.string(),
	summonerName: v.string(),
	championId: v.string(),
	role: v.string(),
});
export type ParticipantMetadata = v.InferOutput<typeof ParticipantMetadata>;

const TeamMetadata = v.object({
	esportsTeamId: v.string(),
	participantMetadata: v.array(ParticipantMetadata),
});
export type TeamMetadata = v.InferOutput<typeof TeamMetadata>;

const GameMetadata = v.object({
	patchVersion: v.string(),
	blueTeamMetadata: TeamMetadata,
	redTeamMetadata: TeamMetadata,
});
export type GameMetadata = v.InferOutput<typeof GameMetadata>;

const Dragon = safeVEnum(
	[
		"cloud",
		"infernal",
		"mountain",
		"ocean",
		"elder",
		"hextech",
		"chemtech",
		"unknown",
	] as const,
	"unknown"
);
export type Dragon = v.InferOutput<typeof Dragon>;

const GameState = safeVEnum(["in_game", "unknown"] as const, "unknown");
export type GameState = v.InferOutput<typeof GameState>;

const Team = v.object({
	totalGold: v.number(),
	inhibitors: v.number(),
	towers: v.number(),
	barons: v.number(),
	totalKills: v.number(),
	dragons: v.array(Dragon),
	participants: v.array(VParticipant),
});
export type Team = v.InferOutput<typeof Team>;

const Frame = v.object({
	rfc460Timestamp: v.pipe(v.string(), v.isoTimestamp()),
	gameState: GameState,
	blueTeam: Team,
	redTeam: Team,
});
export type Frame = v.InferOutput<typeof Frame>;

const FeedResponse = v.object({
	esportsGameId: v.string(),
	esportsMatchId: v.string(),
	gameMetadata: GameMetadata,
	frames: v.array(Frame),
});
export type StatsResponse = v.InferOutput<typeof FeedResponse>;

export const FeedMessage = v.object({
	kind: v.literal("fetch-feed"),
	eventId: VMaybeLiveEvent.entries.id,
	startingTime: v.pipe(v.string(), v.isoTimestamp()),
});
export type FeedMessage = v.InferOutput<typeof FeedMessage>;

const getFeed = async (
	eventId: string,
	startingTime: Date
): Promise<ReturnType<typeof v.safeParse<typeof FeedResponse>>> => {
	const res = await fetch(
		`https://feed.lolesports.com/livestats/v1/window/${eventId}?startingTime=${startingTime.toISOString()}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		}
	);
	const resJson = await res.json();
	return v.safeParse(FeedResponse, resJson);
};

export const GetFeedChannel: SafeChannel<
	FeedMessage,
	ShapeOf<typeof FeedResponse>,
	typeof FeedResponse
> = {
	async send(options?: Omit<FeedMessage, "kind">) {
		return await browser.runtime.sendMessage({
			kind: "fetch-feed",
			...options,
		});
	},

	async receive(message: FeedMessage) {
		if (v.safeParse(FeedMessage, message).success) {
			return await getFeed(message.eventId, new Date(message.startingTime));
		}
	},
};
