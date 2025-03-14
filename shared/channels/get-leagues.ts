import * as v from "valibot";
import type { SafeChannel } from "../message";
import { fastQuery, getClient } from "./gql-client";
import { type ShapeOf, VLeague } from "./shared-types";

const LeaguesData = v.object({
	leagues: v.array(VLeague),
});
export type LeaguesData = v.InferOutput<typeof LeaguesData>;

const LeaguesResponse = v.object({
	data: LeaguesData,
});
export type LeaguesResponse = v.InferOutput<typeof LeaguesResponse>;

const getLeagues = async (): Promise<
	ReturnType<typeof v.safeParse<typeof LeaguesResponse>>
> => {
	const client = await getClient();
	if (client == null) {
		throw new Error("Could not initialize gql client");
	}

	const res = await fastQuery<LeaguesResponse>(client, "homeLeagues", {
		hl: "en-US",
		sport: ["lol"],
		flags: ["excludeHidden", "excludeWithoutTournaments"],
	});
	return v.safeParse(LeaguesResponse, res);
};

const GetLeaguesMessage = v.object({
	kind: v.literal("fetch-leagues"),
});
export type GetLeaguesMessage = v.InferOutput<typeof GetLeaguesMessage>;

export const GetLeaguesChannel: SafeChannel<
	GetLeaguesMessage,
	ShapeOf<typeof LeaguesResponse>,
	typeof LeaguesResponse
> = {
	async send() {
		return await browser.runtime.sendMessage({ kind: "fetch-leagues" });
	},

	async receive(message: GetLeaguesMessage) {
		if (v.safeParse(GetLeaguesMessage, message).success) {
			return await getLeagues();
		}
	},
};
