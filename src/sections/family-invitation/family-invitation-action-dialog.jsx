import LoadingButton from '@mui/lab/LoadingButton';

import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

export function FamilyInvitationActionDialog({
  open,
  onClose,
  onConfirm,
  title,
  confirmLabel,
  name,
  loading,
}) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title={title}
      content={
        <>
          Revoke the invitation for <strong>{name}</strong>? They will no longer have access to the
          family portal.
        </>
      }
      action={
        <LoadingButton variant="contained" color="error" loading={loading} onClick={onConfirm}>
          {confirmLabel}
        </LoadingButton>
      }
    />
  );
}
