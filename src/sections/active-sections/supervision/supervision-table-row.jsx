import PropTypes from 'prop-types';
import { Avatar, Box, Stack, TableCell, TableRow, Typography } from '@mui/material';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { fDate } from 'src/utils/format-time';

export const STATUS_LABEL_COLOR = {
    overdue: 'error',
    due_soon: 'warning',
    dueSoon: 'warning',
    booked: 'info',
    scheduled: 'info',
    notYetDue: 'success',
    not_yet_due: 'success',
    completed: 'success',
};

export const STATUS_LABEL_TEXT = {
    overdue: 'Overdue',
    due_soon: 'Due soon',
    dueSoon: 'Due soon',
    booked: 'Booked',
    scheduled: 'Scheduled',
    notYetDue: 'Not yet due',
    not_yet_due: 'Not yet due',
    completed: 'Completed',
};

export function getRowStatus(row) {
    return row.badge || row.upcoming?.status || row.status || 'notYetDue';
}

export function statusText(row) {
    if (row.overdueDays) return `${row.overdueDays} days overdue`;
    const nextDate = row.nextDueAt || row.upcoming?.scheduledAt || row.nextDue;
    if (nextDate) {
        return fDate(nextDate);
    }
    return '—';
}

const SupervisionTableRow = ({ row, onLog, serialNumber }) => {
    const router = useRouter();
    const rowId = row.staffId || row._id || row.id;
    const detailPath = paths.lineManager.supervisionDetail(rowId);

    const currentStatus = getRowStatus(row);
    const isBooked = currentStatus === 'booked' || currentStatus === 'scheduled' || !!row.upcoming;

    const actions = [
        {
            key: isBooked ? 'reschedule' : 'book',
            icon: isBooked ? 'solar:calendar-mark-bold' : 'solar:calendar-add-bold',
            tooltip: isBooked ? 'Reschedule' : 'Book session',
            color: 'default',
            onClick: (event) => {
                event.stopPropagation();
                onLog();
            },
        },
        {
            key: 'view',
            icon: 'solar:eye-bold',
            tooltip: 'View history',
            color: 'default',
            onClick: () => router.push(detailPath),
        },
    ];

    const staffName = row.name || '—';
    const staffAvatar = row.image || row.avatar;
    const subText = row.employeeCode || row.email || row.role || '';
    const lastSessionDate = row.lastCompletedAt || row.lastSession;

    return (
        <TableRow hover tabIndex={-1} sx={{ cursor: 'pointer' }} onClick={() => router.push(detailPath)}>
            {/* Sr# */}
            <TableCell>{serialNumber}</TableCell>

            {/* Staff member */}
            <TableCell>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar alt={staffName} src={staffAvatar}>
                        {staffName?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Stack>
                        <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                            {staffName}
                        </Typography>
                        {subText && (
                            <Typography variant="caption" color="text.secondary">
                                {subText}
                            </Typography>
                        )}
                    </Stack>
                </Stack>
            </TableCell>

            {/* Last session */}
            <TableCell>{lastSessionDate ? fDate(lastSessionDate) : '—'}</TableCell>

            {/* Next due */}
            <TableCell>
                <Typography
                    variant="body2"
                    color={currentStatus === 'overdue' ? 'error.main' : 'text.primary'}
                >
                    {statusText(row)}
                </Typography>
            </TableCell>

            {/* Status */}
            <TableCell align="center">
                <Label color={STATUS_LABEL_COLOR[currentStatus] || 'default'}>
                    {STATUS_LABEL_TEXT[currentStatus] || currentStatus}
                </Label>
            </TableCell>

            {/* Actions */}
            <TableCell align="center">
                <Box
                    onClick={(event) => event.stopPropagation()}
                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                    <GenericTableRowActions actions={actions} />
                </Box>
            </TableCell>
        </TableRow>
    );
};

SupervisionTableRow.propTypes = {
    row: PropTypes.object,
    onLog: PropTypes.func,
    serialNumber: PropTypes.number,
};

export default SupervisionTableRow;