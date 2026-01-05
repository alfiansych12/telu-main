'use client';

// MATERIAL - UI
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// PROJECT IMPORTS
import DrawerHeaderStyled from './DrawerHeaderStyled';

import Logo from 'components/logo';
import { DRAWER_WIDTH, HEADER_HEIGHT } from 'config';
import useConfig from 'hooks/useConfig';

// TYPES
import { MenuOrientation } from 'types/config';
import { Chip, Stack } from '@mui/material';

// ==============================|| DRAWER HEADER ||============================== //

interface Props {
  open: boolean;
}

const DrawerHeader = ({ open }: Props) => {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));

  const { menuOrientation } = useConfig();
  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  return (
    <DrawerHeaderStyled
      theme={theme}
      open={open}
      sx={{
        minHeight: isHorizontal ? 'unset' : HEADER_HEIGHT,
        width: isHorizontal ? { xs: '100%', lg: DRAWER_WIDTH + 50 } : 'inherit',
        paddingTop: isHorizontal ? { xs: '10px', lg: '0' } : '8px',
        paddingBottom: isHorizontal ? { xs: '18px', lg: '0' } : '8px',
        paddingLeft: isHorizontal ? { xs: '24px', lg: '0' } : open ? '24px' : 0
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        sx={{
          flexGrow: 1,
          display: { xs: 'none', md: 'flex' }
        }}
      >
        <Logo isIcon={!open} sx={{ width: open ? 'auto' : 52, height: 'auto' }} />
        {open && (
          <Chip
            label={`v${process.env.NEXT_PUBLIC_NEXT_APP_VERSION}`}
            variant="outlined"
            size="small"
            color="secondary"
            sx={{ ml: 1, fontSize: '0.725rem', height: 20, '& .MuiChip-label': { px: 0.5 } }}
          />
        )}
      </Stack>
    </DrawerHeaderStyled>
  );
};

export default DrawerHeader;
