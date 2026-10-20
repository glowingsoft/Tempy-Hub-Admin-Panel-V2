import dayjs from 'dayjs';
import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

import { AttendanceStatusChip } from 'src/sections/user/attendance-status-chip';
import { TableInfo } from 'src/sections/active-sections/team-attendance/components/table-info';

// ----------------------------------------------------------------------

function AttendanceTime({ value, workDate }) {
  return (
    <Stack spacing={0.25} alignItems="center">
      <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
        {value ? dayjs(value).format('hh:mm A') : '—'}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, lineHeight: 1.2 }}>
        {dayjs(workDate).format('DD MMM YYYY')}
      </Typography>
    </Stack>
  );
}

AttendanceTime.propTypes = {
  value: PropTypes.string,
  workDate: PropTypes.string,
};

// ----------------------------------------------------------------------

const STATUS_MAP = {
  onTime: 'On time',
  late: 'Late',
  absent: 'Absent',
  sick: 'Sick Leave',
};

export function StaffAttendanceTableRow({ row, serialNumber }) {
  const firstBreak = row.breaks?.[0];

  const formatTime = (value) => (value ? dayjs(value).format('hh:mm A') : '—');

  const statusLabel = STATUS_MAP[row.punctualityStatus] || row.punctualityStatus || 'Unknown';
  const workedHours = `${Math.floor((row.workedMinutes || 0) / 60)}h ${(row.workedMinutes || 0) % 60}m`;

  return (
    <TableRow hover>
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar alt={row.staff?.name || row.name} src={row.image} sx={{ width: 32, height: 32 }}>
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

      <TableCell align="center">
        <TableInfo
          icon="famicons:log-in"
          color={row.clockInAt ? 'success' : 'default'}
          value={<AttendanceTime value={row.clockInAt} workDate={row.workDate} />}
        />
      </TableCell>

      <TableCell align="center">
        <TableInfo
          icon="solar:logout-2-bold-duotone"
          color={row.clockOutAt ? 'error' : 'default'}
          value={<AttendanceTime value={row.clockOutAt} workDate={row.workDate} />}
        />
      </TableCell>

      <TableCell align="center">
        <TableInfo
          icon="solar:tea-cup-bold"
          color={firstBreak?.breakInAt ? 'warning' : 'default'}
          value={formatTime(firstBreak?.breakInAt)}
        />
      </TableCell>

      <TableCell align="center">
        <TableInfo
          icon="solar:play-bold-duotone"
          color={firstBreak?.breakOutAt ? 'info' : 'default'}
          value={formatTime(firstBreak?.breakOutAt)}
        />
      </TableCell>

      <TableCell align="center">
        <TableInfo
          icon="uim:clock"
          color={row.workedMinutes > 0 ? 'success' : 'default'}
          value={workedHours}
        />
      </TableCell>

      <TableCell align="center">
        {row.note ? (
          <Tooltip title={row.note} arrow placement="top">
            <Box component="span" sx={{ display: 'inline-block' }}>
              <AttendanceStatusChip status={statusLabel} />
            </Box>
          </Tooltip>
        ) : (
          <AttendanceStatusChip status={statusLabel} />
        )}
      </TableCell>
    </TableRow>
  );
}

StaffAttendanceTableRow.propTypes = {
  row: PropTypes.object,
  serialNumber: PropTypes.number,
};
