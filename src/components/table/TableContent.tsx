import { Box, Divider } from '@mui/material';
import { Row, RowSelectionState, Table as TableType } from '@tanstack/react-table';
import { TablePagination } from 'components/third-party/react-table';
import SyntaxHighlight from 'utils/SyntaxHighlight';
import { TableContentSkeleton } from 'components/Skeletons';
import { flexRender } from '@tanstack/react-table';
import { Table, TableHead, TableRow, TableBody, TableCell } from '@mui/material';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { tableCellClasses } from '@mui/material/TableCell';
import ScrollX from 'components/ScrollX';
import { HeaderSort, RowSelection } from 'components/third-party/react-table';
import { Fragment, ReactNode } from 'react';

type TableContentProps<TData> = {
  table: TableType<TData>;
  rowSelection?: RowSelectionState;
  isPending?: boolean;
  isServerPagination?: boolean;
  expandedComponent?: (props: { row: Row<TData> }) => ReactNode;
};

export default function TableContent<TData>({
  table,
  isPending,
  isServerPagination,
  rowSelection,
  expandedComponent
}: TableContentProps<TData>) {
  const StyledTableCell = styled(TableCell)(() => ({
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
      lineHeight: 1.2
    }
  }));

  const theme = useTheme();
  const backColor = alpha(theme.palette.primary.lighter, 0.1);
  const rowSelectionLength = rowSelection ? Object.keys(rowSelection).length : 0;
  return (
    <>
      {isPending ? (
        <TableContentSkeleton />
      ) : (
        <>
          <ScrollX>
            <Table>
              <RowSelection total={table.getPreFilteredRowModel().rows.length} selected={rowSelectionLength} />
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell key={header.id} {...header.column.columnDef.meta}>
                        <HeaderSort header={header} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <Fragment key={row.id}>
                      <TableRow>
                        {row.getVisibleCells().map((cell) => (
                          <StyledTableCell key={cell.id} {...cell.column.columnDef.meta}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </StyledTableCell>
                        ))}
                      </TableRow>
                      {row.getIsExpanded() && (
                        <TableRow sx={{ bgcolor: backColor, '&:hover': { bgcolor: `${backColor} !important` }, overflow: 'hidden' }}>
                          <TableCell colSpan={row.getVisibleCells().length} sx={{ p: 2.5, overflow: 'hidden' }}>
                            {expandedComponent && expandedComponent({ row })}
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} sx={{ textAlign: 'center', p: 2 }}>
                      No data found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollX>
          <Divider />
          <Box sx={{ p: 2, width: '100%' }}>
            <TablePagination
              setPageSize={table.setPageSize}
              setPageIndex={table.setPageIndex}
              getState={table.getState}
              getPageCount={table.getPageCount}
              syncWithUrl={isServerPagination}
            />
          </Box>
          {rowSelection && (
            <SyntaxHighlight>
              {JSON.stringify(
                {
                  rowSelection: rowSelection,
                  'rowSelection[].original': table.getSelectedRowModel().rows.map((d: Row<any>) => d.original)
                },
                null,
                2
              )}
            </SyntaxHighlight>
          )}
        </>
      )}
    </>
  );
}
