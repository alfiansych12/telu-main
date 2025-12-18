'use client';

// NEXT

// MATERIAL - UI
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// PROJECT IMPORTS
import AuthSocButton from 'sections/auth/AuthSocButton';
import AuthDivider from 'sections/auth/AuthDivider';
import AuthWrapper2 from 'sections/auth/AuthWrapper2';
import AuthLogin from 'sections/auth/auth-forms/AuthLogin';
import { Windows } from 'iconsax-react';

// ASSETS

// ================================|| LOGIN ||================================ //

const Login2Page = () => {
  return (
    <AuthWrapper2>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h5">Single Account, Single Sign On login</Typography>
            {/* <Typography
              component={Link}
              href={user ? '/auth/register2' : '/register2'}
              variant="body1"
              sx={{ textDecoration: 'none' }}
              color="primary"
            >
              Don&apos;t have an account?
            </Typography> */}
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <AuthLogin forgot="/auth/forgot-password2" />
        </Grid>
        <Grid item xs={12}>
          <AuthDivider>
            <Typography variant="body1">OR</Typography>
          </AuthDivider>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <AuthSocButton
                startIcon={<Windows color="white" variant="Bold" />}
                sx={{
                  bgcolor: '#673ab7',
                  borderColor: '#673ab7',
                  '&:hover,&:focus': {
                    bgcolor: '#673ab7',
                    borderColor: '#673ab7'
                  },
                  height: 40
                }}
              >
                <Typography sx={{ color: 'white' }}>Sign In with Microsoft</Typography>
              </AuthSocButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </AuthWrapper2>
  );
};

export default Login2Page;
