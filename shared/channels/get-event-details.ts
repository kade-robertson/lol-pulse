import * as v from "valibot";
import type { SafeChannel } from "../message";
import { type ShapeOf, VLeague, VMaybeLiveEvent } from "./shared-types";

const MaybeLiveEvent = v.object({
	...VMaybeLiveEvent.entries,
	league: v.object({
		...VLeague.entries,
		priority: v.optional(VLeague.entries.priority),
		displayPriority: v.optional(VLeague.entries.displayPriority),
	}),
	startTime: v.optional(VMaybeLiveEvent.entries.startTime),
	state: v.optional(VMaybeLiveEvent.entries.state),
});
export type MaybeLiveEvent = v.InferOutput<typeof MaybeLiveEvent>;

const Data = v.object({
	event: MaybeLiveEvent,
});
export type Data = v.InferOutput<typeof Data>;

const DetailsResponse = v.object({
	data: Data,
});
export type LiveResponse = v.InferOutput<typeof DetailsResponse>;

export const GetDetailsMessage = v.object({
	kind: v.literal("fetch-details"),
	eventId: VMaybeLiveEvent.entries.id,
});
export type GetDetailsMessage = v.InferOutput<typeof GetDetailsMessage>;

const getDetails = async (
	eventId: string
): Promise<ReturnType<typeof v.safeParse<typeof DetailsResponse>>> => {
	const apiKey = await browser.storage.local
		.get("apiKey")
		.then((r) => r.apiKey as string);
	const res = await fetch(
		`https://esports-api.lolesports.com/persisted/gw/getEventDetails?hl=en-US&id=${eventId}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				"x-api-key": apiKey,
			},
		}
	);
	const resJson = await res.json();
	return v.safeParse(DetailsResponse, resJson);
};

export const GetDetailsChannel: SafeChannel<
	GetDetailsMessage,
	ShapeOf<typeof DetailsResponse>,
	typeof DetailsResponse
> = {
	async send(options?: { eventId: string }) {
		return await browser.runtime.sendMessage({
			kind: "fetch-details",
			...options,
		});
	},

	async receive(message: GetDetailsMessage) {
		if (v.safeParse(GetDetailsMessage, message).success) {
			return await getDetails(message.eventId);
		}
	},
};
