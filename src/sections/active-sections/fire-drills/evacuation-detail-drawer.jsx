import PropTypes from 'prop-types';
import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { fDateTime } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { varAlpha } from 'src/theme/styles';

import { EVAC_CHECK_STATUS, getEvacuationTypeMeta } from './mocks/data';

// ----------------------------------------------------------------------

/**
 * Rollcall detail drawer matching the Tempy Hub reference UI:
 * - Evacuation rollcall header
 * - Soft badges for drill type & active state
 * - Willow House · started [Date]
 * - Safe · Missing · Not yet · Total summary
 * - Staff / Residents / Visitors / Contractors category breakdown
 * - Dark full-width "Close evacuation" button
 * - Clean white cards with status dropdown
 */
export function EvacuationDetailDrawer({
  open,
  onClose,
  event,
  checks = [],
  stats = null,
  onUpdateCheck,
  onCloseEvacuation,
  loadingChecks = false,
  closing = false,
}) {
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredChecks = useMemo(() => {
    if (statusFilter === 'all') return checks;
    return checks.filter((c) => c.status === statusFilter);
  }, [checks, statusFilter]);

  if (!event) return null;

  const typeMeta = getEvacuationTypeMeta(event.type);
  const activeStats = stats || event.rollcallStats || event.stats || {};
  const branchName = event.branch?.name || event.branchName || '';
  const isActive = event.status === 'active';

  const total = activeStats.total ?? checks.length;
  const safe = activeStats.safe ?? checks.filter((c) => c.status === 'safe').length;
  const missing = activeStats.missing ?? checks.filter((c) => c.status === 'missing').length;
  const unknown = activeStats.unknown ?? checks.filter((c) => c.status === 'unknown').length;

  const byKind = activeStats.byKind || null;

  const handleStatusTabChange = (e, newValue) => {
    setStatusFilter(newValue);
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="right"
      slotProps={{ backdrop: { invisible: false } }}
      PaperProps={{
        sx: {
          width: { xs: 1, sm: 460 },
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
        },
      }}
    >
      {/* Drawer Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2.5, py: 2 }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Evacuation rollcall
        </Typography>
        <IconButton onClick={onClose} size="small">
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Stack>

      <Divider />

      {/* Event Meta & Summary Area */}
      <Box sx={{ px: 2.5, py: 2 }}>
        <Stack spacing={1.5}>
          {/* Drill type and Active badges */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Label
              variant="soft"
              color={event.type === 'mock' ? 'info' : 'error'}
              sx={{ fontWeight: 600, fontSize: '0.8rem' }}
            >
              {typeMeta.label}
            </Label>

            {isActive ? (
              <Label
                variant="soft"
                color="error"
                sx={{ fontWeight: 600, fontSize: '0.8rem' }}
              >
                Active
              </Label>
            ) : (
              <Label
                variant="soft"
                color="default"
                sx={{ fontWeight: 600, fontSize: '0.8rem' }}
              >
                Closed
              </Label>
            )}
          </Stack>

          {/* Subtitle details */}
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
            {branchName ? `${branchName} · ` : ''}started {fDateTime(event.startedAt)}
          </Typography>

          {/* Small Metric Cards for Safe, Missing, Not yet, Total */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 1,
              my: 0.5,
            }}
          >
            {/* Safe */}
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.08),
                border: (theme) => `1px solid ${varAlpha(theme.vars.palette.success.mainChannel, 0.24)}`,
                textAlign: 'center',
              }}
            >
              <Typography variant="subtitle1" sx={{ color: 'success.main', fontWeight: 700, lineHeight: 1.2 }}>
                {safe}
              </Typography>
              <Typography variant="caption" sx={{ color: 'success.darker', fontWeight: 600, fontSize: '0.7rem' }}>
                Safe
              </Typography>
            </Box>

            {/* Missing */}
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.08),
                border: (theme) => `1px solid ${varAlpha(theme.vars.palette.error.mainChannel, 0.24)}`,
                textAlign: 'center',
              }}
            >
              <Typography variant="subtitle1" sx={{ color: 'error.main', fontWeight: 700, lineHeight: 1.2 }}>
                {missing}
              </Typography>
              <Typography variant="caption" sx={{ color: 'error.darker', fontWeight: 600, fontSize: '0.7rem' }}>
                Missing
              </Typography>
            </Box>

            {/* Not yet */}
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: (theme) => varAlpha(theme.vars.palette.warning.mainChannel, 0.08),
                border: (theme) => `1px solid ${varAlpha(theme.vars.palette.warning.mainChannel, 0.24)}`,
                textAlign: 'center',
              }}
            >
              <Typography variant="subtitle1" sx={{ color: 'warning.main', fontWeight: 700, lineHeight: 1.2 }}>
                {unknown}
              </Typography>
              <Typography variant="caption" sx={{ color: 'warning.darker', fontWeight: 600, fontSize: '0.7rem' }}>
                Not yet
              </Typography>
            </Box>

            {/* Total */}
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
                border: (theme) => `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
                textAlign: 'center',
              }}
            >
              <Typography variant="subtitle1" sx={{ color: 'text.primary', fontWeight: 700, lineHeight: 1.2 }}>
                {total}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: '0.7rem' }}>
                Total
              </Typography>
            </Box>
          </Box>

          {/* Category Breakdown Chips - Black monochrome style */}
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.75} sx={{ pt: 0.25 }}>
            <Chip
              size="small"
              variant="outlined"
              label={`Staff: ${byKind?.staff?.safe ?? 0}/${byKind?.staff?.total ?? 0}`}
              sx={{
                fontWeight: 600,
                color: '#000000',
                borderColor: '#000000',
                bgcolor: (theme) =>
                  theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
              }}
            />
            <Chip
              size="small"
              variant="outlined"
              label={`Residents: ${byKind?.resident?.safe ?? 0}/${byKind?.resident?.total ?? 0}`}
              sx={{
                fontWeight: 600,
                color: '#000000',
                borderColor: '#000000',
                bgcolor: (theme) =>
                  theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
              }}
            />
            <Chip
              size="small"
              variant="outlined"
              label={`Visitors: ${byKind?.visitor?.safe ?? 0}/${byKind?.visitor?.total ?? 0}`}
              sx={{
                fontWeight: 600,
                color: '#000000',
                borderColor: '#000000',
                bgcolor: (theme) =>
                  theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
              }}
            />
            <Chip
              size="small"
              variant="outlined"
              label={`Contractors: ${byKind?.contractor?.safe ?? 0}/${byKind?.contractor?.total ?? 0}`}
              sx={{
                fontWeight: 600,
                color: '#000000',
                borderColor: '#000000',
                bgcolor: (theme) =>
                  theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
              }}
            />
          </Stack>

          {/* Close evacuation action button */}
          {isActive && (
            <Button
              fullWidth
              size="large"
              variant="contained"
              disabled={closing}
              onClick={() => onCloseEvacuation?.(event)}
              startIcon={closing && <CircularProgress size={16} color="inherit" />}
              sx={{
                bgcolor: '#000000',
                color: '#FFFFFF',
                fontWeight: 700,
                py: 1.2,
                borderRadius: 1,
                fontSize: '0.925rem',
                mt: 1,
                '&:hover': { bgcolor: '#1C252E' },
              }}
            >
              {closing ? 'Closing evacuation...' : 'Close evacuation'}
            </Button>
          )}
        </Stack>
      </Box>

      <Divider />

      {/* Filter Tabs */}
      <Box
        sx={{
          px: 2,
          boxShadow: (theme) =>
            `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
        }}
      >
        <Tabs value={statusFilter} onChange={handleStatusTabChange} sx={{ minHeight: 44 }}>
          <Tab
            value="all"
            label="All"
            iconPosition="end"
            sx={{ minHeight: 44, fontSize: '0.8rem' }}
            icon={
              <Label variant={statusFilter === 'all' ? 'filled' : 'soft'} color="default">
                {checks.length}
              </Label>
            }
          />
          <Tab
            value="missing"
            label="Missing"
            iconPosition="end"
            sx={{ minHeight: 44, fontSize: '0.8rem' }}
            icon={
              <Label variant={statusFilter === 'missing' ? 'filled' : 'soft'} color="error">
                {missing}
              </Label>
            }
          />
          <Tab
            value="unknown"
            label="Not yet"
            iconPosition="end"
            sx={{ minHeight: 44, fontSize: '0.8rem' }}
            icon={
              <Label variant={statusFilter === 'unknown' ? 'filled' : 'soft'} color="warning">
                {unknown}
              </Label>
            }
          />
          <Tab
            value="safe"
            label="Safe"
            iconPosition="end"
            sx={{ minHeight: 44, fontSize: '0.8rem' }}
            icon={
              <Label variant={statusFilter === 'safe' ? 'filled' : 'soft'} color="success">
                {safe}
              </Label>
            }
          />
        </Tabs>
      </Box>

      {/* Rollcall Cards List */}
      <Scrollbar sx={{ flex: 1 }}>
        <Stack spacing={1.5} sx={{ p: 2.5 }}>
          {loadingChecks ? (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress size={28} />
            </Box>
          ) : !filteredChecks.length ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 5, textAlign: 'center' }}>
              {statusFilter === 'all'
                ? 'No rollcall records found for this evacuation.'
                : `No persons marked as "${statusFilter}".`}
            </Typography>
          ) : (
            filteredChecks.map((check) => {
              const meta = EVAC_CHECK_STATUS[check.status] || EVAC_CHECK_STATUS.unknown;
              const personName =
                check.person?.name ||
                check.personName ||
                (check.person?.firstName
                  ? `${check.person.firstName} ${check.person.lastName || ''}`.trim()
                  : 'Unnamed Person');

              const locationText =
                check.person?.roomNumber
                  ? `Room ${check.person.roomNumber}`
                  : check.lastSeenLabel || check.locationLabel || '';

              const subtitle = [
                check.personKind
                  ? check.personKind.charAt(0).toUpperCase() + check.personKind.slice(1)
                  : '',
                locationText,
              ]
                .filter(Boolean)
                .join(' · ');

              return (
                <Box
                  key={check._id}
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    bgcolor: 'background.paper',
                    transition: (theme) =>
                      theme.transitions.create(['box-shadow', 'border-color']),
                    '&:hover': {
                      borderColor: 'text.disabled',
                    },
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: subtitle ? 0.5 : 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '0.95rem' }} noWrap>
                      {personName}
                    </Typography>

                    <Label variant="soft" color={meta.color} sx={{ fontWeight: 700 }}>
                      {meta.label}
                    </Label>
                  </Stack>

                  {subtitle && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                      {subtitle}
                    </Typography>
                  )}
                </Box>
              );
            })
          )}
        </Stack>
      </Scrollbar>
    </Drawer>
  );
}

EvacuationDetailDrawer.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  event: PropTypes.object,
  checks: PropTypes.array,
  stats: PropTypes.object,
  onUpdateCheck: PropTypes.func,
  onCloseEvacuation: PropTypes.func,
  loadingChecks: PropTypes.bool,
  closing: PropTypes.bool,
};