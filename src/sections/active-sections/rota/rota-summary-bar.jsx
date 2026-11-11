import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function formatMinutes(totalMinutes) {
  if (totalMinutes == null || Number.isNaN(Number(totalMinutes))) return '0h';
  const total = Math.max(0, Math.round(Number(totalMinutes)));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${mins}m`;
}

export default function RotaSummaryBar({
  staffCount = 0,
  totalMinutes = 0,
  totalShifts = 0,
  unassignedCount = 0,
  scope = 'personal',
  showUnassigned = true,
  sx,
  ...other
}) {
  const formattedDuration = formatMinutes(totalMinutes);

  return (
    <Box
      sx={{
        px: 2.5,
        py: 1.25,
        bgcolor: (theme) => alpha(theme.palette.grey[500], 0.04),
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: { xs: 1.5, sm: 2.5 },
        ...sx,
      }}
      {...other}
    >
      {/* Total Staff */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
            color: 'primary.main',
          }}
        >
          <Iconify icon="solar:users-group-rounded-bold" width={16} />
        </Box>
        <Stack direction="row" alignItems="baseline" spacing={0.75}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Total Staff:
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {staffCount}
          </Typography>
        </Stack>
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ height: 18, my: 'auto' }} />

      {/* Total Time (exact hours & minutes) */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => alpha(theme.palette.success.main, 0.12),
            color: 'success.main',
          }}
        >
          <Iconify icon="solar:clock-circle-bold" width={16} />
        </Box>
        <Stack direction="row" alignItems="baseline" spacing={0.75}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Total Time:
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {formattedDuration}
          </Typography>
        </Stack>
      </Stack>

      <Divider orientation="vertical" flexItem sx={{ height: 18, my: 'auto' }} />

      {/* Total Shifts */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => alpha(theme.palette.info.main, 0.12),
            color: 'info.main',
          }}
        >
          <Iconify icon="solar:calendar-bold" width={16} />
        </Box>
        <Stack direction="row" alignItems="baseline" spacing={0.75}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Total Shifts:
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {totalShifts}
          </Typography>
        </Stack>
      </Stack>

      {/* Unassigned Shifts Count */}
      {showUnassigned && (
        <>
          <Divider orientation="vertical" flexItem sx={{ height: 18, my: 'auto' }} />
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.warning.main, 0.12),
                color: 'warning.main',
              }}
            >
              <Iconify icon="solar:shield-warning-bold" width={16} />
            </Box>
            <Stack direction="row" alignItems="baseline" spacing={0.75}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Unassigned:
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {unassignedCount}
              </Typography>
            </Stack>
          </Stack>
        </>
      )}
    </Box>
  );
}

RotaSummaryBar.propTypes = {
  staffCount: PropTypes.number,
  totalMinutes: PropTypes.number,
  totalShifts: PropTypes.number,
  unassignedCount: PropTypes.number,
  scope: PropTypes.string,
  showUnassigned: PropTypes.bool,
  sx: PropTypes.object,
};
