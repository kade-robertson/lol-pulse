import type { Team as GetScheduleTeam } from '@/shared/channels/get-schedule';
import Flex from 'antd/es/flex';
import Image from 'antd/es/image';

const TeamWithIcon = ({ team }: { team: GetScheduleTeam }) => (
	<Flex gap="small">
		<Image width={24} src={team.image} />
		<span>{team.code}</span>
	</Flex>
);

export default TeamWithIcon;
