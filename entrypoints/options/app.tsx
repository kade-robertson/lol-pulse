import { GetLeaguesChannel, GetLeagues } from '@/shared/channels';
import { Button, Flex, Layout, List, Typography, Image } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useEffect, useState } from 'react';
import { useApiKey } from './use-api-key';
import Schedule from './schedule';
import AlarmsTable from './alarms';

const App = () => {
	const { apiKey, fetchApiKey } = useApiKey();
	const [leagues, setLeagues] = useState<GetLeagues.League[]>([]);
	const [selectedLeague, setSelectedLeague] = useState<GetLeagues.League | null>(null); // [1

	useEffect(() => {
		GetLeaguesChannel.send().then((res) => setLeagues(res.data.leagues));
	}, [apiKey]);

	useEffect(() => {
		if (selectedLeague == null && leagues.length > 0) {
			setSelectedLeague(leagues[0]);
		}
	}, [leagues, selectedLeague]);

	const hasApiKey = apiKey != '';

	return (
		<Layout>
			<Content style={{ minHeight: '100vh', padding: '1em' }}>
				<Flex gap="middle" justify="center" align="center" vertical>
					<Flex gap="middle" justify="center" align="center" style={{ marginBottom: '1em' }}>
						<Image width={64} preview={false} src="/icon-128.png" />
						<Typography.Title style={{ margin: 0, padding: 0 }}>LoL Pulse</Typography.Title>
					</Flex>
					{!hasApiKey && (
						<Flex gap="middle" justify="center" align="center" style={{ marginBottom: '1em' }}>
							<Typography.Text italic>LoL Pulse requires an API key to load.</Typography.Text>
							<Button onClick={fetchApiKey}>Load API Key</Button>
						</Flex>
					)}
				</Flex>
				{hasApiKey && (
					<Flex gap="middle" justify="center">
						<List
							size="small"
							bordered
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
