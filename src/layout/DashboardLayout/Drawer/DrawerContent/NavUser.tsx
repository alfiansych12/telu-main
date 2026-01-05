'use client';
// material-ui
// import IconButton from '@mui/material/IconButton';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemAvatar from '@mui/material/ListItemAvatar';
// import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';

// project-imports
import { useGetMenuMaster } from 'api/menu';
// import Avatar from 'components/@extended/Avatar';
// import useUser from 'hooks/useUser';

// assets
import { Button, Tooltip } from '@mui/material';
import { Logout } from 'iconsax-react';
import { handleLogout } from 'utils/client-actions';

// const avatar1 = '/assets/images/users/avatar-1.png';

// ==============================|| LIST - USER ||============================== //

export default function NavUser() {
  // const user = useUser();

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  return (
    <Box
      sx={{
        p: 1.25,
        px: !drawerOpen ? 1.25 : 3,
        borderTop: '2px solid ',
        borderTopColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >
      {/* <List disablePadding>
        <ListItem
          disablePadding
          sx={{
            ...(!drawerOpen && { display: 'flex', justifyContent: 'flex-end' }),
            '& .MuiListItemSecondaryAction-root': { right: !drawerOpen ? 16 : -16 }
          }}
        >
          <ListItemAvatar>
            <Avatar alt="Avatar" src={avatar1} sx={{ ...(drawerOpen && { width: 46, height: 46 }) }} />
          </ListItemAvatar>
          <ListItemText
            primary={user ? user?.username : ''}
            sx={{ ...(!drawerOpen && { display: 'none' }) }}
            secondary={user ? user?.role : ''}
          />
        </ListItem>
      </List> */}
      {/* <Tooltip title="Logout">
        <IconButton size="large" color="error" sx={{ p: 1 }} onClick={handleLogout}>
          <Logout variant="Bulk" />
        </IconButton>
      </Tooltip> */}
      <Tooltip title="Logout">
        <Button endIcon={<Logout variant="Bulk" />} sx={{ fontWeight: 'regular' }} fullWidth onClick={handleLogout}>
          Log Out
        </Button>
      </Tooltip>
    </Box>
  );
}
