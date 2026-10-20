import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { fDate, fDateTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';

import { getShiftClaimStaffName } from './utils';
import { getShiftClaimStatusMeta, getShiftClaimVisibilityLabel } from './mocks/data';

// ----------------------------------------------------------------------

export function ShiftClaimTableRow({ row, serialNumber, onApprove, onSendToTempy, tempyConnected }) {
  const router = useRouter();

  const detailPath = paths.owner.shiftClaims.detail(row._id);

  const status = getShiftClaimStatusMeta(row.status);
  const canApprove = row.status === 'open' || row.status === 'pending';

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
      hidden: !canApprove,
      onClick: (event) => {
        event.stopPropagation();
        onApprove(row);
      },
    },
    {
      key: 'sendToTempy',
      icon: 'solar:global-bold',
      tooltip: 'Request via Tempy',
      color: 'info',
      hidden: !canApprove || !tempyConnected,
      onClick: (event) => {
        event.stopPropagation();
        onSendToTempy(row);
      },
    },
  ];

  return (
    <TableRow hover tabIndex={-1} sx={{ cursor: 'pointer' }} onClick={() => router.push(detailPath)}>
      <TableCell>{serialNumber}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
        {typeof row.branch === 'object' ? row.branch?.name : row.branch || '—'}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
        {getShiftClaimStaffName(row)}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDateTime(row.shift?.startsAt || row.startsAt)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDateTime(row.shift?.endsAt || row.endsAt)}</TableCell>

      <TableCell align="center">
        <Label variant="soft" color={status.color}>
          {status.label}
        </Label>
      </TableCell>

      <TableCell align="center" sx={{ textTransform: 'capitalize' }}>
        {row.decidedByUser?.name || '—'}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.createdAt)}</TableCell>

      <TableCell align="center">
        <Box onClick={(event) => event.stopPropagation()}>
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
}
