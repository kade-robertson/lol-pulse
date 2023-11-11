import { GetLeaguesChannel } from '@/shared/channels';
import { League } from '@/shared/channels/shared-types';
import { Alert, Button, Flex, Image, Layout, List, Skeleton, Typography } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useEffect, useMemo, useState } from 'react';
import AlarmsTable from './alarms';
import Schedule from './schedule';
import { useApiKey } from './use-api-key';
import { useFetch } from './use-fetch';
import LiveGames from './live-games';
import { LoadingOutlined } from '@ant-design/icons';

enum State {
	NoAPIKey,
	APIKeyLoading,
	APIKeyLoaded,
	APIKeyError,
}

const App = () => {
	const { apiKey, fetchApiKey } = useApiKey();
	const { loading, data, error, fetch } = useFetch(GetLeaguesChannel);
	const [selectedLeague, setSelectedLeague] = useState<League | null>(null);

	useEffect(() => {
		fetch();
	}, [apiKey]);

	const leagues = data?.data.leagues ?? [];

	useEffect(() => {
		if (selectedLeague == null && leagues.length > 0) {
			setSelectedLeague(leagues[0]);
		}
	}, [leagues, selectedLeague]);

	useEffect(() => {
		if (error != null) {
			console.error(error);
		}
	}, [error]);

	const state: State = useMemo(() => {
		if (apiKey == null || apiKey === '') {
			return State.NoAPIKey;
		} else if (loading) {
			return State.APIKeyLoading;
		} else if (error != null) {
			return State.APIKeyError;
		} else {
			return State.APIKeyLoaded;
		}
	}, [apiKey, loading, error]);

	return (
		<Layout>
			<Content style={{ minHeight: '100vh', padding: '1em' }}>
				<Flex gap="middle" justify="center" align="center" vertical>
					<Flex gap="middle" justify="center" align="center" style={{ marginBottom: '1em' }}>
						<Image width={64} preview={false} src="/icon-128.png" />
						<Typography.Title style={{ margin: 0, padding: 0 }}>LoL Pulse</Typography.Title>
					</Flex>
					{state === State.NoAPIKey && (
						<Flex gap="middle" justify="center" align="center" style={{ marginBottom: '1em' }}>
							<Typography.Text italic>LoL Pulse requires an API key to load.</Typography.Text>
							<Button onClick={fetchApiKey}>Load API Key</Button>
						</Flex>
					)}
				</Flex>
				{state === State.APIKeyError && <Alert message="Could not load data." type="error" />}
				{state === State.APIKeyLoading && (
					<Flex gap="middle" justify="center">
						<div>
							<LoadingOutlined style={{ color: 'white', fontSize: 64 }} />
						</div>
					</Flex>
				)}
				{state === State.APIKeyLoaded && (
					<Flex gap="middle" justify="center">
						<List
							size="small"
							bordered
							loading={loading}
							dataSource={leagues}
							renderItem={(item) => (
								<List.Item>
									<Typography.Text>{item.name}</Typography.Text>
									<Button onClick={() => setSelectedLeague(item)} type="link" size="small">
										View
									</Button>
								</List.Item>
							)}
						/>
						<Flex vertical>
							<LiveGames />
							{selectedLeague && <Schedule league={selectedLeague} />}
							<AlarmsTable />
						</Flex>
					</Flex>
				)}
			</Content>
		</Layout>
	);
};

export default App;
