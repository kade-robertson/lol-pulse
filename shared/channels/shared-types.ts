import * as v from 'valibot';

export type ShapeOf<T> = T extends v.ObjectSchema<infer S, infer _> ? S : never;

export const safeVEnum = <
	Values extends readonly [string, ...string[]],
	Default extends Values[number],
>(
	values: Values,
	def: Default,
) =>
	v.fallback(
		v.union<v.LiteralSchema<Values[number], undefined>[]>(values.map((val) => v.literal(val))),
		def,
	);

export const VRecord = v.object({
	wins: v.number(),
	losses: v.number(),
});
export type Record = v.InferOutput<typeof VRecord>;

export const VOutcome = safeVEnum(['loss', 'win', 'tie', 'unknown'] as const, 'unknown');
export type Outcome = v.InferOutput<typeof VOutcome>;

export const VResult = v.object({
	outcome: v.nullable(VOutcome),
	gameWins: v.number(),
});
export type Result = v.InferOutput<typeof VResult>;

export const VStrategyType = safeVEnum(['bestOf', 'playAll', 'unknown'] as const, 'unknown');
export type StrategyType = v.InferOutput<typeof VStrategyType>;

export const VStrategy = v.object({
	type: VStrategyType,
	count: v.number(),
});
export type Strategy = v.InferOutput<typeof VStrategy>;

export const VStatus = safeVEnum(
	['force_selected', 'not_selected', 'selected', 'unknown'] as const,
	'unknown',
);
export type Status = v.InferOutput<typeof VStatus>;

export const VDisplayPriority = v.object({
	position: v.number(),
	status: VStatus,
});
export type DisplayPriority = v.InferOutput<typeof VDisplayPriority>;

export const VLeague = v.object({
	id: v.string(),
	slug: v.string(),
	name: v.string(),
	region: v.optional(v.string()),
	image: v.string(),
	priority: v.optional(v.number()),
	displayPriority: VDisplayPriority,
});
export type League = v.InferOutput<typeof VLeague>;

export const VTournament = v.object({
	id: v.string(),
});
export type Tournament = v.InferOutput<typeof VTournament>;

export const VStatsStatus = safeVEnum(['disabled', 'enabled', 'unknown'] as const, 'unknown');
export type StatsStatus = v.InferOutput<typeof VStatsStatus>;

export const VMediaLocale = v.object({
	locale: v.string(),
	englishName: v.string(),
	translatedName: v.string(),
});
export type MediaLocale = v.InferOutput<typeof VMediaLocale>;

export const VProvider = safeVEnum(
	['afreecatv', 'twitch', 'youtube', 'unknown'] as const,
	'unknown',
);
export type Provider = v.InferOutput<typeof VProvider>;

const VSide = safeVEnum(['blue', 'red', 'unknown'] as const, 'unknown');
export type Side = v.InferOutput<typeof VSide>;

export const VGameTeam = v.object({
	id: v.string(),
	side: VSide,
});
export type GameTeam = v.InferOutput<typeof VGameTeam>;

export const VMatchTeam = v.object({
	id: v.string(),
	name: v.string(),
	slug: v.optional(v.string()),
	code: v.string(),
	image: v.string(),
	result: VResult,
	record: v.optional(VRecord),
});
export type MatchTeam = v.InferOutput<typeof VMatchTeam>;

export const VStream = v.object({
	parameter: v.string(),
	mediaLocale: VMediaLocale,
	provider: VProvider,
	countries: v.array(v.string()),
	offset: v.number(),
});
export type Stream = v.InferOutput<typeof VStream>;

export const VVOD = v.object({
	id: v.string(),
	parameter: v.string(),
	locale: v.optional(v.string()),
	mediaLocale: v.optional(VMediaLocale),
	provider: v.optional(VProvider),
	offset: v.optional(v.number()),
	firstFrameTime: v.optional(v.pipe(v.string(), v.isoTimestamp())),
	startMillis: v.nullable(v.number()),
	endMillis: v.nullable(v.number()),
});
export type VOD = v.InferOutput<typeof VVOD>;

export const VGame = v.object({
	number: v.number(),
	id: v.string(),
	state: v.string(),
	teams: v.optional(v.array(VGameTeam)),
	vods: v.array(VVOD),
});
export type Game = v.InferOutput<typeof VGame>;

export const VMatch = v.object({
	id: v.string(),
	strategy: VStrategy,
	games: v.array(VGame),
});
export type Match = v.InferOutput<typeof VMatch>;

export const VMaybeLiveEvent = v.object({
	id: v.string(),
	startTime: v.pipe(v.string(), v.isoTimestamp()),
	state: v.string(),
	type: v.string(),
	league: VLeague,
	tournament: VTournament,
	match: v.optional(VMatch),
	streams: v.array(VStream),
	matchTeams: v.array(VMatchTeam),
});
export type MaybeLiveEvent = v.InferOutput<typeof VMaybeLiveEvent>;

export const VParticipant = v.object({
	participantId: v.number(),
	totalGold: v.number(),
	level: v.number(),
	kills: v.number(),
	deaths: v.number(),
	assists: v.number(),
	creepScore: v.number(),
	currentHealth: v.number(),
	maxHealth: v.number(),
});
export type Participant = v.InferOutput<typeof VParticipant>;
