import LoadingButton from '@mui/lab/LoadingButton';

import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------
// Thin wrapper over the shared <ConfirmDialog> for invitation revoke / delete.
// Driven by `confirmProps` from `useInvitationActions`.
// ----------------------------------------------------------------------

export function InvitationActionDialog({
  open,
  onClose,
  onConfirm,
  title,
  confirmLabel,
  name,
  isDelete,
  loading,
}) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title={title}
      content={
        isDelete ? (
          <>
            Permanently remove the invitation for{' '}
            <strong style={{ textTransform: 'capitalize' }}>{name}</strong>? This cannot be undone.
          </>
        ) : (
          <>
            Revoke the invitation for{' '}
            <strong style={{ textTransform: 'capitalize' }}>{name}</strong>? They will no longer be able to
            accept it.
          </>
        )
      }
      action={
        <LoadingButton
          variant="contained"
          color="error"
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </LoadingButton>
      }
    />
  );
}
