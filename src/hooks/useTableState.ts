import { useState } from 'react';
import {
  SortingState,
  RowSelectionState,
  PaginationState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef
} from '@tanstack/react-table';

type UseTableProps<TData> = {
  data: TData[] | [];
  columns: ColumnDef<TData, any>[];
  totalData?: number;
  isServerPagination?: boolean;
  autoResetPageIndex?: boolean;
};

export const useTableState = <TData>({
  data,
  columns,
  totalData,
  isServerPagination,
  autoResetPageIndex = false
}: UseTableProps<TData>) => {
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: {
      globalFilter,
      sorting,
      rowSelection,
      pagination
    },
    rowCount: totalData,
    manualPagination: isServerPagination,
    manualFiltering: isServerPagination,
    autoResetPageIndex: autoResetPageIndex,
    getRowId: (row) => (row as any).id,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: isServerPagination ? undefined : getFilteredRowModel(),
    getPaginationRowModel: isServerPagination ? undefined : getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onPaginationChange: setPagination
  });

  return { table, globalFilter, setGlobalFilter, sorting, setSorting, rowSelection, setRowSelection, pagination, setPagination };
};
