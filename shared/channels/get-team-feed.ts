import * as v from 'valibot';
import type { SafeChannel } from '../message';
import { type ShapeOf, safeVEnum, VParticipant } from './shared-types';

const Ability = safeVEnum(['E', 'Q', 'R', 'W', 'unknown'] as const, 'unknown');
export type Ability = v.InferOutput<typeof Ability>;

const PerkMetadata = v.object({
	styleId: v.number(),
	subStyleId: v.number(),
	perks: v.array(v.number()),
});
export type PerkMetadata = v.InferOutput<typeof PerkMetadata>;

const Participant = v.object({
	totalGoldEarned: v.number(),
	killParticipation: v.number(),
	championDamageShare: v.number(),
	wardsPlaced: v.number(),
	wardsDestroyed: v.number(),
	attackDamage: v.number(),
	abilityPower: v.number(),
	criticalChance: v.number(),
	attackSpeed: v.number(),
	lifeSteal: v.number(),
	armor: v.number(),
	magicResistance: v.number(),
	tenacity: v.number(),
	items: v.array(v.number()),
	perkMetadata: PerkMetadata,
	abilities: v.array(Ability),
	...v.omit(VParticipant, ['totalGold', 'currentHealth', 'maxHealth']).entries,
});
export type Participant = v.InferOutput<typeof Participant>;

const Frame = v.object({
	rfc460Timestamp: v.pipe(v.string(), v.isoTimestamp()),
	participants: v.array(Participant),
});
export type Frame = v.InferOutput<typeof Frame>;

const TeamFeedResponse = v.object({
	frames: v.array(Frame),
});
export type TeamFeedResponse = v.InferOutput<typeof TeamFeedResponse>;

const GetTeamFeedMessage = v.object({
	kind: v.literal('fetch-team-feed'),
	eventId: v.string(),
	startingTime: v.pipe(v.string(), v.isoTimestamp()),
	participantIds: v.array(v.pipe(v.number(), v.integer(), v.minValue(1), v.maxValue(10))),
});
export type GetTeamFeedMessage = v.InferOutput<typeof GetTeamFeedMessage>;

const getTeamFeed = async (
	eventId: string,
	startingTime: Date,
	participantIds: number[],
): Promise<ReturnType<typeof v.safeParse<typeof TeamFeedResponse>>> => {
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
	return v.safeParse(TeamFeedResponse, json);
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
		if (v.safeParse(GetTeamFeedMessage, message).success) {
			return await getTeamFeed(
				message.eventId,
				new Date(message.startingTime),
				message.participantIds,
			);
		}
	},
};
