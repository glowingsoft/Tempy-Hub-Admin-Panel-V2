import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import { fNumber } from 'src/utils/format-number';

import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

export function AnalyticsResidentRisk({
  title,
  subheader,
  list = [],
  loading = false,
  sx,
  ...other
}) {
  const total = list.reduce((sum, item) => sum + (item.total || 0), 0);

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Stack spacing={2} sx={{ px: 3, pb: 3, pt: 2.5 }}>
        {loading ? (
          [...Array(4)].map((_, index) => (
            <Stack key={index} spacing={0.75}>
              <Stack direction="row" alignItems="center">
                <Skeleton variant="text" width="45%" />
                <Skeleton variant="text" width={28} sx={{ ml: 'auto' }} />
              </Stack>
              <Skeleton variant="rounded" height={6} sx={{ borderRadius: 1 }} />
            </Stack>
          ))
        ) : list.length === 0 ? (
          <EmptyContent
            filled
            title="No data"
            description="Risk levels will appear once residents have a PEEP on file."
            sx={{ py: 5 }}
            slotProps={{ img: { maxWidth: 96 } }}
          />
        ) : (
          list.map((item) => {
            const key = item.level || item.label;
            const hasColor = item.color && item.color !== 'default';
            const tone = hasColor ? item.color : 'inherit';
            const percent = total ? Math.round(((item.total || 0) / total) * 100) : 0;

            return (
              <Box
                key={key}
                sx={{
                  p: 1,
                  m: -1,
                  borderRadius: 1,
                  transition: (theme) => theme.transitions.create('background-color'),
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', flexGrow: 1 }}>
                    {item.label}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: hasColor ? `${tone}.main` : 'text.disabled' }}
                  >
                    {fNumber(item.total)}
                  </Typography>
                </Stack>

                <LinearProgress variant="determinate" value={percent} color={tone} sx={{ height: 6 }} />
              </Box>
            );
          })
        )}
      </Stack>
    </Card>
  );
}
