import { z } from 'zod';
import { ShapeOf, ZParticipant, safeZEnum } from './shared-types';
import { SafeChannel } from '../message';

const Ability = safeZEnum(['E', 'Q', 'R', 'W', 'unknown'] as const, 'unknown');
export type Ability = z.infer<typeof Ability>;

const PerkMetadata = z.object({
	styleId: z.number(),
	subStyleId: z.number(),
	perks: z.array(z.number()),
});
export type PerkMetadata = z.infer<typeof PerkMetadata>;

const Participant = ZParticipant.omit({
	totalGold: true,
	currentHealth: true,
	maxHealth: true,
}).extend({
	totalGoldEarned: z.number(),
	killParticipation: z.number(),
	championDamageShare: z.number(),
	wardsPlaced: z.number(),
	wardsDestroyed: z.number(),
	attackDamage: z.number(),
	abilityPower: z.number(),
	criticalChance: z.number(),
	attackSpeed: z.number(),
	lifeSteal: z.number(),
	armor: z.number(),
	magicResistance: z.number(),
	tenacity: z.number(),
	items: z.array(z.number()),
	perkMetadata: PerkMetadata,
	abilities: z.array(Ability),
});
export type Participant = z.infer<typeof Participant>;

const Frame = z.object({
	rfc460Timestamp: z.string().datetime({ offset: true }),
	participants: z.array(Participant),
});
export type Frame = z.infer<typeof Frame>;

const TeamFeedResponse = z.object({
	frames: z.array(Frame),
});
export type TeamFeedResponse = z.infer<typeof TeamFeedResponse>;

const GetTeamFeedMessage = z.object({
	kind: z.enum(['fetch-team-feed']),
	eventId: z.string(),
	startingTime: z.string().datetime({ offset: true }),
	participantIds: z.array(z.number().int().gte(1).lte(10)),
});
export type GetTeamFeedMessage = z.infer<typeof GetTeamFeedMessage>;

const getTeamFeed = async (
	eventId: string,
	startingTime: Date,
	participantIds: number[],
): Promise<ReturnType<(typeof TeamFeedResponse)['safeParse']>> => {
	const res = await fetch(
		`https://feed.lolesports.com/livestats/v1/details/${eventId}?startingTime=${startingTime.toISOString()}&participantIds=${participantIds.join(
			'_',
		)}`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		},
	);
	const json = await res.json();
	return TeamFeedResponse.safeParse(json);
};

export const GetTeamFeedChannel: SafeChannel<
	GetTeamFeedMessage,
	ShapeOf<typeof TeamFeedResponse>,
	typeof TeamFeedResponse
> = {
	async send(options?: Omit<GetTeamFeedMessage, 'kind'>) {
		return await browser.runtime.sendMessage({
			kind: 'fetch-team-feed',
			...options,
		});
	},

	async receive(message: GetTeamFeedMessage) {
		if (GetTeamFeedMessage.safeParse(message).success) {
			return await getTeamFeed(
				message.eventId,
				new Date(message.startingTime),
				message.participantIds,
			);
		}
	},
};

const url =
	'https://feed.lolesports.com/livestats/v1/details/110853020184706758?startingTime=2023-11-11T12:09:40.000Z&participantIds=1_6';
