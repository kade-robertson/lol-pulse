import { GetLeaguesChannel } from './get-leagues';
import { GetScheduleChannel } from './get-schedule';
import { GetApolloConfigChannel } from './get-apollo-config';
import { GetLiveChannel } from './get-live';
import { GetDetailsChannel } from './get-event-details';
import { GetFeedChannel } from './get-feed';
import { GetTeamFeedChannel } from './get-team-feed';

export const receivers = [
	GetLeaguesChannel.receive,
	GetScheduleChannel.receive,
	GetApolloConfigChannel.receive,
	GetLiveChannel.receive,
	GetDetailsChannel.receive,
	GetFeedChannel.receive,
	GetTeamFeedChannel.receive,
];

export * as GetLeagues from './get-leagues';
export { GetLeaguesChannel } from './get-leagues';

export * as GetSchedule from './get-schedule';
export { GetScheduleChannel } from './get-schedule';

export * as GetApolloConfig from './get-apollo-config';
export { GetApolloConfigChannel } from './get-apollo-config';

export * as GetLive from './get-live';
export { GetLiveChannel } from './get-live';

export * as GetDetails from './get-event-details';
export { GetDetailsChannel } from './get-event-details';

export * as GetFeed from './get-feed';
export { GetFeedChannel } from './get-feed';

export * as GetTeamFeed from './get-team-feed';
export { GetTeamFeedChannel } from './get-team-feed';
