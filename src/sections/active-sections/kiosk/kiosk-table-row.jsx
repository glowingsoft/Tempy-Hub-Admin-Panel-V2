import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box } from '@mui/material';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';

// ----------------------------------------------------------------------

export function KioskTableRow({ row, serialNumber, onEditRow, onViewRow }) {
  const statusColor =
    row.status === 'online'
      ? 'success'
      : row.status === 'offline'
        ? 'error'
        : 'warning';

  const setupColor =
    row.setupStatus === 'registered'
      ? 'success'
      : row.setupStatus === 'pending'
        ? 'warning'
        : 'error';

  const actions = [
    {
      key: 'view',
      icon: 'solar:eye-bold',
      tooltip: 'View details',
      onClick: onViewRow,
    },
    {
      key: 'edit',
      icon: 'solar:pen-bold',
      tooltip: 'Edit',
      onClick: onEditRow,
    },
  ];

  return (
    <TableRow hover onClick={onViewRow} sx={{ cursor: 'pointer' }}>
      {/* Sr # */}
      <TableCell onClick={(e) => e.stopPropagation()}>
        {serialNumber}
      </TableCell>

      {/* Kiosk */}
      <TableCell>
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

          <Stack>
            <Typography variant="subtitle2">
              {row.name}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              {row.kioskCode}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      {/* Device */}
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify
            icon={
              row.device?.type === 'ipad'
                ? 'solar:tablet-bold'
                : 'solar:monitor-bold'
            }
            width={20}
          />

          <Stack>
            <Typography variant="body2">
              {row.device?.name || '—'}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ textTransform: 'capitalize' }}
            >
              {row.device?.type || '—'}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      {/* Site */}
      <TableCell>
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify
            icon="solar:buildings-2-bold"
            width={18}
            color="text.secondary"
          />

          <Stack>
            <Typography variant="body2">
              {row.site?.name || row.site || '—'}
            </Typography>

            {row.site?.code && (
              <Typography
                variant="caption"
                color="text.secondary"
              >
                {row.site.code}
              </Typography>
            )}
          </Stack>
        </Stack>
      </TableCell>

      {/* Setup Status */}
      <TableCell align="center">
        <Stack spacing={0.5} alignItems="center">
          <Label color={setupColor}>
            {row.setupStatus === 'registered'
              ? 'Registered'
              : row.setupStatus === 'pending'
                ? 'Pending Setup'
                : 'Not Registered'}
          </Label>

          {row.registrationDate && (
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {row.registrationDate}
            </Typography>
          )}
        </Stack>
      </TableCell>

      {/* Online Status */}
      <TableCell align="center">
        <Label color={statusColor}>
          {row.status}
        </Label>
      </TableCell>

      {/*
      <TableCell>
        Last Seen
      </TableCell>

      <TableCell>
        Activity
      </TableCell>
      */}

      {/* Actions */}
      <TableCell
        align="center"
        onClick={(e) => e.stopPropagation()}
      >
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
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
};