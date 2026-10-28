import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';
import { fDate } from 'src/utils/format-time';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';

import { getFamilyInvitationStatusMeta, getRelationshipLabel } from './utils';

// ----------------------------------------------------------------------

export function FamilyInvitationTableRow({
  row,
  serialNumber,
  relationshipOptions = [],
  onResend,
  onRevoke,
  detailPath,
  editPath,
}) {
  const router = useRouter();
  const isPending = row.status === 'pending';
  const status = getFamilyInvitationStatusMeta(row.status);

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
      color: 'primary',
      hidden: !isPending,
      onClick: (event) => {
        event.stopPropagation();
        onResend(row);
      },
    },
    {
      key: 'edit',
      icon: 'solar:pen-bold',
      tooltip: 'Edit',
      hidden: !isPending,
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
      hidden: !isPending,
      onClick: (event) => {
        event.stopPropagation();
        onRevoke(row);
      },
    },
  ];

  return (
    <TableRow hover tabIndex={-1} sx={{ cursor: 'pointer' }} onClick={() => router.push(detailPath)}>
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Stack sx={{ typography: 'body2' }}>
          <Link color="inherit" sx={{ cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}>
            {row.name || '—'}
          </Link>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {row.email || '—'}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
          {getRelationshipLabel(row.relationship, relationshipOptions)}
        </Typography>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Stack spacing={0.25}>
          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
            {row.residentName || '—'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {row.roomNumber ? `Room ${row.roomNumber}` : '—'}
            {row.homeName ? ` · ${row.homeName}` : ''}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell align="center">
        <Label variant="soft" color={status.color}>
          {status.label}
        </Label>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body2">{fDate(row.createdAt)}</Typography>
      </TableCell>

      <TableCell align="center" onClick={(event) => event.stopPropagation()}>
        <GenericTableRowActions actions={actions} />
      </TableCell>
    </TableRow>
  );
}
