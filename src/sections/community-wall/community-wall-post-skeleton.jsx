import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

// ----------------------------------------------------------------------

export function CommunityWallPostSkeleton({ amount = 3 }) {
  return (
    <Stack spacing={3}>
      {Array.from({ length: amount }, (_, index) => (
        <Card
          key={index}
          sx={{
            p: 2.5,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            minHeight: { md: 240 },
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: 'none',
          }}
        >
          <Skeleton
            variant="rounded"
            sx={{
              width: { xs: 1, md: 270 },
              minWidth: { md: 270 },
              height: { xs: 200, md: 1 },
              minHeight: { md: 210 },
              flexShrink: 0,
              borderRadius: 2,
            }}
          />

          <Stack sx={{ flex: 1, minWidth: 0, py: 0.5 }} justifyContent="space-between" spacing={2.5}>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Skeleton variant="circular" width={40} height={40} />
                  <Stack spacing={0.75}>
                    <Skeleton variant="rounded" width={148} height={14} />
                    <Skeleton variant="rounded" width={188} height={12} />
                  </Stack>
                </Stack>
                <Skeleton variant="circular" width={10} height={10} />
              </Stack>

              <Stack spacing={1.25} sx={{ pt: 0.5 }}>
                <Skeleton variant="rounded" width="58%" height={14} />
                <Skeleton variant="rounded" width="100%" height={12} />
                <Skeleton variant="rounded" width="86%" height={12} />
              </Stack>

              <Stack direction="row" spacing={1} sx={{ pt: 0.5 }}>
                <Skeleton variant="rounded" width={92} height={22} sx={{ borderRadius: '12px' }} />
                <Skeleton variant="rounded" width={76} height={22} sx={{ borderRadius: '12px' }} />
              </Stack>
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Skeleton variant="rounded" width={88} height={12} />
              <Stack direction="row" spacing={1}>
                <Skeleton variant="circular" width={18} height={18} />
                <Skeleton variant="circular" width={18} height={18} />
              </Stack>
            </Stack>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}

CommunityWallPostSkeleton.propTypes = {
  amount: PropTypes.number,
};
