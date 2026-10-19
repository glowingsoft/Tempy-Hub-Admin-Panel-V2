import Box from '@mui/material/Box';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { fDate, fDateTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';

import { getShiftStaffName } from './utils';
import { getShiftStatusMeta, getShiftVisibilityLabel } from './mocks/data';

// ----------------------------------------------------------------------

export function ShiftTableRow({ row, serialNumber }) {
  const router = useRouter();

  const rowOrgId = row?.organizationId?._id || row?.organizationId || '';
  const detailPath = rowOrgId
    ? `${paths.owner.shifts.detail(row._id)}?orgId=${rowOrgId}`
    : paths.owner.shifts.detail(row._id);
  const editPath = rowOrgId
    ? `${paths.owner.shifts.edit(row._id)}?orgId=${rowOrgId}`
    : paths.owner.shifts.edit(row._id);

  const status = getShiftStatusMeta(row.status);

  const actions = [
    {
      key: 'view',
      icon: 'solar:eye-bold',
      tooltip: 'View',
      onClick: () => router.push(detailPath),
    },
    {
      key: 'edit',
      icon: 'solar:pen-bold',
      tooltip: 'Edit',
      hidden: row.status === 'cancelled',
      onClick: (event) => {
        event.stopPropagation();
        router.push(editPath);
      },
    },
  ];

  return (
    <TableRow hover tabIndex={-1} sx={{ cursor: 'pointer' }} onClick={() => router.push(detailPath)}>
      <TableCell>{serialNumber}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {row.branch?.name || (typeof row.branchId === 'object' && row.branchId?.name) || '—'}
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{getShiftStaffName(row)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDateTime(row.startsAt)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDateTime(row.endsAt)}</TableCell>

      <TableCell align="center">
        <Label variant="soft" color={status.color}>
          {status.label}
        </Label>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{getShiftVisibilityLabel(row.visibility)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.createdAt)}</TableCell>

      <TableCell align="center">
        <Box onClick={(event) => event.stopPropagation()}>
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
}
