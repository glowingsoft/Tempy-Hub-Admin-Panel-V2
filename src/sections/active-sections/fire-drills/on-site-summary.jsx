import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';

import { CONFIG } from 'src/config-global';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';

// ----------------------------------------------------------------------

const COUNT_ITEMS = [
  {
    key: 'staff',
    label: 'Staff',
    color: 'primary',
    icon: `${CONFIG.site.basePath}/assets/icons/navbar/ic-job.svg`,
  },
  {
    key: 'residents',
    label: 'Residents',
    color: 'success',
    icon: `${CONFIG.site.basePath}/assets/icons/navbar/ic-user.svg`,
  },
  {
    key: 'visitors',
    label: 'Visitors',
    color: 'warning',
    icon: `${CONFIG.site.basePath}/assets/icons/navbar/ic-calendar.svg`,
  },
  {
    key: 'contractors',
    label: 'Contractors',
    color: 'info',
    icon: `${CONFIG.site.basePath}/assets/icons/navbar/ic-analytics.svg`,
  },
];

/**
 * Headcount summary cards matching the main dashboard widget style.
 */
export function OnSiteSummary({ summary, loading, hideSiteDetails = false }) {
  if (loading) {
    return (
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width={220} height={32} sx={{ mb: 2 }} />
        <Grid container spacing={2.5}>
          {COUNT_ITEMS.map((item) => (
            <Grid key={item.key} xs={12} sm={6} md={3}>
              <Skeleton variant="rounded" height={124} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const counts = summary?.counts || {};
  const totalCount = summary
    ? counts.total ??
      ((counts.staff || 0) + (counts.residents || 0) + (counts.visitors || 0) + (counts.contractors || 0))
    : '—';

  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
        flexWrap="wrap"
        gap={1}
      >
        <div>
          <Typography variant="h6">People currently on site</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
            Real-time headcount across active zones
          </Typography>
        </div>

        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          {!hideSiteDetails && summary?.branchName && (
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                bgcolor: 'action.hover',
                typography: 'caption',
                fontWeight: 600,
                color: 'text.secondary',
              }}
            >
              Site: {summary.branchName}
            </Box>
          )}

          {!hideSiteDetails && summary?.assemblyPoint && (
            <Box
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                bgcolor: 'action.hover',
                typography: 'caption',
                fontWeight: 600,
                color: 'text.secondary',
              }}
            >
              Assembly: {summary.assemblyPoint}
            </Box>
          )}

          <Box
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: (theme) => `rgba(${theme.vars.palette.primary.mainChannel} / 0.08)`,
              color: 'primary.main',
              typography: 'caption',
              fontWeight: 700,
            }}
          >
            Total on site: {totalCount}
          </Box>
        </Stack>
      </Stack>

      <Grid container spacing={2.5}>
        {COUNT_ITEMS.map((item) => (
          <Grid key={item.key} xs={12} sm={6} md={3}>
            <CourseWidgetSummary
              title={item.label}
              total={counts[item.key] ?? (summary ? 0 : '—')}
              color={item.color}
              icon={item.icon}
              sx={{
                transition: (theme) => theme.transitions.create(['box-shadow', 'transform']),
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: (theme) => theme.customShadows?.z12 || 4,
                },
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}