import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';

// ----------------------------------------------------------------------

const COUNT_ITEMS = [
  { key: 'staff', label: 'Staff', color: 'primary' },
  { key: 'residents', label: 'Residents', color: 'success' },
  { key: 'visitors', label: 'Visitors', color: 'info' },
  { key: 'contractors', label: 'Contractors', color: 'warning' },
];

/**
 * Compact on-site headcount.
 * API later: GET FIRE_DRILL_API.onSiteSummary
 */
export function OnSiteSummary({ summary, loading }) {
  if (loading) {
    return (
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {COUNT_ITEMS.map((item) => (
          <Grid key={item.key} xs={6} sm={3}>
            <Skeleton variant="rounded" height={72} />
          </Grid>
        ))}
      </Grid>
    );
  }

  const counts = summary?.counts || {};

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 1 }} flexWrap="wrap" gap={0.5}>
        <Typography variant="subtitle2">People currently on site</Typography>
        <Typography variant="caption" color="text.secondary">
          {summary?.assemblyPoint
            ? `Assembly: ${summary.assemblyPoint}`
            : 'Assembly point not set'}
        </Typography>
      </Stack>

      <Grid container spacing={1.5}>
        {COUNT_ITEMS.map((item) => (
          <Grid key={item.key} xs={6} sm={3}>
            <Card
              sx={{
                px: 1.5,
                py: 1.25,
                borderLeft: (theme) => `3px solid ${theme.palette[item.color].main}`,
                transition: (theme) => theme.transitions.create('background-color'),
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <Typography variant="h4" sx={{ lineHeight: 1.2 }}>
                {counts[item.key] ?? 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {item.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Total on site: {counts.total ?? 0}
      </Typography>
    </Box>
  );
}
