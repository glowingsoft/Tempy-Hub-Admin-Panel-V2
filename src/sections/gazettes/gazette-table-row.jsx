import PropTypes from 'prop-types';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

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
  onMessageFamily,
  onAddWallPost,
  onChooseMessages,
  onInviteFamily,
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

  // Render Action links matching wireframe exactly
  const renderActions = () => {
    if (status === 'ready') {
      return (
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
          <Link
            component="button"
            variant="subtitle2"
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(row);
            }}
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.8125rem',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Preview
          </Link>
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            ·
          </Typography>
          <Link
            component="button"
            variant="subtitle2"
            onClick={(e) => {
              e.stopPropagation();
              onRegenerate?.(row);
            }}
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.8125rem',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Regenerate
          </Link>
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            ·
          </Typography>
          <Link
            component="button"
            variant="subtitle2"
            onClick={(e) => {
              e.stopPropagation();
              onPdf?.(row);
            }}
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.8125rem',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            PDF
          </Link>
        </Stack>
      );
    }

    if (status === 'no_content') {
      return (
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
          <Link
            component="button"
            variant="subtitle2"
            onClick={(e) => {
              e.stopPropagation();
              onMessageFamily?.(row);
            }}
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.8125rem',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Message family
          </Link>
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            ·
          </Typography>
          <Link
            component="button"
            variant="subtitle2"
            onClick={(e) => {
              e.stopPropagation();
              onAddWallPost?.(row);
            }}
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.8125rem',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Add wall post
          </Link>
        </Stack>
      );
    }

    if (status === 'over_limit') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Link
            component="button"
            variant="subtitle2"
            onClick={(e) => {
              e.stopPropagation();
              onChooseMessages?.(row);
            }}
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.8125rem',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Choose which to keep
          </Link>
        </Box>
      );
    }

    if (status === 'printed') {
      return (
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
          <Link
            component="button"
            variant="subtitle2"
            onClick={(e) => {
              e.stopPropagation();
              onPreview?.(row);
            }}
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.8125rem',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Preview
          </Link>
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            ·
          </Typography>
          <Link
            component="button"
            variant="subtitle2"
            onClick={(e) => {
              e.stopPropagation();
              onPdf?.(row);
            }}
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.8125rem',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            PDF
          </Link>
        </Stack>
      );
    }

    if (status === 'no_family') {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Link
            component="button"
            variant="subtitle2"
            onClick={(e) => {
              e.stopPropagation();
              onInviteFamily?.(row);
            }}
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              fontSize: '0.8125rem',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Invite family
          </Link>
        </Box>
      );
    }

    return null;
  };

  return (
    <TableRow
      hover
      tabIndex={-1}
      onClick={() => onSelectRow?.(row)}
      sx={{
        cursor: 'pointer',
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
      <TableCell align="center" sx={{ py: 1.75, minWidth: 230 }}>
        {renderActions()}
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
  onMessageFamily: PropTypes.func,
  onAddWallPost: PropTypes.func,
  onChooseMessages: PropTypes.func,
  onInviteFamily: PropTypes.func,
};

export default GazetteTableRow;
