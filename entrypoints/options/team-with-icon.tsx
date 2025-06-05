import type { Team as GetScheduleTeam } from '@/shared/channels/get-schedule';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/ui/components/ui/tooltip';

const TeamWithIcon = ({ team }: { team: GetScheduleTeam }) => (
	<Tooltip>
		<TooltipTrigger asChild>
			<div className="flex h-[26px] gap-2 w-fit items-center">
				<img alt={team.name} width={24} src={team.image} />
				<span>{team.code}</span>
			</div>
		</TooltipTrigger>
		<TooltipContent>
			<span>{team.name}</span>
		</TooltipContent>
	</Tooltip>
);

export default TeamWithIcon;
