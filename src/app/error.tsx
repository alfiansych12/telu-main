'use client';

// NEXT
import Link from 'next/link';

// MATERIAL - UI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// PROJECT IMPORTS
import { APP_DEFAULT_PATH } from 'config';
import AnimateButton from 'components/@extended/AnimateButton';
import { withBasePath } from 'utils/path';

// ASSETS
const error500 = withBasePath('/assets/images/maintenance/img-error-500.svg');

// ==============================|| ERROR 500 - MAIN ||============================== //

function Error500({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Grid container direction="column" alignItems="center" justifyContent="center" sx={{ minHeight: '100vh' }} spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ width: { xs: 350, sm: 396 } }}>
          <img src={error500} alt="error 500" style={{ width: '100%', height: 'auto' }} />
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Stack spacing={2} justifyContent="center" alignItems="center">
          <Typography variant="h1">Internal Server Error</Typography>
          <Typography color="textSecondary" align="center" sx={{ width: { xs: '73%', sm: '70%' } }}>
            {error.message || 'Server error 500. we fixing the problem. please try again at a later stage.'}
          </Typography>
          {process.env.NODE_ENV === 'development' && error.stack && (
            <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1, maxWidth: '80vw', overflow: 'auto' }}>
              <pre style={{ fontSize: '10px' }}>{error.stack}</pre>
            </Box>
          )}
          <AnimateButton>
            <Button component={Link} href={APP_DEFAULT_PATH} variant="contained" size="large">
              Back To Home
            </Button>
          </AnimateButton>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default Error500;
