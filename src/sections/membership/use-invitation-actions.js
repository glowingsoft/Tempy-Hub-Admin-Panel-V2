import { useCallback, useMemo, useState } from 'react';

import { useBoolean } from 'src/hooks/use-boolean';

import { toast } from 'src/components/snackbar';

// import {
//   useResendInvitationMutation,
//   useRevokeInvitationMutation,
//   useDeleteInvitationMutation,
// } from 'src/store/Reducer/invitations-api';
import { deleteMockInvitation, resendMockInvitation, revokeMockInvitation } from './mocks/data';

// ----------------------------------------------------------------------
// Shared resend / revoke / delete behaviour for the invitation list and detail
// screens — keeps the (mock) mutation + confirmation logic in one place.
// ----------------------------------------------------------------------

export function useInvitationActions({ organizationId, onChanged } = {}) {
  const confirm = useBoolean();
  const [pending, setPending] = useState(null);

  const notifyChanged = useCallback(
    (invitation) => onChanged?.(invitation),
    [onChanged]
  );

  const resend = useCallback(
    (row) => {
      // TODO: await resendInvitation({ invitationId: row._id, organizationId }).unwrap();
      const updated = resendMockInvitation(row._id);
      toast.success('Invitation resent — expiry and link updated.');
      notifyChanged(updated);
    },
    [organizationId, notifyChanged]
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

  const onConfirm = useCallback(() => {
    if (!pending) return;

    if (pending.type === 'revoke') {
      // TODO: await revokeInvitation({ invitationId: pending.row._id, organizationId }).unwrap();
      const updated = revokeMockInvitation(pending.row._id);
      toast.success('Invitation revoked.');
      notifyChanged(updated);
    } else if (pending.type === 'delete') {
      // TODO: await deleteInvitation({ invitationId: pending.row._id, organizationId }).unwrap();
      deleteMockInvitation(pending.row._id);
      toast.success('Invitation removed.');
      notifyChanged(null);
    }

    closeConfirm();
  }, [pending, organizationId, notifyChanged, closeConfirm]);

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
    };
  }, [confirm.value, closeConfirm, onConfirm, pending]);

  return { resend, askRevoke, askDelete, confirmProps };
}
