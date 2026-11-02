import PropTypes from 'prop-types';

import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';

// ----------------------------------------------------------------------

const STATUS_COLOR_MAP = {
  completed: 'success',
  in_progress: 'warning',
  expired: 'error',
  overdue: 'error',
};

// ----------------------------------------------------------------------

export function TrainingRecordTableRow({ row, serialNumber, onAddRecord }) {
  const staff = row?.staff || {};
  const requirement = row?.requirement || {};
  const status = row?.status || row?.cellStatus || 'in_progress';
  const completedDate = row?.completedAt || row?.record?.completedAt;
  const attachedDocs = row?.record?.documents || [];

  return (
    <TableRow hover>
      {/* Sr# */}
      <TableCell sx={{ width: 60 }}>{serialNumber}</TableCell>

      {/* Staff Member */}
      <TableCell sx={{ minWidth: 200 }}>
        <Stack sx={{ minWidth: 0 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
            {staff.name || '—'}
          </Typography>

          <Typography variant="caption" color="text.secondary" noWrap>
            {staff.email || '—'}
          </Typography>
        </Stack>
      </TableCell>

      {/* Requirement / Course */}
      <TableCell sx={{ minWidth: 200 }}>
        <Stack spacing={0.5} alignItems="flex-start">
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {requirement.name || '—'}
          </Typography>

          {requirement.type && (
            <Chip
              label={requirement.type}
              size="small"
              variant="soft"
              color={requirement.type === 'training' ? 'success' : 'info'}
              sx={{ height: 20, fontSize: 11, textTransform: 'capitalize' }}
            />
          )}
        </Stack>
      </TableCell>

      {/* Due Date */}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {row.dueDate ? fDate(row.dueDate) : '—'}
      </TableCell>

      {/* Completed Date */}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {completedDate ? fDate(completedDate) : '—'}
      </TableCell>

      {/* Expiry Date */}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {row.expiresAt ? fDate(row.expiresAt) : '—'}
      </TableCell>

      {/* Status */}
      <TableCell align="center">
        <Label color={STATUS_COLOR_MAP[status] || 'default'} sx={{ textTransform: 'capitalize' }}>
          {status.replace('_', ' ')}
        </Label>
      </TableCell>

      {/* Actions */}
      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
        <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
          {attachedDocs.length > 0 && (
            <Tooltip title={`${attachedDocs.length} PDF document(s) attached`}>
              <Chip
                icon={<Iconify icon="solar:file-text-bold" width={14} />}
                label={attachedDocs.length}
                size="small"
                variant="outlined"
                color="info"
                sx={{ height: 24, fontSize: 11 }}
              />
            </Tooltip>
          )}

          <Tooltip title="Add Record" placement="top" arrow>
            <IconButton color="primary" onClick={() => onAddRecord(row)}>
              <Iconify icon="mingcute:add-line" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

TrainingRecordTableRow.propTypes = {
  row: PropTypes.object.isRequired,
  serialNumber: PropTypes.number.isRequired,
  onAddRecord: PropTypes.func.isRequired,
};