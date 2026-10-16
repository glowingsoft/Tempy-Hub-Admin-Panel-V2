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

export function GazetteTableRow({
  serialNumber,
  row,
  isSelected,
  onSelectRow,
  onPreview,
  onRegenerate,
  onPdf,
}) {
  const theme = useTheme();
  const { resident, room, family, messages, status, statusLabel, avatarUrl } = row;

  const getStatusColor = (currentStatus) => {
    switch (currentStatus) {
      case 'ready':
        return 'success';
      case 'no_content':
        return 'warning';
      case 'over_limit':
        return 'warning';
      case 'printed':
        return 'info';
      case 'no_family':
        return 'error';
      default:
        return 'default';
    }
  };

  const actions = [
    {
      key: 'preview',
      icon: 'solar:eye-bold',
      tooltip: 'Preview',
      color: 'default',
      onClick: (e) => {
        e.stopPropagation();
        onPreview?.(row);
      },
    },
    {
      key: 'regenerate',
      icon: 'solar:restart-bold',
      tooltip: 'Regenerate',
      color: 'default',
      onClick: (e) => {
        e.stopPropagation();
        onRegenerate?.(row);
      },
    },
    {
      key: 'download',
      icon: 'solar:file-download-bold',
      tooltip: 'Download',
      color: 'default',
      onClick: (e) => {
        e.stopPropagation();
        onPdf?.(row);
      },
    },
  ];

  return (
    <TableRow
      hover
      tabIndex={-1}
      onClick={() => {
        onSelectRow?.(row);
        onPreview?.(row);
      }}
      sx={{ cursor: 'pointer' }}
    >
      {/* Sr# */}
      <TableCell>{serialNumber}</TableCell>

      {/* Resident: Avatar + Name + Subtitle */}
      <TableCell sx={{ py: 1.75 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            alt={resident}
            src={avatarUrl}
            sx={{
              width: 40,
              height: 40,
              fontWeight: 700,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {resident?.charAt(0)}
          </Avatar>

          <Stack spacing={0.25}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {resident}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Room {room}
            </Typography>
          </Stack>
        </Stack>
      </TableCell>

      {/* Room */}
      <TableCell align="center" sx={{ py: 1.75, fontWeight: 600, color: 'text.primary' }}>
        {room}
      </TableCell>

      {/* Family */}
      <TableCell align="center" sx={{ py: 1.75 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: family === 0 ? 'text.disabled' : 'text.primary',
          }}
        >
          {family}
        </Typography>
      </TableCell>

      {/* Messages */}
      <TableCell align="center" sx={{ py: 1.75 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: messages > 30 ? 700 : 600,
            color: messages > 30 ? 'warning.main' : messages === 0 ? 'text.disabled' : 'text.primary',
          }}
        >
          {messages}
        </Typography>
      </TableCell>

      {/* Status */}
      <TableCell align="center" sx={{ py: 1.75 }}>
        <Tooltip title={statusLabel} arrow>
          <Label variant="soft" color={getStatusColor(status)}>
            {statusLabel}
          </Label>
        </Tooltip>
      </TableCell>

      {/* Actions */}
      <TableCell align="center" sx={{ py: 1.75 }}>
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

GazetteTableRow.propTypes = {
  serialNumber: PropTypes.number,
  row: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  onSelectRow: PropTypes.func,
  onPreview: PropTypes.func,
  onRegenerate: PropTypes.func,
  onPdf: PropTypes.func,
};

export default GazetteTableRow;