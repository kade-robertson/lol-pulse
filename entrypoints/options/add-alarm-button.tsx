import { GetSchedule } from '@/shared/channels';
import { Button } from 'antd';
import { useContext } from 'react';
import { AlarmContext } from './contexts/alarm-ctx';

const AddAlarmButton = ({ record }: { record: GetSchedule.Event }) => {
	const { alarms, addAlarm } = useContext(AlarmContext);

	if (alarms.some((a) => a.matchId === record.match.id)) {
		return null;
	}

	return (
		record.state === 'unstarted' && (
			<Button
				size="small"
				type="primary"
				key={`set-alarm-${record.match.id}`}
				onClick={() =>
					addAlarm({
						matchId: record.match.id,
						league: record.league.name,
						name: `${record.match.matchTeams[0].code} vs. ${record.match.matchTeams[1].code}`,
						time: new Date(record.startTime),
					})
				}
			>
				Set Alarm
			</Button>
		)
	);
};

export default AddAlarmButton;
