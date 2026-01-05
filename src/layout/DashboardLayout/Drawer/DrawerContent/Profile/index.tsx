'use client';
import { Avatar, Stack, Typography, Box } from '@mui/material';
import useUser from 'hooks/useUser';
import { useGetMenuMaster } from 'api/menu';

import { withBasePath } from 'utils/path';

const Profile = () => {
  const user = useUser();
  const avatar1 = withBasePath('/assets/images/users/avatar-6.png');
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  return (
    <Box sx={{ border: 1, borderColor: 'secondary.light', margin: 1, padding: 1, borderRadius: '5%', backgroundColor: 'secondary.200' }}>
      <Stack sx={{ alignItems: 'center', gap: 1 }}>
        <Avatar alt="profile user" src={user ? user?.photo : avatar1} sx={{ width: 60, height: 60 }} />
        {drawerOpen && (
          <Stack
            sx={{
              textAlign: 'center',
              width: 1,
              paddingX: 2,
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'normal'
            }}
          >
            <Typography className="font-semibold text-xs">{user ? user?.fullName : ''}</Typography>
            <Typography className="text-xs"> {user ? user?.nim : ''}</Typography>
            <Typography className="text-xs"> {user ? user?.role : ''}</Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default Profile;
