import Button from '@mui/material/Button';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

export function SignInButton({ sx, ...other }) {
  return (
    <Button
      component={RouterLink}
      // href={CONFIG.auth.redirectPath}
      href="/"
      variant="outlined"
      sx={sx}
      {...other}
    >
      Sign in
    </Button>
  );
}
