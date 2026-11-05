import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { fDateTime } from 'src/utils/format-time';
import { Label } from 'src/components/label';
import { getShiftStatusMeta } from 'src/sections/shift/mocks/data';

// ----------------------------------------------------------------------

export function StaffShiftTableRow({ row, serialNumber, claimed = false, showClaimAction = false, onClaim }) {
  const status = getShiftStatusMeta(row.status);
  const canClaim = row.status === 'open' && !claimed;

  const handleClaim = (event) => {
    event.stopPropagation();
    onClaim(row);
  };

  const getButtonLabel = () => {
    if (claimed) return 'Claimed';
    return 'Claim Shift';
  };

  return (
    <TableRow hover>
      <TableCell>{serialNumber}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.branch?.name || '—'}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDateTime(row.startsAt)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDateTime(row.endsAt)}</TableCell>

      <TableCell align="center">
        <Label variant="soft" color={status.color}>
          {status.label}
        </Label>
      </TableCell>

      {showClaimAction && (
        <TableCell align="center">
          <Button
            size="small"
            variant={canClaim ? 'contained' : 'outlined'}
            color={canClaim ? 'primary' : 'inherit'}
            disabled={!canClaim}
            onClick={handleClaim}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {getButtonLabel()}
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
}

StaffShiftTableRow.propTypes = {
  row: PropTypes.object,
  serialNumber: PropTypes.number,
  claimed: PropTypes.bool,
  showClaimAction: PropTypes.bool,
  onClaim: PropTypes.func,
};
