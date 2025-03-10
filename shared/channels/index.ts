import { GetApolloConfigChannel } from './get-apollo-config';
import { GetDetailsChannel } from './get-event-details';
import { GetFeedChannel } from './get-feed';
import { GetLeaguesChannel } from './get-leagues';
import { GetLiveChannel } from './get-live';
import { GetScheduleChannel } from './get-schedule';
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
