import { GetLiveChannel } from '@/shared/channels';
import { getLocaleAwareStream } from '@/shared/utils';
import { YoutubeFilled } from '@ant-design/icons';
import { Alert, Flex, Image, Popconfirm, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useFetch } from './use-fetch';

const TWO_MINUTES_MS = 1000 * 60 * 2;

const LiveIcon = () => (
	<svg width={24} height={24} viewBox="0 0 24 24">
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
	<Popconfirm
		title={'Watch on Twitch?'}
		onConfirm={() =>
			browser.tabs.create({
				url: `https://twitch.tv/${channel}`,
			})
		}>
		<span role="img" className="anticon" tabIndex={-1} aria-label="twitch">
			<svg
				height="24"
				viewBox="0 0 256 268"
				version="1.1"
				preserveAspectRatio="xMidYMid"
				focusable={false}>
				<g>
					<path
						d="M17.4579119,0 L0,46.5559188 L0,232.757287 L63.9826001,232.757287 L63.9826001,267.690956 L98.9144853,267.690956 L133.811571,232.757287 L186.171922,232.757287 L256,162.954193 L256,0 L17.4579119,0 Z M40.7166868,23.2632364 L232.73141,23.2632364 L232.73141,151.29179 L191.992415,192.033461 L128,192.033461 L93.11273,226.918947 L93.11273,192.033461 L40.7166868,192.033461 L40.7166868,23.2632364 Z M104.724985,139.668381 L127.999822,139.668381 L127.999822,69.843872 L104.724985,69.843872 L104.724985,139.668381 Z M168.721862,139.668381 L191.992237,139.668381 L191.992237,69.843872 L168.721862,69.843872 L168.721862,139.668381 Z"
						fill="#5A3E85"></path>
				</g>
			</svg>
		</span>
	</Popconfirm>
);

const LoLEsportsLogo = ({ slug }: { slug: string }) => (
	<Popconfirm
		title={'Watch on LoL Esports?'}
		onConfirm={() => browser.tabs.create({ url: `https://lolesports.com/live/${slug}` })}>
		<span role="img" className="anticon" tabIndex={-1} aria-label="LoL Esports">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 425 425"
				focusable={false}>
				<path
					fill="#FAFAFA"
					d="M94.73,94.85h94.12V47.37h-73c-37.83,0-68.49,30.74-68.49,68.66v73.17h47.37V94.85z M179.04,212.94     l-84.31,84.51v-60.77H47.37v141.83h141.49v-47.48h-60.63l84.31-84.52L179.04,212.94z M330.34,331.03h-94.12v47.48h73     c37.83,0,68.49-30.74,68.49-68.66v-73.17h-47.37V331.03z M236.22,47.37v47.48h60.63l-84.31,84.52l33.49,33.57l84.31-84.52v60.77     h47.37V47.37H236.22z"></path>
			</svg>
		</span>
	</Popconfirm>
);

const MessageText = ({ children }: { children: React.ReactNode }) => (
	<Typography.Title level={3} style={{ marginBottom: 0 }}>
		{children}
	</Typography.Title>
);

const LiveGames = () => {
	const { loading, data, error, fetch } = useFetch(GetLiveChannel);
	const [refetchInterval, setRefetchInterval] = useState<NodeJS.Timeout | null>(null);
	const games = data?.data.schedule.events ?? [];

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
		<Flex vertical gap="middle" style={{ marginBottom: '1em' }}>
			{error == null ? (
				games.map((g) => {
					const teamA = g.match.teams[0];
					const teamB = g.match.teams[1];

					const twitchLivestream = getLocaleAwareStream(g.streams, 'twitch');
					const youtubeLivestream = getLocaleAwareStream(g.streams, 'youtube');

					return (
						<Alert
							message={
								<Flex justify="space-between">
									<Flex align="center" gap="0.5em">
										<LiveIcon />
										<MessageText>
											Live: {g.league.name} {g.blockName} -
										</MessageText>
										<Flex align="center" gap="0.5em">
											<Image src={teamA.image} width={24} height={24} preview={false} />
											<MessageText>{teamA.code}</MessageText>
										</Flex>
										<MessageText>vs.</MessageText>
										<Flex align="center" gap="0.5em">
											<Image src={teamB.image} width={24} height={24} preview={false} />
											<MessageText>{teamB.code}</MessageText>
										</Flex>
									</Flex>
									<Flex align="center" gap="0.5em">
										<LoLEsportsLogo slug={g.league.slug} />
										{youtubeLivestream != null && (
											<Popconfirm
												title={'Watch on YouTube?'}
												onConfirm={() =>
													browser.tabs.create({
														url: `https://youtube.com/watch?v=${youtubeLivestream.parameter}`,
													})
												}>
												<YoutubeFilled
													width={24}
													height={24}
													style={{ color: 'red', fontSize: '24px' }}
												/>
											</Popconfirm>
										)}
										{twitchLivestream != null && (
											<TwitchLogo channel={twitchLivestream.parameter} />
										)}
									</Flex>
								</Flex>
							}
							key={g.id}
							type="info"
						/>
					);
				})
			) : (
				<Alert message="Failed to load live games." type="error" />
			)}
		</Flex>
	);
};

export default LiveGames;
