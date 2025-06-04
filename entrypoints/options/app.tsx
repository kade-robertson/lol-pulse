import { LoadingOutlined } from '@ant-design/icons';
import Button from 'antd/es/button';
import Flex from 'antd/es/flex';
import Image from 'antd/es/image';
import Layout from 'antd/es/layout';
import { Content } from 'antd/es/layout/layout';
import Typography from 'antd/es/typography';
import { useMemo } from 'react';
import AlarmsTable from './alarms';
import LiveGames from './live-games';
import Schedule from './schedule';
import { useApolloConfig } from './use-apollo-client';

enum State {
	NoAPIKey = 0,
	APIKeyLoading = 1,
	APIKeyLoaded = 2,
	APIKeyError = 3,
}

const App = () => {
	const { config, loading, fetchApolloConfig } = useApolloConfig();

	const state: State = useMemo(() => {
		if (config == null) {
			return State.NoAPIKey;
		}
		if (loading) {
			return State.APIKeyLoading;
		}
		return State.APIKeyLoaded;
	}, [config, loading]);

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
				{state === State.APIKeyLoading && (
					<Flex gap="middle" justify="center">
						<div>
							<LoadingOutlined style={{ color: 'white', fontSize: 64 }} />
						</div>
					</Flex>
				)}
				{state === State.APIKeyLoaded && (
					<Flex gap="middle" justify="center">
						<Flex vertical>
							<LiveGames />
							<Schedule />
							<AlarmsTable />
						</Flex>
					</Flex>
				)}
			</Content>
		</Layout>
	);
};

export default App;
