import { Provider, Stream } from './channels/shared-types';

/**
 * The live feed routes (at least, the detail route) only accepts a timestamp that:
 * - is a multiple of 10 seconds
 * - is not considered part of the current window
 * - is at least 45 seconds old
 *
 * This coerces a date to fit these criteria if you are not sure that it will
 * (new Date(), for example.)
 */
export const getRoundedISODate = (date: Date) => {
	const seconds = Math.round((date.getSeconds() - 55) / 10) * 10;
	const roundedDate = new Date(date);
	roundedDate.setSeconds(seconds, 0);
	return roundedDate.toISOString();
};

/**
 * Attempts to find the "best" stream for a particular user for a particular
 * provider. Streams are preferred in order of where their locale falls into
 * the browser's locale list.
 */
export const getLocaleAwareStream = (streams: Stream[], provider: Provider) => {
	const preferredLocales = navigator.languages;
	const orderedStreams = streams.sort((a, b) => {
		const aIndex = preferredLocales.indexOf(a.locale);
		const bIndex = preferredLocales.indexOf(b.locale);
		if (aIndex === -1) {
			return 1;
		}
		if (bIndex === -1) {
			return -1;
		}
		return aIndex - bIndex;
	});
	return orderedStreams.find((s) => s.provider === provider);
};
