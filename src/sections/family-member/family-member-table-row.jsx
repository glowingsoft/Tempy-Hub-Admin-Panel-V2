import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';
import { fDate } from 'src/utils/format-time';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';

import { getFamilyMemberId, getFamilyMemberStatusMeta, getRelationshipLabel } from './utils';

// ----------------------------------------------------------------------

export function FamilyMemberTableRow({
  row,
  serialNumber,
  relationshipOptions = [],
  onDeactivate,
  onDelete,
  detailPath,
  editPath,
}) {
  const router = useRouter();
  const memberId = getFamilyMemberId(row);
  const status = getFamilyMemberStatusMeta(row.status);
  const isActive = row.status === 'active';
  const isInactive = row.status === 'inactive';
  const canToggleAccess = isActive || isInactive;

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
      tooltip: 'Edit relationship',
      hidden: !memberId,
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
      hidden: !canToggleAccess,
      onClick: (event) => {
        event.stopPropagation();
        onDeactivate(row);
      },
    },
    {
      key: 'delete',
      icon: 'solar:trash-bin-trash-bold',
      tooltip: 'Remove member',
      color: 'error',
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
        <Label variant="soft" color={row.isNextOfKin ? 'primary' : 'default'}>
          {row.isNextOfKin ? 'Yes' : 'No'}
        </Label>
      </TableCell>

      <TableCell align="center">
        <Label variant="soft" color={status.color}>
          {status.label}
        </Label>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Typography variant="body2">{fDate(row.joinedAt)}</Typography>
      </TableCell>

      <TableCell align="center" onClick={(event) => event.stopPropagation()}>
        <GenericTableRowActions actions={actions} />
      </TableCell>
    </TableRow>
  );
}
