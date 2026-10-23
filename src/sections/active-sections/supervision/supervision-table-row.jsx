import PropTypes from 'prop-types';
import { Avatar, Box, Stack, TableCell, TableRow, Typography } from '@mui/material';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';
import { usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { fDate, fDateTime } from 'src/utils/format-time';

export const STATUS_LABEL_COLOR = {
    overdue: 'error',
    due_soon: 'warning',
    dueSoon: 'warning',
    booked: 'info',
    scheduled: 'info',
    notYetDue: 'success',
    not_yet_due: 'success',
    completed: 'success',
    cancelled: 'default',
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
    cancelled: 'Cancelled',
};

export function getRowStatus(row) {
    return row.badge || row.upcoming?.status || row.status || 'notYetDue';
}

export function statusText(row) {
    const scheduledDate = row.scheduledAt || row.nextDueAt || row.upcoming?.scheduledAt || row.nextDue;
    if (scheduledDate) {
        return fDateTime(scheduledDate);
    }
    if (row.overdueDays) return `${row.overdueDays} days overdue`;
    return '—';
}

const SupervisionTableRow = ({ row, onLog, onComplete, onSignOff, serialNumber }) => {
    const router = useRouter();
    const pathname = usePathname();
    const rowId = row._id || row.id || row.staffId;

    let detailPath = paths.lineManager.supervisionDetail(rowId);
    let signOffPath = paths.lineManager.supervisionSignOff(rowId);
    if (pathname.startsWith('/site-manager')) {
        detailPath = paths.siteManager.supervisionDetail(rowId);
        signOffPath = paths.siteManager.supervisionSignOff(rowId);
    } else if (pathname.startsWith('/owner-dashboard')) {
        detailPath = paths.owner.supervisionDetail(rowId);
        signOffPath = paths.owner.supervisionSignOff(rowId);
    }

    const currentStatus = getRowStatus(row);
    const isCompleted = currentStatus === 'completed';
    const isSignedOff = Boolean(row.signedOff || row.signature);
    const isBooked = currentStatus === 'booked' || currentStatus === 'scheduled' || !!row.upcoming;

    const isLineManager = pathname.startsWith('/line-manager');
    const canComplete = !isLineManager && !isCompleted;

    const actions = [
        ...(!isCompleted
            ? [
                  {
                      key: isBooked ? 'reschedule' : 'book',
                      icon: isBooked ? 'solar:calendar-mark-bold' : 'solar:calendar-add-bold',
                      tooltip: isBooked ? 'Reschedule' : 'Book supervision',
                      color: 'default',
                      onClick: (event) => {
                          event.stopPropagation();
                          onLog();
                      },
                  },
              ]
            : []),
        ...(canComplete
            ? [
                  {
                      key: 'complete',
                      icon: 'solar:check-circle-bold',
                      tooltip: 'Complete session',
                      color: 'success',
                      onClick: (event) => {
                          event.stopPropagation();
                          onComplete?.();
                      },
                  },
              ]
            : []),
        ...(isCompleted
            ? [
                  {
                      key: 'signOff',
                      icon: isSignedOff ? 'solar:document-text-bold' : 'solar:pen-bold',
                      tooltip: isSignedOff ? 'View signed document' : 'Sign off session',
                      color: isSignedOff ? 'default' : 'primary',
                      onClick: (event) => {
                          event.stopPropagation();
                          if (onSignOff) {
                              onSignOff(row);
                          } else {
                              router.push(signOffPath);
                          }
                      },
                  },
              ]
            : []),
        {
            key: 'view',
            icon: 'solar:eye-bold',
            tooltip: 'View history',
            color: 'default',
            onClick: () => router.push(detailPath),
        },
    ];

    const staffObj =
        (typeof row.staff === 'object' ? row.staff : null) ||
        (typeof row.staffProfile === 'object' ? row.staffProfile : null) ||
        (typeof row.staffId === 'object' ? row.staffId : null) ||
        (typeof row.user === 'object' ? row.user : null) ||
        (typeof row.userId === 'object' ? row.userId : null) ||
        {};

    const staffUser =
        (typeof staffObj.user === 'object' ? staffObj.user : null) ||
        (typeof staffObj.userId === 'object' ? staffObj.userId : null) ||
        {};

    // Extract name without using IDs or string object IDs
    const rawStaffName =
        row.name ||
        row.staffName ||
        staffObj.name ||
        staffUser.name ||
        (typeof row.userId === 'object' ? row.userId?.name : null) ||
        (typeof row.user === 'object' ? row.user?.name : null);

    const isMongoId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);

    const staffName =
        rawStaffName && !isMongoId(rawStaffName)
            ? rawStaffName
            : staffObj.employeeCode || row.employeeCode || '—';

    const staffEmail =
        staffObj.email ||
        staffUser.email ||
        row.email ||
        '';

    const subText =
        staffEmail ||
        staffObj.employeeCode ||
        row.employeeCode ||
        '';

    const lastSessionDate = row.completedAt || row.lastCompletedAt || row.lastSession;

    return (
        <TableRow hover tabIndex={-1} sx={{ cursor: 'pointer' }} onClick={() => router.push(detailPath)}>
            {/* Sr# */}
            <TableCell>{serialNumber}</TableCell>

            {/* Staff member */}
            <TableCell>
                <Stack>
                    <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
                        {staffName}
                    </Typography>
                    {subText && (
                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'none' }}>
                            {subText}
                        </Typography>
                    )}
                </Stack>
            </TableCell>

            {/* Created at */}
            <TableCell>
                <Typography variant="body2" color="text.primary">
                    {row.createdAt ? fDateTime(row.createdAt) : '—'}
                </Typography>
            </TableCell>

            {/* Last session */}
            <TableCell>{lastSessionDate ? fDate(lastSessionDate) : '—'}</TableCell>

            {/* Next due */}
            <TableCell>
                <Typography variant="body2" color="text.primary">
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
    onComplete: PropTypes.func,
    onSignOff: PropTypes.func,
    serialNumber: PropTypes.number,
};

export default SupervisionTableRow;