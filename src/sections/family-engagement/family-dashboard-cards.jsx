import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha, useTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export function FamilyDashboardCards({ navigationPaths, sx, ...other }) {
  const theme = useTheme();
  const router = useRouter();

  const handleNavigate = (target) => {
    if (!navigationPaths) return;
    if (target === 'onSite') {
      if (navigationPaths.directory) router.push(navigationPaths.directory);
      else if (navigationPaths.dashboardRoot) router.push(navigationPaths.dashboardRoot);
    } else if (target === 'visitors') {
      if (navigationPaths.directory) router.push(navigationPaths.directory);
      else if (navigationPaths.feedback) router.push(navigationPaths.feedback);
      else if (navigationPaths.dashboardRoot) router.push(navigationPaths.dashboardRoot);
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
      {...other}
    >
      <CardHeader
        title={
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 700,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: 'text.secondary',
              fontSize: '0.8125rem',
            }}
          >
            EXISTING DASHBOARD CARDS
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mt: 0.5 }}>
            On site now · Visitors · Evacuation · Rota
          </Typography>
        }
        sx={{ pb: 1 }}
      />

      <Box sx={{ p: 3, pt: 2, flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Grid container spacing={2.5} sx={{ width: '100%' }}>
          <Grid xs={12} sm={6}>
            <Card
              component={ButtonBase}
              onClick={() => handleNavigate('onSite')}
              sx={{
                width: '100%',
                p: 3,
                minHeight: 110,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                bgcolor: (t) => (t.palette.mode === 'light' ? 'grey.100' : 'background.neutral'),
                border: (t) => `1px solid ${t.palette.divider}`,
                transition: theme.transitions.create(['transform', 'box-shadow', 'background-color', 'border-color'], {
                  duration: theme.transitions.duration.shorter,
                }),
                '&:hover': {
                  transform: 'translateY(-2px)',
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  borderColor: 'primary.main',
                  boxShadow: (t) => t.customShadows?.z8 || t.shadows[4],
                },
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                On site
              </Typography>
            </Card>
          </Grid>

          <Grid xs={12} sm={6}>
            <Card
              component={ButtonBase}
              onClick={() => handleNavigate('visitors')}
              sx={{
                width: '100%',
                p: 3,
                minHeight: 110,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                bgcolor: (t) => (t.palette.mode === 'light' ? 'grey.100' : 'background.neutral'),
                border: (t) => `1px solid ${t.palette.divider}`,
                transition: theme.transitions.create(['transform', 'box-shadow', 'background-color', 'border-color'], {
                  duration: theme.transitions.duration.shorter,
                }),
                '&:hover': {
                  transform: 'translateY(-2px)',
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  borderColor: 'primary.main',
                  boxShadow: (t) => t.customShadows?.z8 || t.shadows[4],
                },
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                Visitors
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
}

FamilyDashboardCards.propTypes = {
  navigationPaths: PropTypes.object,
  sx: PropTypes.object,
};
