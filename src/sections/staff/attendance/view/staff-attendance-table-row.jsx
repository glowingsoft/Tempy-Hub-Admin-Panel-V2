import dayjs from 'dayjs';
import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

function AttendanceTime({ value }) {
  return (
    <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
      {value ? dayjs(value).format('hh:mm A') : '—'}
    </Typography>
  );
}

function StaffAttendanceTableInfo({ icon, color, value }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        minWidth: 90,
      }}
    >
      <Label color={color} sx={{ borderRadius: 1 }}>
        <Iconify icon={icon} width={16} />
      </Label>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}

function getAttendanceStatus(row) {
  if (row.kind === 'leave' || row.presenceStatus === 'onLeave') {
    const leaveType = row.leaveType
      ? row.leaveType.charAt(0).toUpperCase() + row.leaveType.slice(1)
      : '';
    return { label: leaveType ? `On leave (${leaveType})` : 'On leave', color: 'secondary' };
  }

  const statuses = {
    onTime: { label: 'On time', color: 'success' },
    late: { label: 'Late', color: 'warning' },
    unscheduled: { label: 'Unscheduled', color: 'info' },
  };
  return (
    statuses[row.punctualityStatus] || {
      label: row.punctualityStatus || row.presenceStatus || 'Unknown',
      color: 'default',
    }
  );
}

AttendanceTime.propTypes = {
  value: PropTypes.string,
};

// ----------------------------------------------------------------------

export function StaffAttendanceTableRow({ row, serialNumber }) {
  const firstBreak = row.breaks?.[0];

  const formatTime = (value) => (value ? dayjs(value).format('hh:mm A') : '—');

  const workedHours =
    row.totalHours ||
    (row.workedMinutes != null
      ? `${Math.floor(row.workedMinutes / 60)}h ${row.workedMinutes % 60}m`
      : '—');
  const status = getAttendanceStatus(row);

  return (
    <TableRow hover>
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            alt={row.staff?.name || row.name}
            src={row.staff?.photoUrl || row.image}
            sx={{ width: 32, height: 32 }}
          >
            {(row.staff?.name || row.name || 'U').charAt(0)}
          </Avatar>
          <Stack>
            <Typography variant="caption" fontWeight={600}>
              {row.staff?.name || 'Unknown'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
              {row.staff?.email || '—'}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      <TableCell align="center">{dayjs(row.workDate).format('DD MMM YYYY')}</TableCell>

      <TableCell align="center">{row.branch?.name || '—'}</TableCell>

      <TableCell align="center">
        <StaffAttendanceTableInfo
          icon="famicons:log-in"
          color={row.clockInAt ? 'success' : 'default'}
          value={<AttendanceTime value={row.clockInAt} />}
        />
      </TableCell>

      <TableCell align="center">
        <StaffAttendanceTableInfo
          icon="solar:logout-2-bold-duotone"
          color={row.clockOutAt ? 'error' : 'default'}
          value={<AttendanceTime value={row.clockOutAt} />}
        />
      </TableCell>

      <TableCell align="center">
        <StaffAttendanceTableInfo
          icon="solar:tea-cup-bold"
          color={firstBreak?.breakInAt ? 'warning' : 'default'}
          value={formatTime(firstBreak?.breakInAt)}
        />
      </TableCell>

      <TableCell align="center">
        <StaffAttendanceTableInfo
          icon="solar:play-bold-duotone"
          color={firstBreak?.breakOutAt ? 'info' : 'default'}
          value={formatTime(firstBreak?.breakOutAt)}
        />
      </TableCell>

      <TableCell align="center">
        <StaffAttendanceTableInfo
          icon="uim:clock"
          color={row.workedMinutes > 0 ? 'success' : 'default'}
          value={workedHours}
        />
      </TableCell>

      <TableCell align="center">
        <Label color={status.color}>{status.label}</Label>
      </TableCell>

    </TableRow>
  );
}

StaffAttendanceTableRow.propTypes = {
  row: PropTypes.object,
  serialNumber: PropTypes.number,
};
