import { GetSchedule, GetScheduleChannel } from '@/shared/channels';
import { League, Strategy } from '@/shared/channels/shared-types';
import { ColumnType } from 'antd/es/table';
import Table from 'antd/es/table/Table';
import Title from 'antd/es/typography/Title';
import { useEffect } from 'react';
import AddAlarmButton from './add-alarm-button';
import HiddenItem from './hidden';
import TeamWithIcon from './team-with-icon';
import { useFetch } from './use-fetch';
import { Alert } from 'antd';

const strategyToText = (strategy: Strategy) => {
	switch (strategy.type) {
		case 'bestOf':
			return `BO${strategy.count}`;
		case 'playAll':
			return `PA${strategy.count}`;
		default:
			return `${strategy.type}${strategy.count}`;
	}
};

const TABLE_COLUMNS: ColumnType<GetSchedule.Event>[] = [
	{
		title: 'Start Time',
		dataIndex: 'startTime',
		key: 'startTime',
		render: (startTime: string) =>
			new Date(startTime).toLocaleString(undefined, {
				dateStyle: 'long',
				timeStyle: 'short',
			}),
		sorter: (a, b) => {
			return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
		},
		defaultSortOrder: 'descend',
	},
	{
		title: 'Team 1',
		dataIndex: ['match', 'teams', 0],
		key: 'team1',
		render: (team: GetSchedule.Team) => <TeamWithIcon team={team} />,
		width: 1,
	},
	{
		title: 'vs',
		dataIndex: 'match',
		key: 'vs',
		render: () => <span>vs</span>,
		width: 1,
		align: 'center',
	},
	{
		title: 'Team 2',
		dataIndex: ['match', 'teams', 1],
		key: 'team2',
		render: (team: GetSchedule.Team) => <TeamWithIcon team={team} />,
		width: 1,
	},
	{
		title: 'Style',
		dataIndex: ['match', 'strategy'],
		key: 'style',
		render: (strategy: Strategy) => <span>{strategyToText(strategy)}</span>,
		width: 1,
		align: 'center',
	},
	{
		title: 'Status',
		dataIndex: 'state',
		key: 'state',
		render: (state: string) => <span>{state}</span>,
		width: 1,
	},
	{
		title: 'Winner',
		key: 'winner',
		render: (_, record) => {
			const winner = record.match.teams.find((t) => t.result?.outcome === 'win');
			if (winner != null) {
				return (
					<HiddenItem key={`outcome-${record.match.id}`}>
						<TeamWithIcon team={winner} />
					</HiddenItem>
				);
			}
			const tie = record.match.teams.every((t) => t.result?.outcome === 'tie');
			if (tie) {
				return (
					<HiddenItem key={`outcome-${record.match.id}`}>
						<span>Tie</span>
					</HiddenItem>
				);
			}
		},
	},
	{
		title: 'Alarm',
		key: 'alarm',
		render(_, record) {
			return <AddAlarmButton record={record} />;
		},
	},
];

const Schedule = ({ league }: { league: League }) => {
	const { loading, data, error, fetch } = useFetch(GetScheduleChannel);
	const schedule = data?.data.schedule.events ?? [];

	useEffect(() => {
		fetch({ leagueId: league.id });
	}, [league.id]);

	useEffect(() => {
		if (error != null) {
			console.error(error);
		}
	}, [error]);

	return error == null ? (
		<Table
			dataSource={schedule}
			columns={TABLE_COLUMNS}
			rowKey={(r) => r.match.id}
			loading={loading}
			title={() => (
				<Title level={4} style={{ marginBottom: 0 }}>
					Schedule
				</Title>
			)}
		/>
	) : (
		<Alert
			message="Error loading league schedule."
			type="error"
			showIcon
			style={{ marginBottom: '1em' }}
		/>
	);
};

export default Schedule;
