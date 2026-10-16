import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

const STATUS_CONFIG = {
  pending: { label: 'Waiting', color: 'warning' },
  approved: { label: 'Approved', color: 'success' },
  rejected: { label: 'Not approved', color: 'error' },
};

export function StaffPhotoUploadsTableRow({ serialNumber, row, onPreview }) {
  const statusInfo = STATUS_CONFIG[row.status] || {
    label: row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Waiting',
    color: 'default',
  };

  const statusTooltip =
    row.status === 'rejected' && row.rejectionReason
      ? `Reason: ${row.rejectionReason}`
      : row.status === 'approved' && row.approvedAt
      ? `Approved on ${fDate(row.approvedAt)}`
      : 'Waiting for manager approval';

  return (
    <TableRow hover onClick={onPreview} sx={{ cursor: 'pointer' }}>
      <TableCell>{serialNumber}</TableCell>

      {/* Photo */}
      <TableCell>
        <Tooltip
          arrow
          title={row.photoCount > 1 ? `${row.photoCount} photos in this upload` : 'Click to preview'}
        >
          <Box sx={{ position: 'relative', width: 48, height: 48 }}>
            <Box
              component="img"
              src={row.thumbnail}
              alt={row.caption}
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1,
                objectFit: 'cover',
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.06)',
                },
              }}
              onClick={onPreview}
            />
            {row.photoCount > 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: -6,
                  right: -6,
                  minWidth: 18,
                  height: 18,
                  px: 0.5,
                  borderRadius: '9px',
                  bgcolor: 'grey.900',
                  color: 'common.white',
                  fontSize: 11,
                  lineHeight: '18px',
                  textAlign: 'center',
                  fontWeight: 700,
                }}
              >
                {row.photoCount}
              </Box>
            )}
          </Box>
        </Tooltip>
      </TableCell>

      {/* Resident */}
      <TableCell>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar alt={row.residentName} src={row.residentAvatar}>
            {row.residentName?.charAt(0)}
          </Avatar>

          <Stack>
            <Typography variant="body2" fontWeight={600}>
              {row.residentName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Room {row.room}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      {/* Caption / Story */}
      <TableCell>
        <Typography variant="body2" sx={{ maxWidth: 260 }} noWrap>
          {row.caption}
        </Typography>
      </TableCell>

      {/* Uploaded by */}
      <TableCell>{row.uploadedBy}</TableCell>

      {/* Submitted Date */}
      <TableCell>{fDate(row.uploadedAt)}</TableCell>

      {/* Status */}
      <TableCell align="center">
        <Tooltip arrow title={statusTooltip}>
          <Label variant="soft" color={statusInfo.color}>
            {statusInfo.label}
          </Label>
        </Tooltip>
      </TableCell>

      {/* Actions */}
      <TableCell align="center">
        <Box
          onClick={(event) => event.stopPropagation()}
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <Tooltip title="Preview photo" arrow>
            <IconButton color="default" onClick={onPreview} size="small">
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );
}

StaffPhotoUploadsTableRow.propTypes = {
  serialNumber: PropTypes.number,
  row: PropTypes.object.isRequired,
  onPreview: PropTypes.func.isRequired,
};

export default StaffPhotoUploadsTableRow;