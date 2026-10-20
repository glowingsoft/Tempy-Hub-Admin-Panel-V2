import LoadingButton from '@mui/lab/LoadingButton';

import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------
// Thin wrapper over the shared <ConfirmDialog> for membership deactivation.
// Driven by `confirmProps` from `useMemberActions`. Deactivation is reversible
// on the backend — this is not a delete.
// ----------------------------------------------------------------------

export function MemberActionDialog({ open, onClose, onConfirm, loading, name }) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Deactivate membership"
      content={
        <>
          Deactivate the membership for{' '}
          <strong style={{ textTransform: 'capitalize' }}>{name}</strong>? They will lose access to the
          organization until the membership is reactivated. This does not delete the member.
        </>
      }
      action={
        <LoadingButton variant="contained" color="error" loading={loading} onClick={onConfirm}>
          Deactivate
        </LoadingButton>
      }
    />
  );
}
