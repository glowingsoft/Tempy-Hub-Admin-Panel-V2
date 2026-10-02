import LoadingButton from '@mui/lab/LoadingButton';

import { fDateTime } from 'src/utils/format-time';

import { ConfirmDialog } from 'src/components/custom-dialog';

import { getShiftClaimStaffName } from './utils';

// ----------------------------------------------------------------------
// Thin wrapper over the shared <ConfirmDialog> for approving a shift claim.
// Driven by `confirmProps` from `useShiftClaimActions`.
// ----------------------------------------------------------------------

export function ShiftClaimActionDialog({ open, onClose, onConfirm, loading, claim }) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Approve shift claim"
      content={
        claim ? (
          <>
            Approve <strong>{getShiftClaimStaffName(claim)}</strong> for the{' '}
            <strong>{claim.branch?.name || '—'}</strong> shift on {fDateTime(claim.startsAt)}?
          </>
        ) : null
      }
      action={
        <LoadingButton variant="contained" color="success" loading={loading} onClick={onConfirm}>
          Approve
        </LoadingButton>
      }
    />
  );
}
