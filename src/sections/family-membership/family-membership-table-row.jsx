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

import {
  getFamilyMembershipStatusMeta,
  getFamilyMemberStatusMeta,
  getFamilyRoleLabel,
} from './mocks/data';

// ----------------------------------------------------------------------
// Invitation Table Row
// ----------------------------------------------------------------------

export function FamilyMembershipTableRow({
  row,
  serialNumber,
  onResend,
  onRevoke,
  onDelete,
  detailPath,
  editPath,
}) {
  const router = useRouter();

  const status = getFamilyMembershipStatusMeta(row.status);
  const roleLabel = getFamilyRoleLabel(row.role);

  const actions = [
    {
      key: 'view',
      icon: 'solar:eye-bold',
      tooltip: 'View details',
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
    <TableRow
      hover
      tabIndex={-1}
      sx={{ cursor: 'pointer' }}
      onClick={() => router.push(detailPath)}
    >
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

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body2">{row.relationship || 'Family'}</Typography>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Stack spacing={0.25}>
          <Typography variant="body2">{row.residentName || '—'}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Room {row.room || '—'} · {row.branch || '—'}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body2">{roleLabel}</Typography>
      </TableCell>

      <TableCell align="center">
        <Label variant="soft" color={status.color}>
          {status.label}
        </Label>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body2">{fDate(row.createdAt)}</Typography>
      </TableCell>

      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
        <GenericTableRowActions actions={actions} />
      </TableCell>
    </TableRow>
  );
}

// ----------------------------------------------------------------------
// Member Table Row
// ----------------------------------------------------------------------

export function FamilyMemberTableRow({
  row,
  serialNumber,
  onDeactivate,
  onDelete,
  detailPath,
  editPath,
}) {
  const router = useRouter();

  const status = getFamilyMemberStatusMeta(row.status);
  const roleLabel = getFamilyRoleLabel(row.role);
  const isActive = row.status === 'active';

  const actions = [
    {
      key: 'view',
      icon: 'solar:eye-bold',
      tooltip: 'View details',
      onClick: () => router.push(detailPath),
    },
    {
      key: 'edit',
      icon: 'solar:pen-bold',
      tooltip: 'Edit details',
      onClick: (event) => {
        event.stopPropagation();
        router.push(editPath);
      },
    },
    {
      key: 'deactivate',
      icon: isActive ? 'solar:user-block-bold' : 'solar:user-check-bold',
      tooltip: isActive ? 'Deactivate member' : 'Reactivate member',
      color: isActive ? 'warning' : 'success',
      onClick: (event) => {
        event.stopPropagation();
        onDeactivate(row);
      },
    },
    {
      key: 'delete',
      icon: 'solar:trash-bin-trash-bold',
      tooltip: 'Delete',
      color: 'error',
      onClick: (event) => {
        event.stopPropagation();
        onDelete(row);
      },
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
        <Stack sx={{ typography: 'body2' }}>
          <Link color="inherit" sx={{ cursor: 'pointer', fontWeight: 600 }}>
            {row.name || '—'}
          </Link>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {row.email || '—'}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body2">{row.relationship || 'Family'}</Typography>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Stack spacing={0.25}>
          <Typography variant="body2">{row.residentName || '—'}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Room {row.room || '—'} · {row.branch || '—'}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body2">{roleLabel}</Typography>
      </TableCell>

      <TableCell align="center">
        <Label variant="soft" color={status.color}>
          {status.label}
        </Label>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body2">{fDate(row.createdAt)}</Typography>
      </TableCell>

      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
        <GenericTableRowActions actions={actions} />
      </TableCell>
    </TableRow>
  );
}