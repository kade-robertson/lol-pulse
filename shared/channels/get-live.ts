import * as v from "valibot";
import type { SafeChannel } from "../message";
import { fastQuery, getClient } from "./gql-client";
import { type ShapeOf, VMaybeLiveEvent } from "./shared-types";

const Schedule = v.object({
	events: v.array(VMaybeLiveEvent),
});
export type Schedule = v.InferOutput<typeof Schedule>;

const Data = v.object({
	esports: Schedule,
});
export type Data = v.InferOutput<typeof Data>;

const LiveResponse = v.object({
	data: Data,
});
export type LiveResponse = v.InferOutput<typeof LiveResponse>;

const GetLiveMessage = v.object({
	kind: v.literal("fetch-live"),
});
export type GetLiveMessage = v.InferOutput<typeof GetLiveMessage>;

export const getLive = async (): Promise<
	ReturnType<typeof v.safeParse<typeof LiveResponse>>
> => {
	const client = await getClient();
	if (client == null) {
		throw new Error("Could not initialize gql client");
	}

	const res = await fastQuery<LiveResponse>(client, "homeEvents", {
		hl: "en-US",
		sport: "lol",
		eventState: ["inProgress"],
		eventType: "all",
		pageSize: 100,
	});
	return v.safeParse(LiveResponse, res);
};

export const GetLiveChannel: SafeChannel<
	GetLiveMessage,
	ShapeOf<typeof LiveResponse>,
	typeof LiveResponse
> = {
	async send() {
		return await browser.runtime.sendMessage({ kind: "fetch-live" });
	},

	async receive(message: GetLiveMessage) {
		if (v.safeParse(GetLiveMessage, message).success) {
			return await getLive();
		}
	},
};
