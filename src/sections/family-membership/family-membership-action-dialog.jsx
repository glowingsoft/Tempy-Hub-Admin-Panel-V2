import LoadingButton from '@mui/lab/LoadingButton';

import { ConfirmDialog } from 'src/components/custom-dialog';

// ----------------------------------------------------------------------

export function FamilyMembershipActionDialog({
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
            Permanently remove family membership for <strong>{name}</strong>? This cannot be undone.
          </>
        ) : (
          <>
            Revoke the invitation for <strong>{name}</strong>? They will no longer have access
            to the family portal.
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

// ----------------------------------------------------------------------

export function FamilyMemberActionDialog({
  open,
  onClose,
  onConfirm,
  title,
  confirmLabel,
  name,
  isDelete,
  isCurrentlyActive,
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
            Permanently remove family member <strong>{name}</strong>? This cannot be undone.
          </>
        ) : isCurrentlyActive ? (
          <>
            Deactivate <strong>{name}</strong>? They will temporarily lose access to the family portal.
          </>
        ) : (
          <>
            Reactivate <strong>{name}</strong>? They will regain access to the family portal.
          </>
        )
      }
      action={
        <LoadingButton
          variant="contained"
          color={isDelete ? 'error' : isCurrentlyActive ? 'warning' : 'primary'}
          loading={loading}
          onClick={onConfirm}
        >
          {confirmLabel}
        </LoadingButton>
      }
    />
  );
}