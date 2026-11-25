import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

import { getEvacuationTypeMeta } from './view/fire-drills-view';

// ----------------------------------------------------------------------

export function StaffActiveEvacuationCard({ event, onCheckIn, loading = false }) {
  const locationOptions = useMemo(() => {
    const raw = [
      event?.branch?.assemblyPoint,
      ...(Array.isArray(event?.kiosks)
        ? event.kiosks.map((k) => k?.locationLabel || k?.name)
        : []),
      'Car park',
    ].filter((val) => typeof val === 'string' && val.trim());

    return Array.from(new Set(raw.map((val) => val.trim())));
  }, [event]);

  const defaultLocation =
    event?.check?.locationLabel || event?.branch?.assemblyPoint || locationOptions[0] || 'Car park';
  const [locationLabel, setLocationLabel] = useState(defaultLocation);

  useEffect(() => {
    setLocationLabel(defaultLocation);
  }, [defaultLocation]);

  if (!event || event.status !== 'active') return null;

  const typeMeta = getEvacuationTypeMeta(event.type);
  const branchName = event.branch?.name;
  const assemblyPoint = event.branch?.assemblyPoint;
  const currentStatus = event.check?.status || (event.evacCheck ? 'safe' : null);

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

            {currentStatus && (
              <Label
                variant="soft"
                color={currentStatus === 'offSite' ? 'warning' : 'success'}
                sx={{ fontWeight: 600 }}
              >
                Marked: {currentStatus === 'offSite' ? 'Off-site' : 'Safe'}
              </Label>
            )}
          </Stack>

          <Typography
            variant="body2"
            sx={{ color: '#92400E', fontWeight: 500, fontSize: '0.875rem' }}
          >
            Started {fDateTime(event.startedAt)}
            {assemblyPoint ? ` · Assembly: ${assemblyPoint}` : ''}
          </Typography>
        </Box>
      </Stack>

      {!currentStatus && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.25}
          alignItems={{ sm: 'center' }}
          sx={{ flexShrink: 0 }}
        >
          <TextField
            select
            size="small"
            label="Location"
            value={locationLabel}
            onChange={(e) => setLocationLabel(e.target.value)}
            disabled={loading}
            sx={{ minWidth: 180, bgcolor: 'background.paper', borderRadius: 1 }}
          >
            {locationOptions.map((loc) => (
              <MenuItem key={loc} value={loc}>
                {loc}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction="row" spacing={1}>
            <Button
              size="medium"
              variant="contained"
              color="success"
              disabled={loading}
              onClick={() => onCheckIn?.(event, 'safe', locationLabel)}
              sx={{ fontWeight: 700 }}
            >
              Safe
            </Button>
            <Button
              size="medium"
              variant="outlined"
              color="warning"
              disabled={loading}
              onClick={() => onCheckIn?.(event, 'offSite', locationLabel)}
              sx={{ fontWeight: 700 }}
            >
              Off-site
            </Button>
          </Stack>
        </Stack>
      )}
    </Box>
  );
}

StaffActiveEvacuationCard.propTypes = {
  event: PropTypes.object,
  onCheckIn: PropTypes.func,
  loading: PropTypes.bool,
};
