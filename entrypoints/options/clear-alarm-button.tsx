import { Button } from 'antd';
import { useContext } from 'react';
import { AlarmContext } from './contexts/alarm-ctx';
import { MatchAlarm } from '@/shared/alarms';

const ClearAlarmButton = ({ match }: { match: MatchAlarm }) => {
	const { removeAlarm } = useContext(AlarmContext);

	return (
		<Button
			size="small"
			type="dashed"
			danger
			key={`clear-alarm-${match.matchId}`}
			onClick={() => removeAlarm(match)}
		>
			Clear
		</Button>
	);
};

export default ClearAlarmButton;
