import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import { getDashboardPath, isAuthenticatedUser } from 'src/auth/utils/get-dashboard-path';
import { Iconify } from 'src/components/iconify';
import { SimpleLayout } from 'src/layouts/simple';
import { varAlpha } from 'src/theme/styles';

// ----------------------------------------------------------------------

export function NotFoundView() {
  const theme = useTheme();
  const user = useSelector((state) => state.user?.user);
  const homeHref = isAuthenticatedUser(user) ? getDashboardPath(user) : '/';

  return (
    <SimpleLayout>
      <Box
        sx={{
          flex: '1 1 auto',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: { xs: 8, md: 10 },
        }}
      >
        <Box
          sx={{
            pointerEvents: 'none',
            position: 'absolute',
            width: 520,
            height: 520,
            top: '12%',
            left: '50%',
            borderRadius: '50%',
            transform: 'translateX(-50%)',
            background: `radial-gradient(circle, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.14)} 0%, transparent 68%)`,
          }}
        />

        <Box
          sx={{
            position: 'relative',
            width: 1,
            maxWidth: 540,
            textAlign: 'center',
            px: { xs: 3, sm: 6 },
            py: { xs: 5, sm: 7 },
            borderRadius: 4,
            bgcolor: 'background.paper',
            border: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
            boxShadow: theme.customShadows.z24,
          }}
        >
          <Box
            sx={{
              mx: 'auto',
              mb: 3.5,
              width: 96,
              height: 96,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              color: 'primary.main',
              bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
              boxShadow: `inset 0 0 0 1px ${varAlpha(theme.vars.palette.primary.mainChannel, 0.16)}`,
            }}
          >
            <Iconify icon="solar:magnifer-bold-duotone" width={42} />
          </Box>

          <Box
            sx={{
              mx: 'auto',
              mb: 2,
              px: 1.5,
              py: 0.5,
              width: 'fit-content',
              typography: 'caption',
              fontWeight: 700,
              letterSpacing: 1.2,
              color: 'primary.dark',
              borderRadius: 1.25,
              bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
            }}
          >
            404
          </Box>

          <Typography variant="h3" sx={{ mb: 1.5 }}>
            Page not found
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 360, mx: 'auto', mb: 4 }}>
            This address doesn’t match a page in Tempy Hub. Check the link, or return home.
          </Typography>

          <Button
            component={RouterLink}
            href={homeHref}
            size="large"
            variant="contained"
            startIcon={<Iconify icon="solar:home-2-bold-duotone" width={20} />}
            sx={{ px: 3, borderRadius: 1.5, boxShadow: theme.customShadows.primary }}
          >
            Go Homepage
          </Button>
        </Box>
      </Box>
    </SimpleLayout>
  );
}
