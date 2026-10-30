import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

function getPhotoSharingMeta(row) {
  if (row?.photographyConsent === false) {
    return { label: 'Restricted', color: 'error' };
  }
  if (row?.photographyConsent === true) {
    return { label: 'Allowed', color: 'success' };
  }
  return { label: 'Pending', color: 'warning' };
}

export function StaffMyResidentsTableRow({ serialNumber, row, onViewResident }) {
  const name = row.name || 'Unknown';
  const room = row.roomNumber;
  const photoSharing = getPhotoSharingMeta(row);
  const familyName = row.nextOfKin?.name || row.familyMembers?.[0]?.name;

  const actions = [
    {
      key: 'view',
      icon: 'solar:eye-bold',
      tooltip: 'View resident',
      color: 'default',
      onClick: () => onViewResident(row),
    },
  ];

  return (
    <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => onViewResident(row)}>
      <TableCell sx={{ width: 48, pr: 0 }}>{serialNumber}</TableCell>

      <TableCell sx={{ pl: 0 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar alt={name} src={row.photoUrl || undefined} sx={{ textTransform: 'capitalize' }}>
            {name?.charAt(0)}
          </Avatar>

          <Stack>
            <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
              {name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {room ? `Room ${room}` : '—'}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      <TableCell>
        {familyName ? (
          <Typography variant="body2" fontWeight={500}>
            {familyName}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
            No family linked
          </Typography>
        )}
      </TableCell>

      <TableCell>
        <Label variant="soft" color={photoSharing.color}>
          {photoSharing.label}
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

StaffMyResidentsTableRow.propTypes = {
  serialNumber: PropTypes.number,
  row: PropTypes.object.isRequired,
  onViewResident: PropTypes.func.isRequired,
};

export default StaffMyResidentsTableRow;
