import { z } from 'zod';
import type { SafeChannel } from '../message';
import { type ShapeOf, ZMaybeLiveEvent, ZParticipant, safeZEnum } from './shared-types';

const ParticipantMetadata = z.object({
	participantId: z.number(),
	esportsPlayerId: z.string(),
	summonerName: z.string(),
	championId: z.string(),
	role: z.string(),
});
export type ParticipantMetadata = z.infer<typeof ParticipantMetadata>;

const TeamMetadata = z.object({
	esportsTeamId: z.string(),
	participantMetadata: z.array(ParticipantMetadata),
});
export type TeamMetadata = z.infer<typeof TeamMetadata>;

const GameMetadata = z.object({
	patchVersion: z.string(),
	blueTeamMetadata: TeamMetadata,
	redTeamMetadata: TeamMetadata,
});
export type GameMetadata = z.infer<typeof GameMetadata>;

const Dragon = safeZEnum(
	['cloud', 'infernal', 'mountain', 'ocean', 'elder', 'hextech', 'chemtech', 'unknown'] as const,
	'unknown',
);
export type Dragon = z.infer<typeof Dragon>;

const GameState = safeZEnum(['in_game', 'unknown'] as const, 'unknown');
export type GameState = z.infer<typeof GameState>;

const Team = z.object({
	totalGold: z.number(),
	inhibitors: z.number(),
	towers: z.number(),
	barons: z.number(),
	totalKills: z.number(),
	dragons: z.array(Dragon),
	participants: z.array(ZParticipant),
});
export type Team = z.infer<typeof Team>;

const Frame = z.object({
	rfc460Timestamp: z.string().datetime({ offset: true }),
	gameState: GameState,
	blueTeam: Team,
	redTeam: Team,
});
export type Frame = z.infer<typeof Frame>;

const FeedResponse = z.object({
	esportsGameId: z.string(),
	esportsMatchId: z.string(),
	gameMetadata: GameMetadata,
	frames: z.array(Frame),
});
export type StatsResponse = z.infer<typeof FeedResponse>;

export const FeedMessage = z.object({
	kind: z.enum(['fetch-feed']),
	eventId: ZMaybeLiveEvent.shape.id,
	startingTime: z.string().datetime({ offset: true }),
});
export type FeedMessage = z.infer<typeof FeedMessage>;

const getFeed = async (
	eventId: string,
	startingTime: Date,
): Promise<ReturnType<(typeof FeedResponse)['safeParse']>> => {
	const res = await fetch(
		`https://feed.lolesports.com/livestats/v1/window/${eventId}?startingTime=${startingTime.toISOString()}`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		},
	);
	const resJson = await res.json();
	return FeedResponse.safeParse(resJson);
};

export const GetFeedChannel: SafeChannel<
	FeedMessage,
	ShapeOf<typeof FeedResponse>,
	typeof FeedResponse
> = {
	async send(options?: Omit<FeedMessage, 'kind'>) {
		return await browser.runtime.sendMessage({
			kind: 'fetch-feed',
			...options,
		});
	},

	async receive(message: FeedMessage) {
		if (FeedMessage.safeParse(message).success) {
			return await getFeed(message.eventId, new Date(message.startingTime));
		}
	},
};
