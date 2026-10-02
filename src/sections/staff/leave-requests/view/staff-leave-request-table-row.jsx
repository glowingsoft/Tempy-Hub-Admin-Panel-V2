import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { fDate } from 'src/utils/format-time';
import { Label } from 'src/components/label';
import { TableCellWithTooltip } from 'src/components/table';
import {
  getLeaveRequestStatusMeta,
  getLeaveTypeLabel,
} from 'src/sections/leave-request/mocks/data';

// ----------------------------------------------------------------------

export function StaffLeaveRequestTableRow({ row, serialNumber }) {
  const status = getLeaveRequestStatusMeta(row.status);

  return (
    <TableRow hover>
      <TableCell>{serialNumber}</TableCell>

      <TableCell>
        <Stack sx={{ typography: 'body2' }}>
          <Typography variant="body2" fontWeight={600}>
            {getLeaveTypeLabel(row.leaveType)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.reason || '—'}
          </Typography>
        </Stack>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.startDate)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.endDate)}</TableCell>

      <TableCell align="center">{row.totalDays ?? '—'}</TableCell>

      <TableCellWithTooltip maxWidth={220}>{row.reason || '—'}</TableCellWithTooltip>

      <TableCell align="center">
        <Label variant="soft" color={status.color}>
          {status.label}
        </Label>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.createdAt)}</TableCell>
    </TableRow>
  );
}

StaffLeaveRequestTableRow.propTypes = {
  row: PropTypes.object,
  serialNumber: PropTypes.number,
};
