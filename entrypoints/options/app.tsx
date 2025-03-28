import { GetLeaguesChannel } from '@/shared/channels/get-leagues';
import type { League } from '@/shared/channels/shared-types';
import { LoadingOutlined } from '@ant-design/icons';
import Alert from 'antd/es/alert';
import Button from 'antd/es/button';
import Flex from 'antd/es/flex';
import Image from 'antd/es/image';
import Layout from 'antd/es/layout';
import { Content } from 'antd/es/layout/layout';
import List from 'antd/es/list';
import Typography from 'antd/es/typography';
import { useEffect, useMemo, useState } from 'react';
import AlarmsTable from './alarms';
import LiveGames from './live-games';
import Schedule from './schedule';
import { useApolloConfig } from './use-apollo-client';
import { useFetch } from './use-fetch';

enum State {
	NoAPIKey = 0,
	APIKeyLoading = 1,
	APIKeyLoaded = 2,
	APIKeyError = 3,
}

const App = () => {
	const { config, fetchApolloConfig } = useApolloConfig();
	const { loading, data, error, fetch } = useFetch(GetLeaguesChannel);
	const [selectedLeague, setSelectedLeague] = useState<League | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional
	useEffect(() => {
		fetch();
	}, [config]);

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
		if (config == null) {
			return State.NoAPIKey;
		}
		if (loading) {
			return State.APIKeyLoading;
		}
		if (error != null) {
			return State.APIKeyError;
		}
		return State.APIKeyLoaded;
	}, [config, loading, error]);

	return (
		<Layout>
			<Content style={{ minHeight: '100vh', padding: '1em' }}>
				<Flex gap="middle" justify="center" align="center" vertical>
					<Flex gap="middle" justify="center" align="center" style={{ marginBottom: '1em' }}>
						<Image width={64} preview={false} src="/icon-128.png" />
						<Typography.Title style={{ margin: 0, padding: 0 }}>LoL Pulse</Typography.Title>
					</Flex>
					{state === State.NoAPIKey && (
						<Flex
							vertical
							gap="middle"
							justify="center"
							align="center"
							style={{ marginBottom: '1em', maxWidth: '50%' }}
						>
							<Typography.Text italic style={{ textAlign: 'center' }}>
								LoL Pulse requires additional information to load. This may take some time. You will
								automatically be returned to this tab when possible.
							</Typography.Text>
							<Button onClick={fetchApolloConfig}>Load Additional Information</Button>
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
