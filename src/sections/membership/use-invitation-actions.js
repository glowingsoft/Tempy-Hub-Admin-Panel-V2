import { useCallback, useMemo, useState } from 'react';

import { useBoolean } from 'src/hooks/use-boolean';

import { toast } from 'src/components/snackbar';

import {
  useResendInvitationMutation,
  useRevokeInvitationMutation,
} from 'src/store/Reducer/invitations-api';
import { deleteMockInvitation } from './mocks/data';

// ----------------------------------------------------------------------
// Shared resend / revoke / delete behaviour for the invitation list and detail
// screens. Resend and revoke use the API; delete remains a mock operation.
// ----------------------------------------------------------------------

export function useInvitationActions({ organizationId, onChanged } = {}) {
  const confirm = useBoolean();
  const [pending, setPending] = useState(null);
  const [resendInvitation, { isLoading: isResending }] = useResendInvitationMutation();
  const [revokeInvitation, { isLoading: isRevoking }] = useRevokeInvitationMutation();

  const notifyChanged = useCallback(
    (invitation) => onChanged?.(invitation),
    [onChanged]
  );

  const resend = useCallback(
    async (row) => {
      if (isResending) return;

      try {
        const updated = await resendInvitation({
          invitationId: row._id,
          organizationId,
        }).unwrap();
        toast.success('Invitation resent.');
        notifyChanged(updated);
      } catch (error) {
        toast.error(error?.data?.message || 'Could not resend the invitation.');
      }
    },
    [isResending, organizationId, notifyChanged, resendInvitation]
  );

  const askRevoke = useCallback(
    (row) => {
      setPending({ type: 'revoke', row });
      confirm.onTrue();
    },
    [confirm]
  );

  const askDelete = useCallback(
    (row) => {
      setPending({ type: 'delete', row });
      confirm.onTrue();
    },
    [confirm]
  );

  const closeConfirm = useCallback(() => {
    confirm.onFalse();
    setPending(null);
  }, [confirm]);

  const onConfirm = useCallback(async () => {
    if (!pending) return;

    if (pending.type === 'revoke') {
      try {
        const updated = await revokeInvitation({
          invitationId: pending.row._id,
          organizationId,
        }).unwrap();
        toast.success('Invitation revoked.');
        notifyChanged(updated);
      } catch (error) {
        toast.error(error?.data?.message || 'Could not revoke the invitation.');
        return;
      }
    } else if (pending.type === 'delete') {
      // TODO: await deleteInvitation({ invitationId: pending.row._id, organizationId }).unwrap();
      deleteMockInvitation(pending.row._id);
      toast.success('Invitation removed.');
      notifyChanged(null);
    }

    closeConfirm();
  }, [pending, organizationId, notifyChanged, closeConfirm, revokeInvitation]);

  const confirmProps = useMemo(() => {
    const isDelete = pending?.type === 'delete';
    return {
      open: confirm.value,
      onClose: closeConfirm,
      onConfirm,
      confirmLabel: isDelete ? 'Remove' : 'Revoke',
      title: isDelete ? 'Remove invitation' : 'Revoke invitation',
      name: pending?.row?.name,
      isDelete,
      loading: pending?.type === 'revoke' && isRevoking,
    };
  }, [confirm.value, closeConfirm, onConfirm, pending, isRevoking]);

  return { resend, isResending, askRevoke, askDelete, confirmProps };
}
