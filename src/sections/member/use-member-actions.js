import { useCallback, useMemo, useState } from 'react';

import { useBoolean } from 'src/hooks/use-boolean';

import { toast } from 'src/components/snackbar';

// import { useDeactivateMembershipMutation } from 'src/store/Reducer/members-api';
import { deactivateMockMember } from './mocks/data';

// ----------------------------------------------------------------------
// Shared deactivate behaviour for the member list and detail screens — keeps the
// (mock) mutation + confirmation logic in one place. Deactivation is NOT a
// delete: the membership stays, its status just flips to "inactive".
// ----------------------------------------------------------------------

export function useMemberActions({ organizationId, onChanged } = {}) {
  const confirm = useBoolean();
  const [pending, setPending] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const [deactivateMembership] = useDeactivateMembershipMutation();

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

    setIsSubmitting(true);
    try {
      // TODO: await deactivateMembership({
      //   membershipId: pending.membershipId ?? pending._id,
      //   organizationId,
      // }).unwrap();
      const updated = deactivateMockMember(pending.membershipId ?? pending._id);
      toast.success('Membership deactivated.');
      onChanged?.(updated);
      closeConfirm();
    } catch (error) {
      toast.error(error?.data?.message || 'Could not deactivate the membership.');
    } finally {
      setIsSubmitting(false);
    }
  }, [pending, organizationId, onChanged, closeConfirm]);

  const confirmProps = useMemo(
    () => ({
      open: confirm.value,
      onClose: closeConfirm,
      onConfirm,
      loading: isSubmitting,
      name: pending?.name,
    }),
    [confirm.value, closeConfirm, onConfirm, isSubmitting, pending]
  );

  return { askDeactivate, confirmProps };
}
