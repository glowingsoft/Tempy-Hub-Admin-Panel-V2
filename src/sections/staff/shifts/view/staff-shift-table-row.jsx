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
  onWithdraw,
}) {
  const activeClaim = claim || row?.myClaim;
  const isClaimed = Boolean(activeClaim) || claimed;

  const shiftStatus = getShiftStatusMeta(row.status);
  const claimStatusMeta = activeClaim?.status ? getShiftClaimStatusMeta(activeClaim.status) : null;

  // In Shift Claim view, if there is a claim on this shift, display the claim's status (e.g. Pending, Approved, Rejected)
  const rawDisplayStatus = showClaimAction && claimStatusMeta ? claimStatusMeta : shiftStatus;

  const isPending =
    activeClaim?.status === 'pending' || rawDisplayStatus?.label?.toLowerCase() === 'pending';

  // Keep Open (warning) and Scheduled (success) unchanged; highlight Pending in red (error) on /staff/shift-claims
  const displayStatus =
    showClaimAction && isPending ? { ...rawDisplayStatus, color: 'error' } : rawDisplayStatus;
  const canClaim = row.status === 'open' && !isClaimed;

  const handleClickAction = (event) => {
    event.stopPropagation();
    if (isPending) {
      onWithdraw?.(row, activeClaim);
    } else if (canClaim) {
      onClaim?.(row);
    }
  };

  const getButtonProps = () => {
    if (isPending) {
      return {
        label: 'Withdraw',
        variant: 'contained',
        color: 'error',
        disabled: false,
      };
    }
    if (canClaim) {
      return {
        label: 'Claim Shift',
        variant: 'contained',
        color: 'primary',
        disabled: false,
      };
    }
    if (activeClaim?.status === 'approved') {
      return {
        label: 'Approved',
        variant: 'outlined',
        color: 'inherit',
        disabled: true,
      };
    }
    if (activeClaim?.status === 'rejected') {
      return {
        label: 'Rejected',
        variant: 'outlined',
        color: 'inherit',
        disabled: true,
      };
    }
    return {
      label: isClaimed ? 'Claimed' : 'Claim Shift',
      variant: 'outlined',
      color: 'inherit',
      disabled: true,
    };
  };

  const buttonProps = getButtonProps();

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
            variant={buttonProps.variant}
            color={buttonProps.color}
            disabled={buttonProps.disabled}
            onClick={handleClickAction}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {buttonProps.label}
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
  onWithdraw: PropTypes.func,
};
