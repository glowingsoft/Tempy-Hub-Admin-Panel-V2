import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { fDate } from 'src/utils/format-time';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';

import { getLeaveRequestStaffName } from './utils';
import { getLeaveRequestStatusMeta, getLeaveTypeLabel } from './mocks/data';

// ----------------------------------------------------------------------

export function LeaveRequestTableRow({ row, serialNumber, detailHref, onApprove, onReject }) {
  const router = useRouter();

  const detailPath = detailHref(row._id);
  const status = getLeaveRequestStatusMeta(row.status);
  const isPending = row.status === 'pending';

  const actions = [
    {
      key: 'view',
      icon: 'solar:eye-bold',
      tooltip: 'View',
      onClick: () => router.push(detailPath),
    },
    {
      key: 'approve',
      icon: 'solar:check-circle-bold',
      tooltip: 'Approve',
      color: 'success',
      hidden: !isPending,
      onClick: (event) => {
        event.stopPropagation();
        onApprove(row);
      },
    },
    {
      key: 'reject',
      icon: 'solar:close-circle-bold',
      tooltip: 'Reject',
      color: 'error',
      hidden: !isPending,
      onClick: (event) => {
        event.stopPropagation();
        onReject(row);
      },
    },
  ];

  return (
    <TableRow hover tabIndex={-1} sx={{ cursor: 'pointer' }} onClick={() => router.push(detailPath)}>
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Stack sx={{ typography: 'body2' }}>
          <Link color="inherit" sx={{ cursor: 'pointer', fontWeight: 600 }}>
            {getLeaveRequestStaffName(row)}
          </Link>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {row.staff?.email || '—'}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.branch?.name || '—'}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{getLeaveTypeLabel(row.leaveType)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Stack>
          <Typography variant="body2">
            {fDate(row.startDate)} – {fDate(row.endDate)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {row.totalDays ?? '—'} day{row.totalDays === 1 ? '' : 's'}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell align="center">
        <Label variant="soft" color={status.color}>
          {status.label}
        </Label>
      </TableCell>

      <TableCell align="center">
        <Box onClick={(event) => event.stopPropagation()}>
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
}
