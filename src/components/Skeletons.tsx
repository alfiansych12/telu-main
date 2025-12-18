import { TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { InputLabel, Skeleton, Stack, Table } from '@mui/material';
import MainCard from './MainCard';

export const TableOptionsSkeleton = () => {
  return (
    <Stack spacing={1} sx={{ width: '100%' }}>
      <InputLabel>Tahun Akademik</InputLabel>
      <Stack spacing={1} direction="row" sx={{ width: '100%' }}>
        <Skeleton variant="rectangular" sx={{ borderRadius: '8px', width: '200px', height: '40px' }} />
        <Skeleton variant="rectangular" sx={{ borderRadius: '8px', width: '250px', height: '40px' }} />
      </Stack>
    </Stack>
  );
};

export const TableCellSkeleton = () => {
  return (
    <TableCell>
      <Skeleton variant="rectangular" sx={{ borderRadius: '8px', width: '100%', height: '24px' }} />
    </TableCell>
  );
};
export const TableRowSkeleton = () => {
  return (
    <TableRow>
      <TableCellSkeleton />
      <TableCellSkeleton />
      <TableCellSkeleton />
      <TableCellSkeleton />
    </TableRow>
  );
};
export const TableRowPaginationSkeleton = () => {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: 'auto', gap: '10px' }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="caption" color="secondary">
          Row per page
        </Typography>
        <Skeleton variant="rectangular" sx={{ borderRadius: '8px', width: '50px', height: '24px' }} />
      </Stack>
      <Stack direction="row" sx={{ gap: 2 }}>
        <Skeleton variant="rectangular" sx={{ borderRadius: '8px', width: '24px', height: '24px' }} />
        <Skeleton variant="rectangular" sx={{ borderRadius: '8px', width: '24px', height: '24px' }} />
        <Skeleton variant="rectangular" sx={{ borderRadius: '8px', width: '24px', height: '24px' }} />
        <Skeleton variant="rectangular" sx={{ borderRadius: '8px', width: '24px', height: '24px' }} />
      </Stack>
    </Stack>
  );
};

export const TableContentSkeleton = () => {
  return (
    <Table>
      <TableHead>
        <TableRowSkeleton />
      </TableHead>
      <TableBody>
        <TableRowSkeleton />
        <TableRowSkeleton />
        <TableRowSkeleton />
        <TableRowSkeleton />
        <TableRow>
          <TableCell colSpan={4}>
            <TableRowPaginationSkeleton />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};
export const FullTableSkeleton = () => {
  return (
    <MainCard
      title={
        <Stack sx={{ gap: 3 }}>
          <Skeleton variant="rectangular" sx={{ borderRadius: '8px', width: '200px', height: '40px' }} />
          <TableOptionsSkeleton />
        </Stack>
      }
      content={false}
    >
      <TableContentSkeleton />{' '}
    </MainCard>
  );
};
