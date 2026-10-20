import dayjs from 'dayjs';

import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { AttendanceStatusChip } from 'src/sections/user/attendance-status-chip';

import { TableInfo } from '../components/table-info';
import { getPunctualityLabel } from '../utils';

// ----------------------------------------------------------------------

function formatTime(value) {
  return value ? dayjs(value).format('hh:mm A') : '—';
}

function getRowStatus(row) {
  if (row?.kind === 'leave' || row?.presenceStatus === 'onLeave') {
    return row.leaveType ? `On leave (${row.leaveType})` : 'On leave';
  }
  return getPunctualityLabel(row?.punctualityStatus);
}

export function AttendanceTableRow({ row, serialNumber, onViewRow }) {
  const isLeave = row?.kind === 'leave' || row?.presenceStatus === 'onLeave';
  const canView = !isLeave && Boolean(row?._id || row?.id);
  const firstBreak = row.breaks?.[0];
  const name = row.staff?.name || row.name || 'Unknown';

  const handleView = () => {
    if (!canView) return;
    onViewRow?.(row);
  };

  return (
    <TableRow
      hover={canView}
      sx={{ cursor: canView ? 'pointer' : 'default' }}
      onClick={handleView}
    >
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar alt={name} src={row.staff?.photoUrl || undefined} sx={{ width: 36, height: 36, fontSize: 16, textTransform: 'capitalize' }}>
            {name?.charAt(0)}
          </Avatar>

          <Stack>
            <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
              {name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.staff?.email || '—'}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      <TableCell align="center">
        <Typography variant="body2">{fDate(row.workDate)}</Typography>
      </TableCell>

      <TableCell align="center">
        <TableInfo icon="famicons:log-in" color="success" value={isLeave ? '—' : formatTime(row.clockInAt)} />
      </TableCell>

      <TableCell align="center">
        <TableInfo
          icon="solar:logout-2-bold-duotone"
          color="error"
          value={isLeave ? '—' : formatTime(row.clockOutAt)}
        />
      </TableCell>

      <TableCell align="center">
        <TableInfo
          icon="solar:tea-cup-bold"
          color="warning"
          value={isLeave ? '—' : formatTime(firstBreak?.breakInAt)}
        />
      </TableCell>

      <TableCell align="center">
        <TableInfo
          icon="solar:play-bold-duotone"
          color="info"
          value={isLeave ? '—' : formatTime(firstBreak?.breakOutAt)}
        />
      </TableCell>

      <TableCell align="center">
        <TableInfo icon="uim:clock" color="success" value={row.totalHours || '—'} />
      </TableCell>

      <TableCell align="center">
        <AttendanceStatusChip status={getRowStatus(row)} />
      </TableCell>

      <TableCell align="center" onClick={(event) => event.stopPropagation()}>
        {canView && (
          <Tooltip title="View Details">
            <IconButton size="small" onClick={handleView}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>
        )}
      </TableCell>
    </TableRow>
  );
}
