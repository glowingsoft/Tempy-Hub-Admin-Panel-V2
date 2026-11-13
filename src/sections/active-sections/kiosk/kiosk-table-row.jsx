import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';

import { isKioskLocked } from './kiosk-lock-utils';

// ----------------------------------------------------------------------

export function KioskTableRow({ row, serialNumber, onEditRow, onViewRow, onLockRow }) {
  const presence = row.presence || row.status || 'offline';
  const statusColor = presence === 'online' ? 'success' : 'error';
  const kioskMode = String(row.kioskMode || '').trim().toLowerCase();
  const kioskModeLabel =
    kioskMode === 'locked' ? 'Locked' : kioskMode === 'setup' ? 'Setup' : 'Unknown';
  const kioskModeColor =
    kioskMode === 'locked' ? 'error' : kioskMode === 'setup' ? 'info' : 'default';

  const setupColor =
    row.setupStatus === 'registered'
      ? 'success'
      : row.setupStatus === 'pending'
        ? 'warning'
        : 'default';

  const isLocked = isKioskLocked(row);

  const actions = [
    ...(onLockRow
      ? [
          {
            key: 'lock',
            icon: isLocked ? 'solar:lock-bold' : 'solar:lock-unlocked-bold',
            tooltip: isLocked ? 'Unlock device' : 'Lock device',
            color: isLocked ? 'error' : 'default',
            onClick: onLockRow,
          },
        ]
      : []),
    {
      key: 'view',
      icon: 'solar:eye-bold',
      tooltip: 'View details',
      onClick: onViewRow,
    },
    ...(onEditRow
      ? [
          {
            key: 'edit',
            icon: 'solar:pen-bold',
            tooltip: 'Edit',
            onClick: onEditRow,
          },
        ]
      : []),
  ];

  const kioskTitle = row.name || row.locationLabel || row.receptionIdentifier || row.deviceId || 'Kiosk';
  const kioskSubtitle = row.deviceId || row.kioskCode || row.receptionIdentifier || '';

  const deviceName = row.device?.name || row.deviceId || '—';
  const deviceType = row.deviceType || row.device?.type || row.kioskMode || '—';

  const branchName = row.branch?.name || row.site?.name || row.site || '—';
  const branchCode = row.branch?.code || row.site?.code || '';

  return (
    <TableRow hover onClick={onViewRow} sx={{ cursor: 'pointer' }}>
      {/* Sr # */}
      <TableCell onClick={(e) => e.stopPropagation()} sx={{ width: 60 }}>
        {serialNumber}
      </TableCell>

      {/* Kiosk */}
      <TableCell sx={{ minWidth: 220 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.lighter',
              color: 'primary.main',
            }}
          >
            <Iconify icon="solar:monitor-bold" />
          </Avatar>

          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              {kioskTitle}
            </Typography>

            {kioskSubtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
              >
                {kioskSubtitle}
              </Typography>
            )}
          </Stack>
        </Stack>
      </TableCell>

      {/* Device */}
      <TableCell sx={{ minWidth: 170 }}>
        <Typography variant="body2" noWrap>
          {deviceName || '—'}
        </Typography>
      </TableCell>

      {/* Site */}
      <TableCell sx={{ minWidth: 220 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify
            icon="solar:buildings-2-bold"
            width={18}
            color="text.secondary"
          />

          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap>
              {branchName}
            </Typography>

            {branchCode && (
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
              >
                {branchCode}
              </Typography>
            )}
          </Stack>
        </Stack>
      </TableCell>

      {/* Setup Status */}
      <TableCell align="center" sx={{ minWidth: 140 }}>
        <Label variant="soft" color={setupColor} sx={{ textTransform: 'capitalize' }}>
          {row.setupStatus || 'Unknown'}
        </Label>
      </TableCell>

      {/* Kiosk Mode */}
      <TableCell align="center" sx={{ minWidth: 140 }}>
        <Label variant="soft" color={kioskModeColor}>
          {kioskModeLabel}
        </Label>
      </TableCell>

      {/* Presence / Status */}
      <TableCell align="center" sx={{ width: 120 }}>
        <Label variant="soft" color={statusColor} sx={{ textTransform: 'capitalize' }}>
          {presence}
        </Label>
      </TableCell>

      {/* Actions */}
      <TableCell
        align="center"
        sx={{ width: 100 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
}

// ----------------------------------------------------------------------

KioskTableRow.propTypes = {
  row: PropTypes.object,
  serialNumber: PropTypes.number,
  onEditRow: PropTypes.func,
  onViewRow: PropTypes.func,
  onLockRow: PropTypes.func,
};