import { useCallback, useMemo, useState } from 'react';

import { useBoolean } from 'src/hooks/use-boolean';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';

import { toast } from 'src/components/snackbar';
import { useDeactivateMembershipMutation } from 'src/store/Reducer/members-api';
import { deactivateMockMember } from './mocks/data';

// ----------------------------------------------------------------------
// Shared deactivate behaviour for the member list and detail screens.
// ----------------------------------------------------------------------

export function useMemberActions({ organizationId: orgIdProp, onChanged } = {}) {
  const confirm = useBoolean();
  const [pending, setPending] = useState(null);

  const { organizationId } = useCurrentOrganization(orgIdProp);

  const [deactivateMembership, { isLoading: isDeactivating }] = useDeactivateMembershipMutation();

  const askDeactivate = useCallback(
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
    if (!pending) return;

    const membershipId = pending.membershipId ?? pending._id;
    const resolvedOrgId = organizationId || pending.organizationId;

    try {
      const response = await deactivateMembership({
        membershipId,
        organizationId: resolvedOrgId,
      }).unwrap();

      toast.success(response?.message || 'Membership deactivated successfully');
      onChanged?.(response);
      closeConfirm();
    } catch (error) {
      if (typeof membershipId === 'string' && membershipId.startsWith('mem-')) {
        const updated = deactivateMockMember(membershipId);
        toast.success('Membership deactivated successfully');
        onChanged?.(updated);
        closeConfirm();
      }
    }
  }, [pending, organizationId, deactivateMembership, onChanged, closeConfirm]);

  const confirmProps = useMemo(
    () => ({
      open: confirm.value,
      onClose: closeConfirm,
      onConfirm,
      loading: isDeactivating,
      name: pending?.name || pending?.user?.name,
    }),
    [confirm.value, closeConfirm, onConfirm, isDeactivating, pending]
  );

  return { askDeactivate, confirmProps, isDeactivating };
}
