import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';

// ----------------------------------------------------------------------

export function DashboardWidgetSkeleton({
  titleWidth = 160,
  subheaderWidth = 220,
  variant = 'chart',
  sx,
  ...other
}) {
  if (variant === 'actionBar') {
    return (
      <Card
        variant="outlined"
        sx={{
          p: 3,
          display: 'flex',
          bgcolor: 'background.neutral',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          ...sx,
        }}
        {...other}
      >
        <Box>
          <Skeleton variant="text" width={titleWidth} height={28} />
          <Skeleton variant="text" width={subheaderWidth} height={20} />
        </Box>
        <Skeleton variant="rounded" width={128} height={36} sx={{ borderRadius: 1 }} />
      </Card>
    );
  }

  return (
    <Card sx={{ height: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', ...sx }} {...other}>
      <CardHeader
        title={<Skeleton variant="text" width={titleWidth} height={28} />}
        subheader={<Skeleton variant="text" width={subheaderWidth} height={20} />}
      />

      <Box sx={{ px: 3, pb: 3, pt: 1, flex: 1, minHeight: 0 }}>
        {variant === 'pie' && (
          <Stack alignItems="center" spacing={2} sx={{ py: 2 }}>
            <Skeleton variant="circular" width={220} height={220} />
            <Stack direction="row" spacing={1.5}>
              <Skeleton variant="rounded" width={72} height={16} />
              <Skeleton variant="rounded" width={72} height={16} />
              <Skeleton variant="rounded" width={72} height={16} />
            </Stack>
          </Stack>
        )}

        {variant === 'bars' && (
          <Stack spacing={2} sx={{ pt: 1 }}>
            {[0.9, 0.7, 0.55, 0.8, 0.45].map((width, index) => (
              <Stack key={index} direction="row" spacing={1.5} alignItems="center">
                <Skeleton variant="text" width={88} height={18} />
                <Skeleton variant="rounded" height={18} sx={{ flexGrow: 1, maxWidth: `${width * 100}%`, borderRadius: 1 }} />
              </Stack>
            ))}
          </Stack>
        )}

        {variant === 'list' && (
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {[0, 1, 2, 3].map((index) => (
              <Stack key={index} spacing={0.75}>
                <Stack direction="row" alignItems="center">
                  <Skeleton variant="text" width="42%" />
                  <Skeleton variant="text" width={28} sx={{ ml: 'auto' }} />
                </Stack>
                <Skeleton variant="rounded" height={6} sx={{ borderRadius: 1 }} />
              </Stack>
            ))}
          </Stack>
        )}

        {variant === 'chips' && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, pt: 0.5 }}>
            {[110, 150, 92, 128, 84, 140].map((width, index) => (
              <Skeleton key={index} variant="rounded" width={width} height={32} sx={{ borderRadius: 1.5 }} />
            ))}
          </Box>
        )}

        {variant === 'stats' && (
          <Stack direction="row" spacing={3} justifyContent="space-around" sx={{ py: 3 }}>
            {[0, 1].map((index) => (
              <Stack key={index} alignItems="center" spacing={1}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width={40} height={36} />
                <Skeleton variant="text" width={70} />
              </Stack>
            ))}
          </Stack>
        )}

        {variant === 'table' && (
          <Stack spacing={1.25} sx={{ pt: 0.5 }}>
            <Skeleton variant="rounded" height={36} />
            {[0, 1, 2, 3, 4].map((index) => (
              <Skeleton key={index} variant="rounded" height={32} />
            ))}
          </Stack>
        )}

        {variant === 'timeline' && (
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {[0, 1, 2, 3].map((index) => (
              <Stack key={index} direction="row" spacing={1.5} alignItems="flex-start">
                <Skeleton variant="circular" width={12} height={12} sx={{ mt: 0.75 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton variant="text" width="70%" height={20} />
                  <Skeleton variant="text" width="40%" height={16} />
                </Box>
              </Stack>
            ))}
          </Stack>
        )}

        {variant === 'chart' && (
          <Skeleton variant="rounded" height="100%" sx={{ minHeight: 280, borderRadius: 2 }} />
        )}
      </Box>
    </Card>
  );
}
