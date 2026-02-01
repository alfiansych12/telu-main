'use client';
import { Avatar, Stack, Typography, Box } from '@mui/material';
import useUser from 'hooks/useUser';
import { useGetMenuMaster } from 'api/menu';


import { useQuery } from '@tanstack/react-query';
import { getUserById } from 'utils/api/users';

const Profile = () => {
  const userSession = useUser();
  const { data: userData } = useQuery({
    queryKey: ['user-profile', (userSession as any)?.nim],
    queryFn: () => getUserById((userSession as any)?.nim),
    enabled: !!(userSession as any)?.nim
  });

  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const displayUser = (userData || userSession) as any;
  const photo = displayUser?.photo || '';

  return (
    <Box sx={{ border: 1, borderColor: 'secondary.light', margin: 1, padding: 1, borderRadius: '5%', backgroundColor: 'secondary.200' }}>
      <Stack sx={{ alignItems: 'center', gap: 1 }}>
        <Avatar alt="profile user" src={photo} sx={{ width: 60, height: 60 }} />
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
            <Typography
              className="font-semibold text-xs"
              sx={{
                textTransform: 'uppercase',
                fontSize: '0.65rem',
                letterSpacing: '0.02em'
              }}
            >
              {displayUser?.fullName || displayUser?.name || 'User'}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.6rem', textTransform: 'capitalize' }}>
              {displayUser?.role || ''}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default Profile;
