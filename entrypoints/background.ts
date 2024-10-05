import { nameToMatchAlarm } from '@/shared/alarms';
import { receivers } from '@/shared/channels';
import { getLive } from '@/shared/channels/get-live';
import { getLocaleAwareStream } from '@/shared/utils';

export default defineBackground(() => {
	browser.runtime.onMessage.addListener(async (message) => {
		for (const receiver of receivers) {
			const response = await receiver(message);
			if (response != undefined) {
				return response;
			}
		}
	});

	browser.alarms.onAlarm.addListener(async (alarm) => {
		const existingTabId = (await browser.storage.session.get('activeTabId'))?.activeTabId as
			| number
			| undefined;
		if (existingTabId != null) {
			try {
				const existingTab = await browser.tabs.get(existingTabId);
				if (existingTab != null) {
					browser.tabs.remove(existingTabId);
				}
			} catch {}
		}
		browser.alarms.clear(alarm.name);

		let browserUrl = 'https://lolesports.com/live';

		const { matchId } = nameToMatchAlarm(alarm.name);
		const liveGames = await getLive();
		if (liveGames.success) {
			const liveGame = liveGames.data.data.esports.events.find((e) => e.match?.id === matchId);
			if (liveGame != null) {
				// Prefer the Twitch stream for better autoplay.
				const idealStream =
					getLocaleAwareStream(liveGame.streams, 'twitch') ??
					getLocaleAwareStream(liveGame.streams, 'youtube');
				if (idealStream != null) {
					browserUrl = `https://lolesports.com/live/${liveGame.league.slug}/${idealStream.parameter}`;
				}
			}
		}

		const tab = await browser.tabs.create({
			url: browserUrl,
		});

		browser.storage.session.set({ activeTabId: tab.id });
	});
});
