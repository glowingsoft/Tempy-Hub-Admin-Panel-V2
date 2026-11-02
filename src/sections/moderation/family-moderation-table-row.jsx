import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

function getStatusMeta(status) {
  if (status === 'approved') return { label: 'Approved', color: 'success' };
  if (status === 'rejected') return { label: 'Rejected', color: 'error' };
  return { label: 'Pending', color: 'warning' };
}

function getPhotoUrls(row) {
  return (Array.isArray(row?.photos) ? row.photos : [])
    .map((photo) => photo?.url)
    .filter(Boolean);
}

export function FamilyModerationTableRow({
  serialNumber,
  row,
  onPreview,
  onApprove,
  onDisapprove,
  canModerate = true,
}) {
  const isPending = row.status === 'pending';
  const photoUrls = getPhotoUrls(row);
  const thumbnail = photoUrls[0];
  const photoCount = photoUrls.length;
  const statusMeta = getStatusMeta(row.status);
  const residentName = row.residentName || 'Unknown';
  const authorName = row.authorName || '—';

  const actions = [
    {
      key: 'preview',
      icon: 'solar:eye-bold',
      tooltip: 'Preview photo',
      color: 'default',
      onClick: onPreview,
    },
    ...(isPending && canModerate
      ? [
        {
          key: 'approve',
          icon: 'solar:check-circle-bold',
          tooltip: 'Approve upload',
          color: 'success',
          onClick: onApprove,
        },
        {
          key: 'disapprove',
          icon: 'solar:close-circle-bold',
          tooltip: 'Reject upload',
          color: 'error',
          onClick: onDisapprove,
        },
      ]
      : []),
  ];

  return (
    <TableRow hover onClick={onPreview} sx={{ cursor: 'pointer' }}>
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Tooltip
          arrow
          title={photoCount > 1 ? `${photoCount} photos in this upload` : 'Click to preview'}
        >
          <Box sx={{ position: 'relative', width: 48, height: 48 }}>
            {thumbnail ? (
              <Box
                component="img"
                src={thumbnail}
                alt={row.message || residentName}
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1,
                  bgcolor: 'background.neutral',
                }}
              />
            )}
            {photoCount > 1 && (
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
                {photoCount}
              </Box>
            )}
          </Box>
        </Tooltip>
      </TableCell>

      <TableCell>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar alt={residentName} src={row.residentPhotoUrl || undefined} sx={{ width: 36, height: 36, fontSize: 16, textTransform: 'capitalize' }}>
            {residentName?.charAt(0)}
          </Avatar>

          <Stack>
            <Typography variant="body2" fontWeight={600} sx={{ textTransform: 'capitalize' }}>
              {residentName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.roomNumber ? `Room ${row.roomNumber}` : '—'}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      <TableCell>
        <Typography variant="body2" sx={{ maxWidth: 240 }} noWrap>
          {row.message || '—'}
        </Typography>
      </TableCell>

      <TableCell>
        <Stack>
          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
            {authorName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            {row.authorRelationship || row.authorEmail || '—'}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell>{fDate(row.createdAt)}</TableCell>

      <TableCell align="center">
        <Tooltip
          arrow
          title={
            row.status === 'rejected' && row.rejectionReason
              ? `Reason: ${row.rejectionReason}`
              : row.status === 'approved' && row.decidedAt
                ? `Approved${row.decidedByName ? ` by ${row.decidedByName}` : ''} on ${fDate(row.decidedAt)}`
                : 'Pending approval'
          }
        >
          <Label variant="soft" color={statusMeta.color}>
            {statusMeta.label}
          </Label>
        </Tooltip>
      </TableCell>

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
  onApprove: PropTypes.func,
  onDisapprove: PropTypes.func,
  canModerate: PropTypes.bool,
};

export default FamilyModerationTableRow;
