import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';

import { getFamilyGroupStatusMeta, getRelationshipLabel } from './mocks/data';

// ----------------------------------------------------------------------

export function FamilyGroupTableRow({ serialNumber, row, relationshipOptions = [], onView, onInvite }) {
  const residentName = row.residentName || '—';
  const nokName = row.nextOfKinName || '';
  const statusMeta = getFamilyGroupStatusMeta(row.status);

  const actions = [
    {
      key: 'view',
      icon: 'solar:eye-bold',
      tooltip: 'View group',
      onClick: () => onView?.(row),
    },
    {
      key: 'invite',
      icon: 'solar:user-plus-bold',
      tooltip: 'Invite family member',
      onClick: () => onInvite?.(row),
    },
  ];

  return (
    <TableRow hover tabIndex={-1} onClick={() => onView?.(row)} sx={{ cursor: 'pointer' }}>
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar alt={residentName} src={row.photoUrl || undefined} sx={{ width: 36, height: 36, fontSize: 16, textTransform: 'capitalize' }}>
            {residentName?.charAt(0)}
          </Avatar>
          <Stack spacing={0.25}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
              {residentName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {row.roomNumber ? `Room ${row.roomNumber}` : '—'}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      <TableCell>
        {nokName ? (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              alt={nokName}
              src={row.nextOfKinPhotoUrl || undefined}
              sx={{ width: 36, height: 36, fontSize: 16, textTransform: 'capitalize' }}
            >
              {nokName.charAt(0)}
            </Avatar>
            <Stack spacing={0.25}>
              <Typography variant="body2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                {nokName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'capitalize' }}>
                {getRelationshipLabel(row.nextOfKinRelationship, relationshipOptions)}
              </Typography>
            </Stack>
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            —
          </Typography>
        )}
      </TableCell>

      <TableCell>
        <Stack spacing={0.25}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.membersCount ?? 0}
          </Typography>
          {(row.pendingInvitationsCount ?? 0) > 0 && (
            <Typography variant="caption" sx={{ color: 'warning.main' }}>
              {row.pendingInvitationsCount} pending
            </Typography>
          )}
        </Stack>
      </TableCell>

      <TableCell align="center">
        <Label variant="soft" color={statusMeta.color}>
          {statusMeta.label}
        </Label>
      </TableCell>

      <TableCell align="center" onClick={(event) => event.stopPropagation()}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
}

FamilyGroupTableRow.propTypes = {
  serialNumber: PropTypes.number,
  row: PropTypes.object,
  relationshipOptions: PropTypes.array,
  onView: PropTypes.func,
  onInvite: PropTypes.func,
};

export default FamilyGroupTableRow;
