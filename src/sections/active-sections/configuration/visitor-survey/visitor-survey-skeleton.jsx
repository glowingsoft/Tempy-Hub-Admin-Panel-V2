import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

// ----------------------------------------------------------------------

export function VisitorSurveySkeleton() {
  return (
    <Stack spacing={3}>
      {/* 1. Notifications Skeleton Card */}
      <Card sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Box>
            <Skeleton variant="text" width={220} height={28} />
            <Skeleton variant="text" width={320} height={18} />
          </Box>
          <Skeleton variant="rounded" width={38} height={24} sx={{ borderRadius: 12 }} />
        </Stack>

        <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

        {/* Channels */}
        <Skeleton variant="text" width={100} height={20} sx={{ mb: 1.5 }} />
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          <Grid item xs={12} sm={6}>
            <Skeleton variant="rounded" height={48} sx={{ borderRadius: 1.25 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Skeleton variant="rounded" height={48} sx={{ borderRadius: 1.25 }} />
          </Grid>
        </Grid>

        {/* Recipients */}
        <Skeleton variant="text" width={100} height={20} sx={{ mb: 1.5 }} />
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          <Grid item xs={12} sm={6}>
            <Skeleton variant="rounded" height={48} sx={{ borderRadius: 1.25 }} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Skeleton variant="rounded" height={48} sx={{ borderRadius: 1.25 }} />
          </Grid>
        </Grid>

        {/* Notification content */}
        <Skeleton variant="text" width={180} height={20} sx={{ mb: 1.5 }} />
        <Grid container spacing={1.5}>
          {[...Array(4)].map((_, idx) => (
            <Grid item xs={12} sm={6} key={idx}>
              <Skeleton variant="rounded" height={48} sx={{ borderRadius: 1.25 }} />
            </Grid>
          ))}
        </Grid>
      </Card>

      {/* 2. Questions / Feedback Form Skeleton Card */}
      <Card sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2.5 }}
        >
          <Box>
            <Skeleton variant="text" width={180} height={28} />
            <Skeleton variant="text" width={300} height={18} />
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Skeleton variant="rounded" width={150} height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rounded" width={170} height={36} sx={{ borderRadius: 1 }} />
          </Stack>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed', my: 2 }} />

        {/* Form Inputs Skeleton */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Skeleton variant="rounded" height={40} sx={{ borderRadius: 1 }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Skeleton variant="rounded" height={40} sx={{ borderRadius: 1 }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Skeleton variant="rounded" height={40} sx={{ borderRadius: 1 }} />
          </Grid>
        </Grid>

        {/* Dynamic Question Placeholders */}
        <Stack spacing={2}>
          {[...Array(3)].map((_, idx) => (
            <Box
              key={idx}
              sx={{
                p: 2,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Skeleton variant="text" width="55%" height={24} sx={{ mb: 1.5 }} />
              <Stack direction="row" spacing={1.5}>
                <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rounded" width={80} height={32} sx={{ borderRadius: 1 }} />
              </Stack>
            </Box>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}

export default VisitorSurveySkeleton;

