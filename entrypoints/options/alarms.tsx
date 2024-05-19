import { MatchAlarm, clearAlarm, getAlarms } from '@/shared/alarms';
import { Button, Flex, Table } from 'antd';
import { ColumnType } from 'antd/es/table';
import { useContext, useEffect, useState } from 'react';
import { AlarmContext } from './contexts/alarm-ctx';
import ClearAlarmButton from './clear-alarm-button';
import Title from 'antd/es/typography/Title';

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
