import { GetLeaguesChannel } from './get-leagues';
import { GetScheduleChannel } from './get-schedule';
import { GetApiKeyChannel } from './get-api-key';

export const receivers = [
	GetLeaguesChannel.receive,
	GetScheduleChannel.receive,
	GetApiKeyChannel.receive,
];

export * as GetLeagues from './get-leagues';
export { GetLeaguesChannel } from './get-leagues';

export * as GetSchedule from './get-schedule';
export { GetScheduleChannel } from './get-schedule';

export * as GetApiKey from './get-api-key';
export { GetApiKeyChannel } from './get-api-key';
