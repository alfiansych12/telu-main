'use client';

import { useMemo } from 'react';

// MATERIAL - UI
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
// import Box from '@mui/material/Box';

// PROJECT IMPORTS
import Profile from './Profile';
import Localization from './Localization';
import Notification from './Notification';
// import MobileSection from './MobileSection';
// import MegaMenuSection from './MegaMenuSection';

import useConfig from 'hooks/useConfig';
import DrawerHeader from 'layout/DashboardLayout/Drawer/DrawerHeader';

// TYPES
import { MenuOrientation } from 'types/config';
import { Stack } from '@mui/material';
import FullScreen from './FullScreen';

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const { i18n, menuOrientation } = useConfig();

  const downLG = useMediaQuery((theme: Theme) => theme.breakpoints.down('lg'));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const localization = useMemo(() => <Localization />, [i18n]);

  // const megaMenu = useMemo(() => <MegaMenuSection />, []);

  return (
    <Stack direction="row" sx={{ flexGrow: 1, justifyContent: 'space-between', alignItems: 'center' }}>
      <Stack>{menuOrientation === MenuOrientation.HORIZONTAL && !downLG && <DrawerHeader open={true} />}</Stack>
      <Stack direction="row">
        {/* {!downLG && megaMenu} */}
        {localization}
        {/* <Box sx={{ width: '100%', ml: 1 }} /> */}

        {!downLG && <FullScreen />}
        <Notification />
        <Profile />
        {/* {downLG && <MobileSection />} */}
      </Stack>
    </Stack>
  );
};

export default HeaderContent;
