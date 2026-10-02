import dayjs from 'dayjs';
import { Avatar, Stack, TableCell, TableRow, Typography } from '@mui/material';
import { TableInfo } from './view/team-attendance-list-view';
import { AttendanceStatusChip } from 'src/sections/user/attendance-status-chip';
import { fDate } from 'src/utils/format-time';

const TeamAttendanceTableRow = ({ row, serialNumber }) => {
    const firstBreak = row.breaks?.[0];
    const formatTime = (value) => value ? dayjs(value).format('hh:mm A') : '—';
    const status = row.punctualityStatus === 'onTime' ? 'On time' : row.punctualityStatus || 'Unknown';
    const workedHours = `${Math.floor((row.workedMinutes || 0) / 60)}h ${(row.workedMinutes || 0) % 60}m`;
    return (
        <TableRow
            key={row.id}
            hover
        >
            <TableCell>{serialNumber}</TableCell>

            <TableCell>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar alt={row.name} src={row.image}>
                        {row.name?.charAt(0)}
                    </Avatar>

                    <Stack>
                        <Typography variant="body2" fontWeight={600}>
                            {row.staff?.name || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {row.staff?.email || '—'}
                        </Typography>
                    </Stack>
                </Stack>
            </TableCell>

            <TableCell align="center">
                <Typography variant="body2">
                    {fDate(row.workDate)}
                </Typography>
            </TableCell>

            <TableCell align="center">
                <TableInfo
                    icon="famicons:log-in"
                    color="success"
                    value={formatTime(row.clockInAt)}
                />
            </TableCell>

            <TableCell align="center">
                <TableInfo
                    icon="solar:logout-2-bold-duotone"
                    color="error"
                    value={formatTime(row.clockOutAt)}
                />
            </TableCell>

            <TableCell align="center">
                <TableInfo
                    icon="solar:tea-cup-bold"
                    color="warning"
                    value={formatTime(firstBreak?.breakInAt)}
                />
            </TableCell>

            <TableCell align="center">
                <TableInfo
                    icon="solar:play-bold-duotone"
                    color="info"
                    value={formatTime(firstBreak?.breakOutAt)}
                />
            </TableCell>

            <TableCell align="center">
                <TableInfo
                    icon="uim:clock"
                    color="success"
                    value={workedHours}
                />
            </TableCell>

            <TableCell align="center">
                <AttendanceStatusChip
                    status={status}
                />
            </TableCell>
        </TableRow>
    )
}

export default TeamAttendanceTableRow