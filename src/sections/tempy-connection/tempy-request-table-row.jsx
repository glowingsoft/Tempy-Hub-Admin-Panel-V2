import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

import { fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';

import { getTempyRequestStatusMeta } from './mocks/data';

// ----------------------------------------------------------------------

function TempyRequestTableRow({ row, serialNumber }) {
  const status = getTempyRequestStatusMeta(row.status);

  return (
    <TableRow hover>
      <TableCell>{serialNumber}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.site}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.role}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDateTime(row.startsAt)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDateTime(row.endsAt)}</TableCell>

      <TableCell align="center">
        {row.urgentCover ? (
          <Label variant="soft" color="error">
            Urgent
          </Label>
        ) : (
          '—'
        )}
      </TableCell>

      <TableCell align="center">
        <Label variant="soft" color={status.color}>
          {status.label}
        </Label>
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {row.cost ? fCurrency(row.cost, { code: 'en-GB', currency: 'GBP' }) : '—'}
      </TableCell>
    </TableRow>
  );
}

export default TempyRequestTableRow;
