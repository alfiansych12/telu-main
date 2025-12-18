import { Box } from '@mui/material';
import { Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { Column, flexRender, Header } from '@tanstack/react-table';
import { ArrowDown2, ArrowUp2 } from 'iconsax-react';

interface HeaderSortProps {
  header: Header<any, unknown>;
}

export const HeaderSort = ({ header }: HeaderSortProps) => {
  const theme = useTheme();
  const { getToggleSortingHandler, getIsSorted, getCanSort } = header.column as Column<any, unknown>;

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{ width: 'max-content' }}>{flexRender(header.column.columnDef.header, header.getContext())}</Box>

      {getCanSort() && (
        <Stack onClick={getToggleSortingHandler()} sx={{ color: 'secondary.light', cursor: 'pointer' }}>
          <ArrowUp2
            size={16}
            variant="Bold"
            style={{
              color: getIsSorted() === 'asc' ? theme.palette.secondary.main : 'inherit'
            }}
          />
          <ArrowDown2
            size={16}
            variant="Bold"
            style={{
              marginTop: -8,
              color: getIsSorted() === 'desc' ? theme.palette.secondary.main : 'inherit'
            }}
          />
        </Stack>
      )}
    </Stack>
  );
};

export default HeaderSort;
