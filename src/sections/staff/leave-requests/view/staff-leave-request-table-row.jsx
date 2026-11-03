import PropTypes from 'prop-types';

import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

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

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{getLeaveTypeLabel(row.leaveType)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.startDate)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.endDate)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDate(row.createdAt)}</TableCell>

      <TableCell align="center">{row.totalDays ?? '—'}</TableCell>

      <TableCellWithTooltip maxWidth={220}>{row.reason || '—'}</TableCellWithTooltip>

      <TableCell align="center">
        <Label variant="soft" color={status.color}>
          {status.label}
        </Label>
      </TableCell>

    </TableRow>
  );
}

StaffLeaveRequestTableRow.propTypes = {
  row: PropTypes.object,
  serialNumber: PropTypes.number,
};
