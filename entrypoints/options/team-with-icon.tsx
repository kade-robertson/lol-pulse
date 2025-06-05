import type { Team as GetScheduleTeam } from '@/shared/channels/get-schedule';

const TeamWithIcon = ({ team }: { team: GetScheduleTeam }) => (
	<div className="flex gap-1">
		<img alt={team.name} width={24} src={team.image} />
		<span>{team.code}</span>
	</div>
);

export default TeamWithIcon;
