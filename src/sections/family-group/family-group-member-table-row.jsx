import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { fDateTime } from 'src/utils/format-time';
import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';

import { getMemberStatusMeta, getRelationshipLabel } from './mocks/data';

// ----------------------------------------------------------------------

function MemberPersonCell({ name, photoUrl, caption }) {
  const displayName = name || '—';

  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Avatar alt={displayName} src={photoUrl || undefined} sx={{ textTransform: 'capitalize' }}>
        {displayName.charAt(0)}
      </Avatar>
      <Stack spacing={0.25}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
          {displayName}
        </Typography>
        {caption ? (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {caption}
          </Typography>
        ) : null}
      </Stack>
    </Stack>
  );
}

MemberPersonCell.propTypes = {
  name: PropTypes.string,
  photoUrl: PropTypes.string,
  caption: PropTypes.string,
};

export function FamilyGroupMemberTableRow({ member, relationshipOptions = [], actions = [] }) {
  const statusMeta = getMemberStatusMeta(member.status);
  const visibleActions = actions.filter((action) => !action.hidden);

  return (
    <TableRow hover>
      <TableCell>
        <MemberPersonCell name={member.name} photoUrl={member.photoUrl} caption={member.email} />
      </TableCell>
      <TableCell sx={{ textTransform: 'capitalize' }}>
        {getRelationshipLabel(member.relationship, relationshipOptions)}
      </TableCell>
      <TableCell>{member.portalRoleLabel || '—'}</TableCell>
      <TableCell align="center">
        <Label variant="soft" color={member.isNextOfKin ? 'primary' : 'default'}>
          {member.isNextOfKin ? 'Yes' : 'No'}
        </Label>
      </TableCell>
      <TableCell align="center">
        <Label variant="soft" color={statusMeta.color}>
          {statusMeta.label}
        </Label>
      </TableCell>
      <TableCell>{member.joinedAt ? fDateTime(member.joinedAt) : '—'}</TableCell>
      <TableCell align="center">
        {visibleActions.length ? <GenericTableRowActions actions={visibleActions} /> : '—'}
      </TableCell>
    </TableRow>
  );
}

FamilyGroupMemberTableRow.propTypes = {
  member: PropTypes.object,
  relationshipOptions: PropTypes.array,
  actions: PropTypes.array,
};

export default FamilyGroupMemberTableRow;
