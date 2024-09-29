import { z } from 'zod';

export type ShapeOf<T> = T extends z.ZodObject<infer S> ? S : never;

type DefaultIsMember<
	Values extends [string, ...string[]],
	Default extends string,
> = Default extends Values[number] ? Default : never;

export const safeZEnum = <
	Values extends readonly [string, ...string[]],
	Default extends Values[number],
>(
	values: Values,
	def: Default,
) =>
	z.enum(values).catch((e) => {
		console.warn(e);
		return def;
	});

export const ZRecord = z.object({
	wins: z.number(),
	losses: z.number(),
});
export type Record = z.infer<typeof ZRecord>;

export const ZOutcome = safeZEnum(['loss', 'win', 'tie', 'unknown'] as const, 'unknown');
export type Outcome = z.infer<typeof ZOutcome>;

export const ZResult = z.object({
	outcome: ZOutcome.nullable(),
	gameWins: z.number(),
});
export type Result = z.infer<typeof ZResult>;

export const ZStrategyType = safeZEnum(['bestOf', 'playAll', 'unknown'] as const, 'unknown');
export type StrategyType = z.infer<typeof ZStrategyType>;

export const ZStrategy = z.object({
	type: ZStrategyType,
	count: z.number(),
});
export type Strategy = z.infer<typeof ZStrategy>;

export const ZStatus = safeZEnum(
	['force_selected', 'not_selected', 'selected', 'unknown'] as const,
	'unknown',
);
export type Status = z.infer<typeof ZStatus>;

export const ZDisplayPriority = z.object({
	position: z.number(),
	status: ZStatus,
});
export type DisplayPriority = z.infer<typeof ZDisplayPriority>;

export const ZLeague = z.object({
	id: z.string(),
	slug: z.string(),
	name: z.string(),
	region: z.string().optional(),
	image: z.string(),
	priority: z.number().optional(),
	displayPriority: ZDisplayPriority,
});
export type League = z.infer<typeof ZLeague>;

export const ZTournament = z.object({
	id: z.string(),
});
export type Tournament = z.infer<typeof ZTournament>;

export const ZStatsStatus = safeZEnum(['disabled', 'enabled', 'unknown'] as const, 'unknown');
export type StatsStatus = z.infer<typeof ZStatsStatus>;

export const ZMediaLocale = z.object({
	locale: z.string(),
	englishName: z.string(),
	translatedName: z.string(),
});
export type MediaLocale = z.infer<typeof ZMediaLocale>;

export const ZProvider = safeZEnum(
	['afreecatv', 'twitch', 'youtube', 'unknown'] as const,
	'unknown',
);
export type Provider = z.infer<typeof ZProvider>;

const ZSide = safeZEnum(['blue', 'red', 'unknown'] as const, 'unknown');
export type Side = z.infer<typeof ZSide>;

export const ZGameTeam = z.object({
	id: z.string(),
	side: ZSide,
});
export type GameTeam = z.infer<typeof ZGameTeam>;

export const ZMatchTeam = z.object({
	id: z.string(),
	name: z.string(),
	slug: z.string(),
	code: z.string(),
	image: z.string(),
	result: ZResult,
	record: ZRecord,
});
export type MatchTeam = z.infer<typeof ZMatchTeam>;

export const ZStream = z.object({
	parameter: z.string(),
	locale: z.string(),
	mediaLocale: ZMediaLocale,
	provider: ZProvider,
	countries: z.array(z.string()),
	offset: z.number(),
	statsStatus: ZStatsStatus,
});
export type Stream = z.infer<typeof ZStream>;

export const ZVOD = z.object({
	id: z.string(),
	parameter: z.string(),
	locale: z.string(),
	mediaLocale: ZMediaLocale,
	provider: ZProvider,
	offset: z.number(),
	firstFrameTime: z.string().datetime({ offset: true }),
	startMillis: z.number().nullable(),
	endMillis: z.number().nullable(),
});
export type VOD = z.infer<typeof ZVOD>;

export const ZGame = z.object({
	number: z.number(),
	id: z.string(),
	state: z.string(),
	teams: z.array(ZGameTeam),
	vods: z.array(ZVOD),
});
export type Game = z.infer<typeof ZGame>;

export const ZMatch = z.object({
	id: z.string(),
	matchTeams: z.array(ZMatchTeam),
	strategy: ZStrategy,
	games: z.array(ZGame),
});
export type Match = z.infer<typeof ZMatch>;

export const ZMaybeLiveEvent = z.object({
	id: z.string(),
	startTime: z.string().datetime({ offset: true }),
	state: z.string(),
	type: z.string(),
	blockName: z.string(),
	league: ZLeague,
	tournament: ZTournament,
	match: ZMatch,
	streams: z.array(ZStream),
});
export type MaybeLiveEvent = z.infer<typeof ZMaybeLiveEvent>;

export const ZParticipant = z.object({
	participantId: z.number(),
	totalGold: z.number(),
	level: z.number(),
	kills: z.number(),
	deaths: z.number(),
	assists: z.number(),
	creepScore: z.number(),
	currentHealth: z.number(),
	maxHealth: z.number(),
});
export type Participant = z.infer<typeof ZParticipant>;
