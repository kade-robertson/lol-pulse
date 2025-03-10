import type { MatchAlarm } from '@/shared/alarms';
import Button from 'antd/es/button';
import { useContext } from 'react';
import { AlarmContext } from './contexts/alarm-ctx';

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
