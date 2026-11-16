import PropTypes from 'prop-types';

import Button from '@mui/material/Button';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { fDateTime } from 'src/utils/format-time';
import { Label } from 'src/components/label';
import { getShiftStatusMeta } from 'src/sections/shift/mocks/data';
import { getShiftClaimStatusMeta } from 'src/sections/shift-claim/mocks/data';

// ----------------------------------------------------------------------

export function StaffShiftTableRow({
  row,
  serialNumber,
  claim = null,
  claimed = false,
  showClaimAction = false,
  onClaim,
}) {
  const activeClaim = claim || row?.myClaim;
  const isClaimed = Boolean(activeClaim) || claimed;

  const shiftStatus = getShiftStatusMeta(row.status);
  const claimStatusMeta = activeClaim?.status ? getShiftClaimStatusMeta(activeClaim.status) : null;

  // In Shift Claim view, if there is a claim on this shift, display the claim's status (e.g. Pending, Approved, Rejected)
  const displayStatus = showClaimAction && claimStatusMeta ? claimStatusMeta : shiftStatus;

  const canClaim = row.status === 'open' && !isClaimed;

  const handleClaim = (event) => {
    event.stopPropagation();
    onClaim?.(row);
  };

  const getButtonLabel = () => {
    if (activeClaim?.status) {
      if (activeClaim.status === 'pending') return 'Claimed';
      if (activeClaim.status === 'approved') return 'Approved';
      if (activeClaim.status === 'rejected') return 'Rejected';
    }
    if (isClaimed) return 'Claimed';
    return 'Claim Shift';
  };

  return (
    <TableRow hover>
      <TableCell>{serialNumber}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.branch?.name || '—'}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDateTime(row.startsAt)}</TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>{fDateTime(row.endsAt)}</TableCell>

      <TableCell align="center">
        <Label variant="soft" color={displayStatus.color}>
          {displayStatus.label}
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
  claim: PropTypes.object,
  claimed: PropTypes.bool,
  showClaimAction: PropTypes.bool,
  onClaim: PropTypes.func,
};
