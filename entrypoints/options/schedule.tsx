import type { ColumnDef, SortDirection } from '@tanstack/react-table';
import { AlertCircleIcon, ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { GetScheduleChannel, type Event as GetScheduleEvent } from '@/shared/channels/get-schedule';
import type { League, Strategy } from '@/shared/channels/shared-types';
import { Alert, AlertTitle } from '@/ui/components/ui/alert';
import { Button } from '@/ui/components/ui/button';
import { DataTable } from '@/ui/components/ui/data-table';
import AddAlarmButton from './add-alarm-button';
import HiddenItem from './hidden';
import { LeagueSelector } from './league-selector';
import TeamWithIcon from './team-with-icon';
import { useFetch } from './use-fetch';

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

const ArrowIcon = (dir: SortDirection | false) => {
	if (dir === false) {
		return ArrowUpDown;
	}
	if (dir === 'asc') {
		return ArrowUp;
	}
	return ArrowDown;
};

const TABLE_COLUMNS: ColumnDef<GetScheduleEvent>[] = [
	{
		header: ({ column }) => {
			const Icon = ArrowIcon(column.getIsSorted());
			return (
				<Button
					variant="ghost"
					className="w-full justify-between"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Start Time
					{<Icon className="ml-2 h-4 w-4" />}
				</Button>
			);
		},
		minSize: 225,
		accessorKey: 'startTime',
		cell: ({ row }) =>
			new Date(row.getValue('startTime')).toLocaleString(undefined, {
				dateStyle: 'long',
				timeStyle: 'short',
			}),
		invertSorting: false,
	},
	{
		header: 'Team 1',
		maxSize: 80,
		accessorFn: (row) => row.matchTeams[0],
		cell: ({ row }) => {
			return <TeamWithIcon team={row.original.matchTeams[0]} />;
		},
	},
	{
		header: 'vs',
		size: 40,
		enableResizing: false,
		cell: () => <span>vs</span>,
		meta: {
			textAlign: 'center',
		},
	},
	{
		header: 'Team 2',
		maxSize: 80,
		accessorFn: (row) => row.matchTeams[1],
		cell: ({ row }) => <TeamWithIcon team={row.original.matchTeams[1]} />,
	},
	{
		header: 'Style',
		maxSize: 80,
		accessorFn: (row) => row.match.strategy,
		cell: ({ row }) => <span>{strategyToText(row.original.match.strategy)}</span>,
		meta: {
			textAlign: 'center',
		},
	},
	{
		header: 'Status',
		accessorKey: 'state',
		maxSize: 100,
	},
	{
		header: 'Winner',
		maxSize: 80,
		cell: ({ row }) => {
			const match = row.original.match;
			const winner = row.original.matchTeams.find((t) => t.result?.outcome === 'win');
			if (winner != null) {
				return (
					<HiddenItem key={`outcome-${match.id}`}>
						<TeamWithIcon team={winner} />
					</HiddenItem>
				);
			}
			const tie = row.original.matchTeams.every((t) => t.result?.outcome === 'tie');
			if (tie) {
				return (
					<HiddenItem key={`outcome-${match.id}`}>
						<span>Tie</span>
					</HiddenItem>
				);
			}
		},
	},
	{
		header: 'Alarm',
		enableResizing: false,
		size: 100,
		cell: ({ row }) => <AddAlarmButton record={row.original} />,
	},
];

const Schedule = () => {
	const { loading, data, error, fetch } = useFetch(GetScheduleChannel);
	const [league, setLeague] = useState<League | undefined>(undefined);
	const schedule = useMemo(
		() =>
			(data?.data.esports.events ?? []).toSorted(
				(a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
			),
		[data],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: intentional
	useEffect(() => {
		if (league != null) {
			fetch({ leagueId: league.id });
		}
	}, [league?.id]);

	useEffect(() => {
		if (error != null) {
			console.error(error);
		}
	}, [error]);

	return error == null ? (
		<div>
			<div className="flex items-center justify-between mb-2">
				<h2 className="text-2xl font-semibold tracking-tight">Schedule</h2>
				<LeagueSelector onLeagueSelected={setLeague} />
			</div>
			<DataTable data={schedule} loading={loading} columns={TABLE_COLUMNS} />
		</div>
	) : (
		<Alert variant="destructive">
			<AlertCircleIcon />
			<AlertTitle>Error loading league schedule.</AlertTitle>
		</Alert>
	);
};

export default Schedule;
