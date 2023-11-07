import { GetSchedule } from '@/shared/channels';
import { Flex, Image } from 'antd';

const TeamWithIcon = ({ team }: { team: GetSchedule.Team }) => (
	<Flex gap="small">
		<Image width={24} src={team.image}></Image>
		<span>{team.code}</span>
	</Flex>
);

export default TeamWithIcon;
