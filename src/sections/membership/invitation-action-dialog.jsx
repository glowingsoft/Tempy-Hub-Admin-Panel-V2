import Button from '@mui/material/Button';

import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------
// Thin wrapper over the shared <ConfirmDialog> for invitation revoke / delete.
// Driven by `confirmProps` from `useInvitationActions`.
// ----------------------------------------------------------------------

export function InvitationActionDialog({ open, onClose, onConfirm, title, confirmLabel, name, isDelete }) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title={title}
      content={
        isDelete ? (
          <>
            Permanently remove the invitation for <strong>{name}</strong>? This cannot be undone.
          </>
        ) : (
          <>
            Revoke the invitation for <strong>{name}</strong>? They will no longer be able to
            accept it.
          </>
        )
      }
      action={
        <Button variant="contained" color="error" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      }
    />
  );
}
