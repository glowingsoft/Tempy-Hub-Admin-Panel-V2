import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function StaffMyResidentsTableRow({
  serialNumber,
  row,
  onViewResident,
  onAddPost,
  onPreviewGazette,
  onDownloadGazette,
}) {
  const { resident, room, avatarUrl, familyCount, nextOfKin, photoSharing, gazetteStatus } = row;

  const getPhotoSharingColor = (status) => {
    switch (status) {
      case 'allowed':
        return 'success';
      case 'restricted':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => onViewResident(row)}>
      {/* Sr# */}
      <TableCell sx={{ width: 48, pr: 0 }}>{serialNumber}</TableCell>

      {/* Resident */}
      <TableCell sx={{ pl: 0 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar alt={resident} src={avatarUrl}>
            {resident?.charAt(0)}
          </Avatar>

          <Stack>
            <Typography variant="body2" fontWeight={600}>
              {resident}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Room {room}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      {/* Family */}
      <TableCell>
        {familyCount > 0 && nextOfKin ? (
          <Typography variant="body2" fontWeight={500}>
            {nextOfKin.name}
          </Typography>
        ) : (
          <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
            No family linked
          </Typography>
        )}
      </TableCell>

      {/* Photo sharing */}
      <TableCell>
        <Label variant="soft" color={getPhotoSharingColor(photoSharing?.status)}>
          {photoSharing?.label || 'Allowed'}
        </Label>
      </TableCell>

      {/* Actions */}
      <TableCell align="center">
        <Stack
          direction="row"
          spacing={0.5}
          justifyContent="center"
          alignItems="center"
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip title="Preview Gazette" arrow>
            <IconButton
              color="default"
              size="small"
              onClick={() => onPreviewGazette(row)}
            >
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Download Gazette PDF" arrow>
            <IconButton
              color="default"
              size="small"
              onClick={() => onDownloadGazette(row)}
            >
              <Iconify icon="solar:file-download-bold" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

StaffMyResidentsTableRow.propTypes = {
  serialNumber: PropTypes.number,
  row: PropTypes.object.isRequired,
  onViewResident: PropTypes.func.isRequired,
  onAddPost: PropTypes.func,
  onPreviewGazette: PropTypes.func.isRequired,
  onDownloadGazette: PropTypes.func.isRequired,
};

export default StaffMyResidentsTableRow;