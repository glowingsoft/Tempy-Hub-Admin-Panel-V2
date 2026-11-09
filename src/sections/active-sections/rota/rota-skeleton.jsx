import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

const COL_WIDTH = 108;
const NAME_COL_WIDTH = 240;
const DEFAULT_DAYS_COUNT = 14;

export function RotaGridSkeleton({ daysCount = DEFAULT_DAYS_COUNT, teamsCount = 3, staffPerTeam = 3 }) {
  return (
    <Scrollbar sx={{ height: 1 }}>
      <Box sx={{ minWidth: NAME_COL_WIDTH + daysCount * COL_WIDTH }}>
        {/* Date Header Row Skeleton */}
        <Stack
          direction="row"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              width: NAME_COL_WIDTH,
              flexShrink: 0,
              p: 1.5,
              position: 'sticky',
              left: 0,
              zIndex: 3,
              bgcolor: 'background.paper',
            }}
          >
            <Skeleton variant="text" width={80} height={20} />
          </Box>

          {[...Array(daysCount)].map((_, index) => (
            <Stack
              key={index}
              alignItems="center"
              justifyContent="center"
              spacing={0.5}
              sx={{
                width: COL_WIDTH,
                flexShrink: 0,
                py: 1,
                borderLeft: '1px solid',
                borderColor: 'divider',
                bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
              }}
            >
              <Skeleton variant="text" width={56} height={18} />
              <Skeleton variant="text" width={32} height={14} />
            </Stack>
          ))}
        </Stack>

        {/* Teams and Staff Skeletons */}
        <Stack divider={<Box sx={{ height: 8 }} />}>
          {[...Array(teamsCount)].map((_, tIdx) => (
            <Box key={tIdx}>
              {/* Team Header Row */}
              <Stack
                direction="row"
                alignItems="center"
                spacing={2}
                sx={{
                  px: 1.5,
                  py: 1,
                  bgcolor: (theme) => alpha(theme.palette.grey[500], 0.08),
                  width: 1,
                }}
              >
                <Skeleton variant="circular" width={10} height={10} />
                <Skeleton variant="text" width={140} height={22} />
                <Skeleton variant="rounded" width={50} height={18} sx={{ borderRadius: 0.75 }} />
                <Skeleton variant="rounded" width={50} height={18} sx={{ borderRadius: 0.75 }} />
              </Stack>

              {/* Staff Rows */}
              {[...Array(staffPerTeam)].map((_, sIdx) => (
                <Stack
                  key={sIdx}
                  direction="row"
                  alignItems="stretch"
                  sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                >
                  <Box
                    sx={{
                      width: NAME_COL_WIDTH,
                      flexShrink: 0,
                      position: 'sticky',
                      left: 0,
                      zIndex: 1,
                      bgcolor: 'background.paper',
                      px: 1.5,
                      py: 1.25,
                    }}
                  >
                    <Skeleton variant="text" width={110} height={20} />
                    <Skeleton variant="text" width={45} height={16} />
                  </Box>

                  {[...Array(daysCount)].map((_, dIdx) => (
                    <Box
                      key={dIdx}
                      sx={{
                        width: COL_WIDTH,
                        flexShrink: 0,
                        px: 0.75,
                        py: 1,
                        minHeight: 52,
                        borderLeft: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {(tIdx + sIdx + dIdx) % 2 === 0 ? (
                        <Skeleton
                          variant="rounded"
                          width="100%"
                          height={36}
                          sx={{ borderRadius: 1 }}
                        />
                      ) : null}
                    </Box>
                  ))}
                </Stack>
              ))}
            </Box>
          ))}
        </Stack>
      </Box>
    </Scrollbar>
  );
}

export function RotaSkeleton() {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '78vh', overflow: 'hidden' }}>
      {/* Toolbar Skeleton */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        rowGap={1}
        columnGap={1.5}
        sx={{ px: 2.5, py: 1.5, width: 1, borderBottom: '1px solid', borderColor: 'divider' }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Skeleton variant="rounded" width={220} height={36} sx={{ borderRadius: 1.25 }} />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Skeleton variant="rounded" width={200} height={36} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rounded" width={80} height={36} sx={{ borderRadius: 1 }} />
        </Stack>
      </Stack>

      {/* Summary Bar Skeleton */}
      <Box
        sx={{
          px: 2.5,
          py: 1.25,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
        }}
      >
        <Skeleton variant="rounded" width={110} height={28} sx={{ borderRadius: 1 }} />
        <Divider orientation="vertical" flexItem sx={{ height: 18, my: 'auto' }} />
        <Skeleton variant="rounded" width={120} height={28} sx={{ borderRadius: 1 }} />
        <Divider orientation="vertical" flexItem sx={{ height: 18, my: 'auto' }} />
        <Skeleton variant="rounded" width={110} height={28} sx={{ borderRadius: 1 }} />
        <Divider orientation="vertical" flexItem sx={{ height: 18, my: 'auto' }} />
        <Skeleton variant="rounded" width={110} height={28} sx={{ borderRadius: 1 }} />
      </Box>

      {/* Grid Skeleton */}
      <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
        <RotaGridSkeleton daysCount={14} teamsCount={3} staffPerTeam={2} />
      </Box>
    </Card>
  );
}

