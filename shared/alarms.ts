import { z } from 'zod';

const MatchAlarm = z.object({
	matchId: z.string(),
	name: z.string(),
	league: z.string(),
	time: z.string().transform((time) => new Date(time)),
});
export type MatchAlarm = z.infer<typeof MatchAlarm>;

const matchAlarmToName = (alarm: MatchAlarm) => `${alarm.matchId}|${alarm.league}|${alarm.name}`;

const nameToMatchAlarm = (name: string): Omit<MatchAlarm, 'time'> => {
	const [matchId, league, matchName] = name.split('|');
	return { matchId, league, name: matchName };
};

export const getAlarms = async () => {
	const alarms = await browser.alarms.getAll();
	return alarms.map((alarm) => ({
		...nameToMatchAlarm(alarm.name),
		time: new Date(alarm.scheduledTime),
	}));
};

export const setAlarm = async (alarm: MatchAlarm) => {
	const matchId = matchAlarmToName(alarm);
	const existingAlarm = await browser.alarms.get(matchId);
	if (existingAlarm != null) {
		return undefined;
	}

	const alarmTime = new Date(alarm.time);
	browser.alarms.create(matchId, { when: alarmTime.getTime() });
	return await browser.alarms.get(matchId);
};

export const clearAlarm = async (alarm: MatchAlarm) => {
	const matchId = matchAlarmToName(alarm);
	const existingAlarm = await browser.alarms.get(matchId);
	if (existingAlarm == null) {
		return false;
	}

	return await browser.alarms.clear(matchId);
};
