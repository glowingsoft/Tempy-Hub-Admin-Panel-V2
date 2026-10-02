import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { fDate } from 'src/utils/format-time';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';
import { TableCellWithTooltip } from 'src/components/table';

import { getMembershipStatusMeta, getRoleLabel } from './mocks/data';

// ----------------------------------------------------------------------

export function MembershipTableRow({ row, serialNumber, onResend, onRevoke, onDelete }) {
  const router = useRouter();

  const detailPath = paths.owner.memberships.invitations.detail(row._id);
  const editPath = paths.owner.memberships.invitations.edit(row._id);

  const status = getMembershipStatusMeta(row.status);
  const departmentNames = (row.departments || []).map((dep) => dep.name).join(', ');

  const actions = [
    {
      key: 'view',
      icon: 'solar:eye-bold',
      tooltip: 'View',
      hidden: row.status === 'pending',
      onClick: () => router.push(detailPath),
    },
    {
      key: 'resend',
      icon: 'solar:refresh-bold',
      tooltip: 'Resend invitation',
      hidden: row.status !== 'pending',
      onClick: (event) => {
        event.stopPropagation();
        onResend(row);
      },
    },
    {
      key: 'edit',
      icon: 'solar:pen-bold',
      tooltip: 'Edit',
      hidden: row.status === 'revoked',
      onClick: (event) => {
        event.stopPropagation();
        router.push(editPath);
      },
    },
    {
      key: 'revoke',
      icon: 'solar:close-circle-bold',
      tooltip: 'Revoke invitation',
      color: 'error',
      hidden: row.status !== 'pending',
      onClick: (event) => {
        event.stopPropagation();
        onRevoke(row);
      },
    },
    {
      key: 'delete',
      icon: 'solar:trash-bin-trash-bold',
      tooltip: 'Delete',
      color: 'error',
      hidden: row.status !== 'revoked',
      onClick: (event) => {
        event.stopPropagation();
        onDelete(row);
      },
    },
  ];

  return (
    <TableRow hover tabIndex={-1} sx={{ cursor: 'pointer' }} onClick={() => router.push(detailPath)}>
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Stack sx={{ typography: 'body2' }}>
          <Link color="inherit" sx={{ cursor: 'pointer', fontWeight: 600 }}>
            {row.name || '—'}
          </Link>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {row.email || '—'}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{getRoleLabel(row.role)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.branch?.name || '—'}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.jobTitle?.name || '—'}</TableCell>

      <TableCellWithTooltip maxWidth={200}>{departmentNames || '—'}</TableCellWithTooltip>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.startDate)}</TableCell>

      <TableCell align="center">
        <Label variant="soft" color={status.color}>
          {status.label}
        </Label>
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
