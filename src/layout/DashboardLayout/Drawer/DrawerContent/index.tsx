'use client';
// PROJECT IMPORTS
import Navigation from './Navigation';
import SimpleBar from 'components/third-party/SimpleBar';
import NavUser from './NavUser';
import Profile from './Profile';
import { useGetMenuMaster } from 'api/menu';
import Search from './Search';

// ==============================|| DRAWER CONTENT ||============================== //

const DrawerContent = () => {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  return (
    <>
      <Profile />
      {drawerOpen && <Search />}
      <SimpleBar sx={{ '& .simplebar-content': { display: 'flex', flexDirection: 'column' } }}>
        <Navigation />
      </SimpleBar>
      {drawerOpen && <NavUser />}
    </>
  );
};

export default DrawerContent;
