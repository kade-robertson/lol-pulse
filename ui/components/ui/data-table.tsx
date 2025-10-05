import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type SortingState,
	useReactTable,
} from '@tanstack/react-table';
import { type ReactNode, useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from '@/ui/components/ui/table';
import { DataTablePagination } from './data-table-pagination';

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	loading?: boolean;
	footer?: ReactNode;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	loading,
	footer,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		state: {
			sorting,
		},
	});

	return (
		<div>
			<div className="rounded-md border">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											style={{
												width: header.column.getSize(),
												// biome-ignore lint/suspicious/noExplicitAny: table sucks
												textAlign: (header.column.columnDef.meta as any)?.textAlign,
											}}
										>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody className={loading ? 'blur-xs' : undefined}>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
									{row.getVisibleCells().map((cell) => (
										// biome-ignore lint/suspicious/noExplicitAny: table sucks
										<TableCell key={cell.id} align={(cell.column.columnDef.meta as any)?.textAlign}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className="h-24 text-center">
									No results
								</TableCell>
							</TableRow>
						)}
					</TableBody>
					{footer ? <TableFooter>{footer}</TableFooter> : null}
				</Table>
			</div>
			<DataTablePagination table={table} />
		</div>
	);
}
