import { z } from 'zod';
import {
	ShapeOf,
	ZLeague,
	ZMatch,
	ZMatchTeam,
	ZMaybeLiveEvent,
	ZResult,
	ZStrategy,
} from './shared-types';
import { SafeChannel } from '../message';

const MaybeLiveEvent = ZMaybeLiveEvent.extend({
	match: ZMatch.extend({
		id: ZMatch.shape.id.optional(),
		strategy: ZStrategy.extend({
			type: ZStrategy.shape.type.optional(),
		}),
		teams: z.array(
			ZMatchTeam.extend({
				slug: ZMatchTeam.shape.slug.optional(),
				result: ZResult.extend({
					outcome: ZResult.shape.outcome.optional(),
				}),
				record: ZMatchTeam.shape.record.optional(),
			}),
		),
	}),
	league: ZLeague.extend({
		priority: ZLeague.shape.priority.optional(),
		displayPriority: ZLeague.shape.displayPriority.optional(),
	}),
	startTime: ZMaybeLiveEvent.shape.startTime.optional(),
	state: ZMaybeLiveEvent.shape.state.optional(),
	blockName: ZMaybeLiveEvent.shape.blockName.optional(),
});
export type MaybeLiveEvent = z.infer<typeof MaybeLiveEvent>;

const Data = z.object({
	event: MaybeLiveEvent,
});
export type Data = z.infer<typeof Data>;

const DetailsResponse = z.object({
	data: Data,
});
export type LiveResponse = z.infer<typeof DetailsResponse>;

export const GetDetailsMessage = z.object({
	kind: z.enum(['fetch-details']),
	eventId: ZMaybeLiveEvent.shape.id,
});
export type GetDetailsMessage = z.infer<typeof GetDetailsMessage>;

const getDetails = async (
	eventId: string,
): Promise<ReturnType<(typeof DetailsResponse)['safeParse']>> => {
	const apiKey = await browser.storage.local.get('apiKey').then((r) => r.apiKey);
	const res = await fetch(
		`https://esports-api.lolesports.com/persisted/gw/getEventDetails?hl=en-US&id=${eventId}`,
		{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'x-api-key': apiKey,
			},
		},
	);
	const resJson = await res.json();
	return DetailsResponse.safeParse(resJson);
};

export const GetDetailsChannel: SafeChannel<
	GetDetailsMessage,
	ShapeOf<typeof DetailsResponse>,
	typeof DetailsResponse
> = {
	async send(options?: { eventId: string }) {
		return await browser.runtime.sendMessage({
			kind: 'fetch-details',
			...options,
		});
	},

	async receive(message: GetDetailsMessage) {
		if (GetDetailsMessage.safeParse(message).success) {
			return await getDetails(message.eventId);
		}
	},
};
