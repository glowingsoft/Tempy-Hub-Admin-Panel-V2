import { useCallback, useMemo, useState } from 'react';

import { useBoolean } from 'src/hooks/use-boolean';
import { toast } from 'src/components/snackbar';
import { useDecideFamilyInvitationMutation } from 'src/store/Reducer/family-invitations-api';

import { getInvitationId } from './utils';

// ----------------------------------------------------------------------

export function useFamilyInvitationActions({ organizationId, onChanged } = {}) {
  const confirm = useBoolean();
  const [pending, setPending] = useState(null);
  const [decideFamilyInvitation, { isLoading: isDeciding }] = useDecideFamilyInvitationMutation();

  const resend = useCallback(
    async (row) => {
      const familyInvitationId = getInvitationId(row);
      if (!familyInvitationId || isDeciding) return;
      try {
        const updated = await decideFamilyInvitation({
          organizationId,
          familyInvitationId,
          action: 'resend',
        }).unwrap();
        toast.success(`Invitation resent to ${row.name}`);
        onChanged?.(updated);
      } catch (error) {
        toast.error(error?.data?.message || error?.message || 'Failed to resend invitation');
      }
    },
    [decideFamilyInvitation, isDeciding, onChanged, organizationId]
  );

  const askRevoke = useCallback(
    (row) => {
      setPending(row);
      confirm.onTrue();
    },
    [confirm]
  );

  const closeConfirm = useCallback(() => {
    confirm.onFalse();
    setPending(null);
  }, [confirm]);

  const onConfirm = useCallback(async () => {
    const familyInvitationId = getInvitationId(pending);
    if (!familyInvitationId) return;
    try {
      const updated = await decideFamilyInvitation({
        organizationId,
        familyInvitationId,
        action: 'revoke',
      }).unwrap();
      toast.success(`Invitation for ${pending.name} revoked`);
      onChanged?.(updated);
      closeConfirm();
    } catch (error) {
      toast.error(error?.data?.message || error?.message || 'Failed to revoke invitation');
    }
  }, [closeConfirm, decideFamilyInvitation, onChanged, organizationId, pending]);

  const confirmProps = useMemo(
    () => ({
      open: confirm.value,
      onClose: closeConfirm,
      onConfirm,
      confirmLabel: 'Revoke',
      title: 'Revoke Family Invitation',
      name: pending?.name || '',
      loading: isDeciding,
    }),
    [closeConfirm, confirm.value, isDeciding, onConfirm, pending]
  );

  return { resend, askRevoke, confirmProps };
}
