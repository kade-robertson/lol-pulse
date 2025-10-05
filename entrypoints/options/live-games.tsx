import { AlertCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { GetLiveChannel } from '@/shared/channels/get-live';
import { getLocaleAwareStream } from '@/shared/utils';
import { Alert, AlertTitle } from '@/ui/components/ui/alert';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/ui/components/ui/alert-dialog';
import { useFetch } from './use-fetch';

const TWO_MINUTES_MS = 1000 * 60 * 2;

const LiveIcon = () => (
	<svg width={20} height={20} viewBox="0 0 24 24">
		<circle fill="#ff0000" stroke="none" cx="12" cy="12" r="12">
			<animate
				attributeName="opacity"
				dur="2s"
				values="0;1;0"
				repeatCount="indefinite"
				begin="0.1"
			/>
		</circle>
	</svg>
);

const TwitchLogo = ({ channel }: { channel: string }) => (
	<AlertDialog>
		<AlertDialogTrigger>
			<img alt="twitch" width={24} height={24} src="https://cdn.simpleicons.org/twitch/white" />
		</AlertDialogTrigger>
		<AlertDialogContent>
			<AlertDialogTitle>Watch on Twitch?</AlertDialogTitle>
			<AlertDialogFooter>
				<AlertDialogCancel>No</AlertDialogCancel>
				<AlertDialogAction
					onClick={() =>
						browser.tabs.create({
							url: `https://twitch.tv/${channel}`,
						})
					}
				>
					Yes
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
);

interface LoLEsportsOptions {
	slug: string;
	preferredStream?: string;
}

const LoLEsportsLogo = ({ slug, preferredStream }: LoLEsportsOptions) => (
	<AlertDialog>
		<AlertDialogTrigger>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 425 425"
				focusable={false}
			>
				<path
					fill="#FAFAFA"
					d="M94.73,94.85h94.12V47.37h-73c-37.83,0-68.49,30.74-68.49,68.66v73.17h47.37V94.85z M179.04,212.94     l-84.31,84.51v-60.77H47.37v141.83h141.49v-47.48h-60.63l84.31-84.52L179.04,212.94z M330.34,331.03h-94.12v47.48h73     c37.83,0,68.49-30.74,68.49-68.66v-73.17h-47.37V331.03z M236.22,47.37v47.48h60.63l-84.31,84.52l33.49,33.57l84.31-84.52v60.77     h47.37V47.37H236.22z"
				/>
			</svg>
		</AlertDialogTrigger>
		<AlertDialogContent>
			<AlertDialogTitle>Watch on LoL Esports?</AlertDialogTitle>
			<AlertDialogFooter>
				<AlertDialogCancel>No</AlertDialogCancel>
				<AlertDialogAction
					onClick={() =>
						browser.tabs.create({
							url: `https://lolesports.com/live/${slug}${preferredStream ? `/${preferredStream}` : ''}`,
						})
					}
				>
					Yes
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
);

const YoutubeLogo = ({ videoId }: { videoId: string }) => (
	<AlertDialog>
		<AlertDialogTrigger>
			<img alt="youtube" width={24} height={24} src="https://cdn.simpleicons.org/youtube/white" />
		</AlertDialogTrigger>
		<AlertDialogContent>
			<AlertDialogTitle>Watch on YouTube?</AlertDialogTitle>

			<AlertDialogFooter>
				<AlertDialogCancel>No</AlertDialogCancel>
				<AlertDialogAction
					onClick={() =>
						browser.tabs.create({
							url: `https://youtube.com/watch?v=${videoId}`,
						})
					}
				>
					Yes
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
);

const MessageText = ({ children }: { children: React.ReactNode }) => (
	<div className="text-lg font-semibold">{children}</div>
);

const LiveGames = () => {
	const { loading, data, error, fetch } = useFetch(GetLiveChannel);
	const [refetchInterval, setRefetchInterval] = useState<NodeJS.Timeout | null>(null);
	const games = data?.data.esports.events ?? [];

	// biome-ignore lint/correctness/useExhaustiveDependencies: these should only update on load
	useEffect(() => {
		fetch();
		setRefetchInterval(
			setInterval(() => {
				fetch();
			}, TWO_MINUTES_MS),
		);
		return () => {
			if (refetchInterval != null) {
				clearInterval(refetchInterval);
			}
		};
	}, []);

	useEffect(() => {
		if (error != null) {
			console.error(error);
		}
	}, [error]);

	return (
		<div className="flex flex-col gap-2 mb-2">
			{error == null ? (
				games
					.filter((g) => g.streams.length > 0)
					.map((g) => {
						const teamA = g.match?.matchTeams[0];
						const teamB = g.match?.matchTeams[1];

						const twitchLivestream = getLocaleAwareStream(g.streams, 'twitch');
						const youtubeLivestream = getLocaleAwareStream(g.streams, 'youtube');

						return (
							<div className="border rounded-md p-2" key={g.id}>
								<div className="flex justify-between">
									<div className="flex items-center gap-2">
										<LiveIcon />
										<MessageText>Live: {g.league.name}</MessageText>
										{teamA != null && teamB != null && (
											<>
												<MessageText> - </MessageText>
												<div className="flex items-center gap-2">
													<img alt="teamb" src={teamA.image} width={24} height={24} />
													<MessageText>{teamA.code}</MessageText>
												</div>
												<MessageText>vs.</MessageText>
												<div className="flex items-center gap-2">
													<img alt="teamb" src={teamB.image} width={24} height={24} />
													<MessageText>{teamB.code}</MessageText>
												</div>
											</>
										)}
									</div>
									<div className="flex items-center gap-2">
										<LoLEsportsLogo
											slug={g.league.slug}
											preferredStream={twitchLivestream?.parameter ?? youtubeLivestream?.parameter}
										/>
										{youtubeLivestream != null && (
											<YoutubeLogo videoId={youtubeLivestream.parameter} />
										)}
										{twitchLivestream != null && (
											<TwitchLogo channel={twitchLivestream.parameter} />
										)}
									</div>
								</div>
							</div>
						);
					})
			) : (
				<Alert variant="destructive">
					<AlertCircleIcon />
					<AlertTitle>Failed to load live games.</AlertTitle>
				</Alert>
			)}
		</div>
	);
};

export default LiveGames;
