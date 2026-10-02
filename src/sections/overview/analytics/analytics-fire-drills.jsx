import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { fNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

// ----------------------------------------------------------------------

function Stat({ total, label, color, icon }) {
  return (
    <Stack alignItems="center" spacing={1} sx={{ flex: 1, py: 1 }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          display: 'flex',
          borderRadius: '50%',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) => alpha(theme.palette[color].main, theme.palette.mode === 'dark' ? 0.16 : 0.08),
        }}
      >
        <Iconify icon={icon} width={20} sx={{ color: `${color}.main` }} />
      </Box>

      <Typography variant="h4" sx={{ color: `${color}.main`, lineHeight: 1.2 }}>
        {fNumber(total)}
      </Typography>

      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
    </Stack>
  );
}

export function AnalyticsFireDrills({
  title,
  subheader,
  completed,
  overdueSites,
  loading = false,
  sx,
  ...other
}) {
  const hasData = Number.isFinite(completed) || Number.isFinite(overdueSites);
  const isOverdue = overdueSites > 0;

  return (
    <Card sx={sx} {...other}>
      <CardHeader title={title} subheader={subheader} />

      <Box sx={{ px: 3, pb: 3, pt: 2 }}>
        {loading ? (
          <Stack direction="row" divider={<Divider orientation="vertical" flexItem />} sx={{ py: 1 }}>
            {[0, 1].map((index) => (
              <Stack key={index} alignItems="center" spacing={1} sx={{ flex: 1 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width={40} height={36} />
                <Skeleton variant="text" width={70} />
              </Stack>
            ))}
          </Stack>
        ) : !hasData ? (
          <EmptyContent
            filled
            title="No drills logged"
            description="Fire drill activity for this quarter will appear here."
            sx={{ py: 5 }}
            slotProps={{ img: { maxWidth: 96 } }}
          />
        ) : (
          <Stack direction="row" divider={<Divider orientation="vertical" flexItem />}>
            <Stat
              total={completed || 0}
              label="Completed"
              color="success"
              icon="solar:shield-check-bold-duotone"
            />
            <Stat
              total={overdueSites || 0}
              label={overdueSites === 1 ? 'Overdue site' : 'Overdue sites'}
              color={isOverdue ? 'error' : 'success'}
              icon={isOverdue ? 'solar:danger-triangle-bold-duotone' : 'solar:check-circle-bold-duotone'}
            />
          </Stack>
        )}
      </Box>
    </Card>
  );
}
