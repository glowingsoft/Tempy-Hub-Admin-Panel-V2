import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function RotaSummaryBar({
  totalHours = 0,
  totalShifts = 0,
  totalCost = 0,
  showTotalCost = false,
  earnings = null,
  sx,
  ...other
}) {
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
        gap: { xs: 1.5, sm: 3 },
        ...sx,
      }}
      {...other}
    >
      {/* Total Hours */}
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
          <Iconify icon="solar:clock-circle-bold" width={16} />
        </Box>
        <Stack direction="row" alignItems="baseline" spacing={0.75}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            Total Hours:
          </Typography>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {totalHours}h
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

      {/* Money Earnt (Personal scope only) */}
      {earnings != null && (
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
                bgcolor: (theme) => alpha(theme.palette.success.main, 0.12),
                color: 'success.main',
              }}
            >
              <Iconify icon="solar:wallet-bold" width={16} />
            </Box>
            <Stack direction="row" alignItems="baseline" spacing={0.75}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Money Earnt:
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'success.main' }}>
                {fCurrency(earnings, { code: 'en-GB', currency: 'GBP' })}
              </Typography>
            </Stack>
          </Stack>
        </>
      )}

      {/* Total Cost (All Teams / Owner only) */}
      {showTotalCost && (
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
              <Iconify icon="solar:bill-list-bold" width={16} />
            </Box>
            <Stack direction="row" alignItems="baseline" spacing={0.75}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                Total Cost:
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {fCurrency(totalCost, { code: 'en-GB', currency: 'GBP' })}
              </Typography>
            </Stack>
          </Stack>
        </>
      )}
    </Box>
  );
}

RotaSummaryBar.propTypes = {
  totalHours: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  totalShifts: PropTypes.number,
  totalCost: PropTypes.number,
  showTotalCost: PropTypes.bool,
  earnings: PropTypes.number,
  sx: PropTypes.object,
};
