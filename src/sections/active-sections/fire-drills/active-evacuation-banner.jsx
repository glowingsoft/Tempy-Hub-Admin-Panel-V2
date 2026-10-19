import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

import { getEvacuationTypeMeta } from './mocks/data';

// ----------------------------------------------------------------------

/**
 * Live active evacuation card placed under the headcount summary cards.
 */
export function ActiveEvacuationBanner({ event, onViewRollcall, onCloseEvacuation }) {
  if (!event) return null;

  const typeMeta = getEvacuationTypeMeta(event.type);
  const stats = event.rollcallStats || event.stats || {};
  const branchName = event.branch?.name || event.branchName;
  const assemblyPoint = event.branch?.assemblyPoint || event.assemblyPoint;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.25 },
        mb: 3,
        borderRadius: 2,
        bgcolor: (theme) =>
          theme.palette.mode === 'light' ? '#FFFBEB' : 'rgba(255, 171, 0, 0.08)',
        border: (theme) =>
          `1px solid ${theme.palette.mode === 'light' ? '#FED7AA' : 'rgba(255, 171, 0, 0.24)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Stack direction="row" spacing={1.75} alignItems="flex-start" sx={{ minWidth: 0, flex: 1 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#D97706',
            flexShrink: 0,
            mt: 0.25,
          }}
        >
          <Iconify icon="solar:danger-triangle-bold" width={26} />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#78350F' }}>
              Evacuation active
            </Typography>

            <Label
              variant="soft"
              color={typeMeta.color}
              sx={{ textTransform: 'capitalize', fontWeight: 600 }}
            >
              {typeMeta.label}
            </Label>

            {branchName && (
              <Label variant="soft" color="default" sx={{ fontWeight: 500 }}>
                {branchName}
              </Label>
            )}
          </Stack>

          <Typography
            variant="body2"
            sx={{ color: '#92400E', fontWeight: 500, fontSize: '0.875rem' }}
          >
            Started {fDateTime(event.startedAt)}
            {event.startedByName && !/^[0-9a-fA-F]{24}$/.test(event.startedByName)
              ? ` · ${event.startedByName}`
              : ''}
            {assemblyPoint ? ` · ${assemblyPoint}` : ''}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: '#B45309',
              display: 'block',
              mt: 0.25,
              fontWeight: 500,
              fontSize: '0.8rem',
            }}
          >
            Safe {stats.safe ?? 0} · Missing {stats.missing ?? 0} · Not yet {stats.unknown ?? 0}
            {stats.total != null ? ` · of ${stats.total}` : ''}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flexShrink: 0 }}>
        <Button
          size="medium"
          color="inherit"
          onClick={() => onViewRollcall?.(event)}
          sx={{
            fontWeight: 700,
            color: '#1C252E',
            px: 1.5,
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
          }}
        >
          Rollcall
        </Button>

        <Button
          size="medium"
          variant="contained"
          onClick={() => onCloseEvacuation?.(event)}
          sx={{
            bgcolor: '#1C252E',
            color: '#ffffff',
            fontWeight: 600,
            px: 2.25,
            borderRadius: 1,
            '&:hover': { bgcolor: '#000000' },
          }}
        >
          Close
        </Button>
      </Stack>
    </Box>
  );
}

ActiveEvacuationBanner.propTypes = {
  event: PropTypes.object,
  onViewRollcall: PropTypes.func,
  onCloseEvacuation: PropTypes.func,
};