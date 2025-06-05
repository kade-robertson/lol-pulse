import type { MatchAlarm } from '@/shared/alarms';
import { Button } from '@/ui/components/ui/button';
import { useContext } from 'react';
import { AlarmContext } from './contexts/alarm-ctx';

const ClearAlarmButton = ({ match }: { match: MatchAlarm }) => {
	const { removeAlarm } = useContext(AlarmContext);

	return (
		<Button
			size="xs"
			variant="destructive"
			className="w-full"
			key={`clear-alarm-${match.matchId}`}
			onClick={() => removeAlarm(match)}
		>
			Clear
		</Button>
	);
};

export default ClearAlarmButton;
