import { type MatchAlarm, clearAlarm, getAlarms, setAlarm } from '@/shared/alarms';
import { type ReactNode, createContext, useEffect, useState } from 'react';

interface AlarmContext {
	alarms: MatchAlarm[];
	addAlarm: (alarm: MatchAlarm) => Promise<void>;
	removeAlarm: (alarm: MatchAlarm) => Promise<void>;
	clearAlarms(): Promise<void>;
}

export const AlarmContext = createContext<AlarmContext>({
	alarms: [],
	addAlarm: () => Promise.resolve(),
	removeAlarm: () => Promise.resolve(),
	clearAlarms: () => Promise.resolve(),
});

export const AlarmContextProvider = ({ children }: { children: ReactNode }) => {
	const [alarms, setAlarms] = useState<MatchAlarm[]>([]);

	useEffect(() => {
		reloadAlarms();
	}, []);

	const reloadAlarms = async () => {
		setAlarms(await getAlarms());
	};

	const addAlarm = async (alarm: MatchAlarm) => {
		const result = await setAlarm(alarm);
		if (result != null) {
			await reloadAlarms();
		}
	};

	const removeAlarm = async (alarm: MatchAlarm) => {
		const result = await clearAlarm(alarm);
		if (result) {
			await reloadAlarms();
		}
	};

	const clearAlarms = async () => {
		await browser.alarms.clearAll();
		await reloadAlarms();
	};

	return (
		<AlarmContext.Provider value={{ alarms, addAlarm, removeAlarm, clearAlarms }}>
			{children}
		</AlarmContext.Provider>
	);
};
