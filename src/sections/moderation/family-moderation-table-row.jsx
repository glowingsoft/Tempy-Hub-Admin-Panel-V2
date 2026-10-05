import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

export function FamilyModerationTableRow({
  serialNumber,
  row,
  onPreview,
  onApprove,
  onDisapprove,
}) {
  const actions = [
    {
      key: 'preview',
      icon: 'solar:eye-bold',
      tooltip: 'Preview photo',
      color: 'default',
      onClick: onPreview,
    },
    {
      key: 'approve',
      icon: 'solar:check-circle-bold',
      tooltip: row.status === 'approved' ? 'Approved (click to re-confirm)' : 'Approve upload',
      color: 'success',
      onClick: onApprove,
    },
    {
      key: 'disapprove',
      icon: 'solar:close-circle-bold',
      tooltip: row.status === 'rejected' ? 'Disapproved (click to edit reason)' : 'Disapprove upload',
      color: 'error',
      onClick: onDisapprove,
    },
  ];

  const getStatusColor = (status) => {
    if (status === 'approved') return 'success';
    if (status === 'rejected') return 'error';
    return 'warning';
  };

  return (
    <TableRow hover>
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
        <Typography variant="body2" sx={{ maxWidth: 240 }} noWrap>
          {row.caption}
        </Typography>
      </TableCell>

      {/* Uploaded by */}
      <TableCell>{row.uploadedBy}</TableCell>

      {/* Submitted Date */}
      <TableCell>{fDate(row.uploadedAt)}</TableCell>

      {/* Status */}
      <TableCell align="center">
        <Tooltip
          arrow
          title={
            row.status === 'rejected' && row.rejectionReason
              ? `Reason: ${row.rejectionReason}`
              : row.status === 'approved' && row.approvedAt
              ? `Approved on ${fDate(row.approvedAt)}`
              : 'Pending approval'
          }
        >
          <Label variant="soft" color={getStatusColor(row.status)}>
            {row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : 'Pending'}
          </Label>
        </Tooltip>
      </TableCell>

      {/* Actions */}
      <TableCell align="center">
        <Box
          onClick={(event) => event.stopPropagation()}
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
}

FamilyModerationTableRow.propTypes = {
  serialNumber: PropTypes.number,
  row: PropTypes.object.isRequired,
  onPreview: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  onDisapprove: PropTypes.func.isRequired,
};

export default FamilyModerationTableRow;
