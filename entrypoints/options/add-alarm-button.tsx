import type { Event as GetScheduleEvent } from '@/shared/channels/get-schedule';
import { Button } from '@/ui/components/ui/button';
import { useContext } from 'react';
import { AlarmContext } from './contexts/alarm-ctx';

const AddAlarmButton = ({ record }: { record: GetScheduleEvent }) => {
	const { alarms, addAlarm } = useContext(AlarmContext);

	if (alarms.some((a) => a.matchId === record.match.id)) {
		return null;
	}

	return (
		record.state === 'unstarted' && (
			<Button
				size="xs"
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
