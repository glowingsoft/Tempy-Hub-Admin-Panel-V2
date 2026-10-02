
import { Avatar, Box, Stack, TableCell, TableRow, Typography } from '@mui/material';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { fDate } from 'src/utils/format-time';

export const STATUS_LABEL_COLOR = {
    overdue: 'error',
    due_soon: 'warning',
    booked: 'default',
};

export const STATUS_LABEL_TEXT = {
    overdue: 'Overdue',
    due_soon: 'Due soon',
    booked: 'Booked',
};

export function statusText(row) {
    if (row.status === 'overdue') return `${row.overdueDays} days overdue`;
    if (row.status === 'due_soon') return `Due ${row.nextDue}`;
    return `${row.nextDue}, booked`;
}

const SupervisionTableRow = ({ row, onLog, serialNumber }) => {

    const router = useRouter();
    const detailPath = paths.lineManager.supervisionDetail(row.id);

    const isBooked = row.status === 'booked';

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

    return (
        <TableRow hover tabIndex={-1} sx={{ cursor: 'pointer' }} onClick={() => router.push(detailPath)}>
            {/* Staff member */}

            <TableCell>{serialNumber}</TableCell>

            <TableCell>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar alt={row.name} src={row.avatar}>
                        {row.name?.charAt(0)}
                    </Avatar>
                    <Stack>
                        <Typography variant="body2" fontWeight={600}>
                            {row.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {row.role}
                        </Typography>
                    </Stack>
                </Stack>
            </TableCell>

            {/* Last session */}
            <TableCell>{row.lastSession ? fDate(row.lastSession) : '—'}</TableCell>

            {/* Next due */}
            <TableCell>
                <Typography
                    variant="body2"
                    color={row.status === 'overdue' ? 'error.main' : 'text.primary'}
                >
                    {statusText(row)}
                </Typography>
            </TableCell>

            {/* Status */}
            <TableCell align="center">
                <Label color={STATUS_LABEL_COLOR[row.status]}>{STATUS_LABEL_TEXT[row.status]}</Label>
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

export default SupervisionTableRow;