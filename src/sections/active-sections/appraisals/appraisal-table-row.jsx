import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';
import { usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export const APPRAISAL_STATUS_COLOR = {
  overdue: 'error',
  due_soon: 'warning',
  dueSoon: 'warning',
  booked: 'info',
  scheduled: 'info',
  notYetDue: 'success',
  not_yet_due: 'success',
  completed: 'success',
};

export const APPRAISAL_STATUS_LABEL = {
  overdue: 'Overdue',
  due_soon: 'Due Soon',
  dueSoon: 'Due Soon',
  booked: 'Scheduled',
  scheduled: 'Scheduled',
  notYetDue: 'Not Yet Due',
  not_yet_due: 'Not Yet Due',
  completed: 'Completed',
};

export function getAppraisalRowStatus(row) {
  return row?.badge || row?.upcoming?.status || row?.status || 'notYetDue';
}

export function appraisalStatusText(row) {
  if (row?.overdueDays) return `${row.overdueDays} days overdue`;
  const nextDate = row?.nextDueAt || row?.nextDue || row?.upcoming?.scheduledAt || row?.scheduledAt;
  if (nextDate) {
    return fDate(nextDate);
  }
  return '—';
}

// ----------------------------------------------------------------------

export default function AppraisalTableRow({ row, serialNumber, onBook, onComplete, onSignOff, basePath }) {
  const router = useRouter();
  const pathname = usePathname();
  const rowId = row?._id || row?.id || row?.staffId;

  let detailPath = paths.lineManager.appraisalDetail(rowId);
  let signOffPath = paths.lineManager.appraisalSignOff(rowId);
  if (basePath) {
    detailPath = `${basePath}/${rowId}`;
    signOffPath = `${basePath}/${rowId}/sign-off`;
  } else if (pathname.startsWith('/site-manager')) {
    detailPath = paths.siteManager.appraisalDetail(rowId);
    signOffPath = paths.siteManager.appraisalSignOff(rowId);
  } else if (pathname.startsWith('/owner-dashboard')) {
    detailPath = paths.owner.appraisalDetail(rowId);
    signOffPath = paths.owner.appraisalSignOff(rowId);
  }

  const currentStatus = getAppraisalRowStatus(row);
  const isCompleted = currentStatus === 'completed';
  const isSignedOff = Boolean(row?.signedOff || row?.signature);
  const isScheduled = currentStatus === 'booked' || currentStatus === 'scheduled' || !!row?.upcoming;
  const canComplete = isScheduled && !isCompleted;

  const isMongoId = (val) => typeof val === 'string' && /^[0-9a-fA-F]{24}$/.test(val);

  const rawStaffName =
    row?.name ||
    row?.staffName ||
    row?.staff?.name ||
    (typeof row?.staffId === 'object' ? row?.staffId?.name : null) ||
    row?.userId?.name ||
    row?.user?.name;

  const staffName =
    rawStaffName && !isMongoId(rawStaffName)
      ? rawStaffName
      : row?.employeeCode || row?.staff?.employeeCode || '—';

  const staffEmail =
    row?.staff?.email ||
    (typeof row?.staffId === 'object' ? row?.staffId?.email : null) ||
    row?.userId?.email ||
    row?.user?.email ||
    row?.email ||
    '';

  const subText =
    staffEmail ||
    row?.employeeCode ||
    row?.role ||
    row?.department ||
    '';

  const lastReviewDate = row?.lastReview || row?.lastCompletedAt || row?.completedAt;
  const period = row?.period || row?.periodLabel || 'Annual Review';

  const actions = [
    ...(!isCompleted
      ? [
          {
            key: isScheduled ? 'reschedule' : 'book',
            icon: isScheduled ? 'solar:calendar-mark-bold' : 'solar:calendar-add-bold',
            tooltip: isScheduled ? 'Reschedule Appraisal' : 'Book Appraisal',
            color: 'primary',
            onClick: (event) => {
              event.stopPropagation();
              onBook?.(row);
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
              onComplete?.(row);
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
      tooltip: 'View Details',
      color: 'default',
      onClick: () => router.push(detailPath),
    },
  ];

  return (
    <TableRow
      hover
      tabIndex={-1}
      sx={{ cursor: 'pointer' }}
      onClick={() => router.push(detailPath)}
    >
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Stack>
          <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize', '&:hover': { textDecoration: 'underline' } }}>
            {staffName}
          </Typography>
          {subText && (
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'none' }}>
              {subText}
            </Typography>
          )}
        </Stack>
      </TableCell>

      <TableCell>{period}</TableCell>

      <TableCell>{lastReviewDate ? fDate(lastReviewDate) : '—'}</TableCell>

      <TableCell>
        <Typography
          variant="body2"
          color={currentStatus === 'overdue' ? 'error.main' : 'text.primary'}
        >
          {appraisalStatusText(row)}
        </Typography>
      </TableCell>

      <TableCell align="center">
        <Label variant="soft" color={APPRAISAL_STATUS_COLOR[currentStatus] || 'default'}>
          {APPRAISAL_STATUS_LABEL[currentStatus] || currentStatus}
        </Label>
      </TableCell>

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
}

AppraisalTableRow.propTypes = {
  row: PropTypes.object,
  serialNumber: PropTypes.number,
  onBook: PropTypes.func,
  onComplete: PropTypes.func,
  onSignOff: PropTypes.func,
  basePath: PropTypes.string,
};