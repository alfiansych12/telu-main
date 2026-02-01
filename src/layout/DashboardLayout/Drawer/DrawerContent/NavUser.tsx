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
import { useQueryClient } from '@tanstack/react-query';

// assets
import { Button, Tooltip } from '@mui/material';
import { Logout } from 'iconsax-react';
import { handleLogout } from 'utils/client-actions';

// ... (rest of the imports)

export default function NavUser() {
  const queryClient = useQueryClient();
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
      <Tooltip title="Logout">
        <Button endIcon={<Logout variant="Bulk" />} sx={{ fontWeight: 'regular' }} fullWidth onClick={() => handleLogout(queryClient)}>
          Log Out
        </Button>
      </Tooltip>
    </Box>
  );
}
