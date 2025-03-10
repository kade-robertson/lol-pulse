import type { MatchAlarm } from '@/shared/alarms';
import Button from 'antd/es/button';
import Flex from 'antd/es/flex';
import Table from 'antd/es/table';
import type { ColumnType } from 'antd/es/table';
import Title from 'antd/es/typography/Title';
import { useContext } from 'react';
import ClearAlarmButton from './clear-alarm-button';
import { AlarmContext } from './contexts/alarm-ctx';

const TABLE_COLUMNS: ColumnType<MatchAlarm>[] = [
	{
		title: 'Time',
		dataIndex: 'time',
		key: 'time',
		render: (time: Date) =>
			time.toLocaleString(undefined, {
				dateStyle: 'long',
				timeStyle: 'short',
			}),
		sorter: (a, b) => {
			return a.time.getTime() - b.time.getTime();
		},
		defaultSortOrder: 'ascend',
	},
	{
		title: 'League',
		dataIndex: 'league',
		key: 'league',
		render: (league: string) => <span>{league}</span>,
	},
	{
		title: 'Name',
		dataIndex: 'name',
		key: 'name',
		render: (name: string) => <span>{name}</span>,
	},
	{
		title: 'Clear',
		key: 'clear',
		render: (_, record) => {
			return <ClearAlarmButton match={record} />;
		},
	},
];

const AlarmsTable = () => {
	const { alarms, clearAlarms } = useContext(AlarmContext);

	return (
		<Table
			bordered
			dataSource={alarms}
			columns={TABLE_COLUMNS}
			title={() => (
				<Flex justify="space-between">
					<Title level={4} style={{ marginBottom: 0 }}>
						Alarms
					</Title>
					<Button danger onClick={() => clearAlarms()}>
						Clear All
					</Button>
				</Flex>
			)}
		/>
	);
};

export default AlarmsTable;
