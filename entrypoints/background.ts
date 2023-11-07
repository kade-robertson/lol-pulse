import { receivers } from '@/shared/channels';

export default defineBackground(() => {
	browser.runtime.onMessage.addListener(async (message) => {
		for (const receiver of receivers) {
			const response = await receiver(message);
			if (response != undefined) {
				return response;
			}
		}
	});

	browser.alarms.onAlarm.addListener((alarm) => {
		browser.tabs.create({ url: `https://lolesports.com/live ` });
		browser.alarms.clear(alarm.name);
	});
});
