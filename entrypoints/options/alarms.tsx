import type { MatchAlarm } from '@/shared/alarms';
import { Button } from '@/ui/components/ui/button';
import { DataTable } from '@/ui/components/ui/data-table';
import { TableCell, TableRow } from '@/ui/components/ui/table';
import type { ColumnDef, SortDirection } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useContext } from 'react';
import ClearAlarmButton from './clear-alarm-button';
import { AlarmContext } from './contexts/alarm-ctx';

const ArrowIcon = (dir: SortDirection | false) => {
	if (dir === false) {
		return ArrowUpDown;
	}
	if (dir === 'asc') {
		return ArrowUp;
	}
	return ArrowDown;
};

const TABLE_COLUMNS: ColumnDef<MatchAlarm, MatchAlarm>[] = [
	{
		header: ({ column }) => {
			const Icon = ArrowIcon(column.getIsSorted());
			return (
				<Button
					variant="ghost"
					className="w-full justify-between"
					onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
				>
					Time
					{<Icon className="ml-2 h-4 w-4" />}
				</Button>
			);
		},
		accessorKey: 'time',
		cell: ({ row }) => {
			return (row.getValue('time') as MatchAlarm['time']).toLocaleString(undefined, {
				dateStyle: 'long',
				timeStyle: 'short',
			});
		},
	},
	{
		header: 'League',
		accessorKey: 'league',
		cell: (c) => c.renderValue(),
	},
	{
		header: 'Name',
		accessorKey: 'name',
		cell: (c) => c.renderValue(),
	},
	{
		header: 'Clear',
		size: 80,
		enableResizing: false,
		cell: ({ row }) => {
			return <ClearAlarmButton match={row.original} />;
		},
	},
];

const AlarmsTable = () => {
	const { alarms, clearAlarms } = useContext(AlarmContext);

	return (
		<div className="flex flex-col gap-2">
			<DataTable
				data={alarms}
				columns={TABLE_COLUMNS}
				footer={
					<TableRow>
						<TableCell colSpan={3} />
						<TableCell className="text-right">
							<Button
								size="xs"
								variant="destructive"
								className="w-full"
								onClick={() => clearAlarms()}
								disabled={alarms.length === 0}
							>
								Clear All
							</Button>
						</TableCell>
					</TableRow>
				}
			/>
		</div>
	);

	/* return (
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
	); */
};

export default AlarmsTable;
