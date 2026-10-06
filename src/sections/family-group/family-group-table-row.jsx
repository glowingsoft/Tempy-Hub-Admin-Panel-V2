import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { GenericTableRowActions } from 'src/components/generic-table/table-row-actions';
import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

export function FamilyGroupTableRow({
  serialNumber,
  row,
  isSelected,
  onSelectRow,
  onManage,
  onInvite,
  onResend,
  onAddNok,
}) {
  const theme = useTheme();
  const residentName = row.resident || row.name || '';
  const roomNumber = row.room || row.roomNumber || '—';
  const avatarImage = row.avatarUrl || row.image || '';
  const {
    nextOfKin,
    nextOfKinRelationship,
    members = 0,
    status = 'no_family',
    statusLabel = 'No family',
  } = row;

  const getStatusColor = (currentStatus) => {
    switch (currentStatus) {
      case 'active':
        return 'success';
      case 'invite_pending':
        return 'warning';
      case 'no_family':
        return 'error';
      default:
        return 'default';
    }
  };

  // Contextual icon actions matching requested row actions:
  // - Active: Manage · Invite
  // - Invite pending: Resend · Manage
  // - No family: Add next of kin
  const actions = [];

  if (status === 'active') {
    actions.push(
      {
        key: 'manage',
        icon: 'solar:pen-bold',
        tooltip: 'Manage',
        color: 'primary',
        onClick: (e) => {
          e.stopPropagation();
          onManage?.(row);
        },
      },
      {
        key: 'invite',
        icon: 'solar:user-plus-bold',
        tooltip: 'Invite',
        color: 'info',
        onClick: (e) => {
          e.stopPropagation();
          onInvite?.(row);
        },
      }
    );
  } else if (status === 'invite_pending') {
    actions.push(
      {
        key: 'resend',
        icon: 'solar:restart-bold',
        tooltip: 'Resend',
        color: 'warning',
        onClick: (e) => {
          e.stopPropagation();
          onResend?.(row);
        },
      },
      {
        key: 'manage',
        icon: 'solar:pen-bold',
        tooltip: 'Manage',
        color: 'primary',
        onClick: (e) => {
          e.stopPropagation();
          onManage?.(row);
        },
      }
    );
  } else if (status === 'no_family') {
    actions.push({
      key: 'add-nok',
      icon: 'solar:user-plus-bold',
      tooltip: 'Add next of kin',
      color: 'success',
      onClick: (e) => {
        e.stopPropagation();
        onAddNok?.(row);
      },
    });
  }

  return (
    <TableRow
      hover
      tabIndex={-1}
      onClick={() => onSelectRow?.(row)}
      sx={{
        cursor: 'default',
        bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
        borderLeft: isSelected ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
        transition: theme.transitions.create(['background-color', 'border-color'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': {
          bgcolor: isSelected
            ? alpha(theme.palette.primary.main, 0.12)
            : alpha(theme.palette.action.hover, 0.6),
        },
      }}
    >
      {/* Sr# */}
      <TableCell sx={{ color: 'text.secondary', fontWeight: 500 }}>
        {serialNumber}
      </TableCell>

      {/* Resident */}
      <TableCell sx={{ py: 1.75 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            alt={residentName}
            src={avatarImage}
            sx={{
              width: 40,
              height: 40,
              fontWeight: 700,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {residentName?.charAt(0)}
          </Avatar>

          <Stack spacing={0.25}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {residentName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Room {roomNumber}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      {/* Next of kin */}
      <TableCell sx={{ py: 1.75 }}>
        {nextOfKin ? (
          <Stack spacing={0.25}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {nextOfKin}
            </Typography>
            {nextOfKinRelationship && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {nextOfKinRelationship}
              </Typography>
            )}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.disabled', fontWeight: 500 }}>
            –
          </Typography>
        )}
      </TableCell>

      {/* Members */}
      <TableCell align="center" sx={{ py: 1.75 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: '50%',
            fontWeight: 700,
            fontSize: '0.85rem',
            bgcolor: members > 0 ? alpha(theme.palette.info.main, 0.1) : alpha(theme.palette.grey[500], 0.12),
            color: members > 0 ? 'info.dark' : 'text.disabled',
          }}
        >
          {members}
        </Box>
      </TableCell>

      {/* Status */}
      <TableCell align="center" sx={{ py: 1.75 }}>
        <Tooltip title={`Status: ${statusLabel}`} arrow>
          <Label variant="soft" color={getStatusColor(status)}>
            {statusLabel}
          </Label>
        </Tooltip>
      </TableCell>

      {/* Actions */}
      <TableCell align="center" sx={{ py: 1.75 }}>
        <Box
          onClick={(e) => e.stopPropagation()}
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <GenericTableRowActions actions={actions} />
        </Box>
      </TableCell>
    </TableRow>
  );
}

FamilyGroupTableRow.propTypes = {
  serialNumber: PropTypes.number,
  row: PropTypes.object,
  isSelected: PropTypes.bool,
  onSelectRow: PropTypes.func,
  onManage: PropTypes.func,
  onInvite: PropTypes.func,
  onResend: PropTypes.func,
  onAddNok: PropTypes.func,
};

export default FamilyGroupTableRow;
