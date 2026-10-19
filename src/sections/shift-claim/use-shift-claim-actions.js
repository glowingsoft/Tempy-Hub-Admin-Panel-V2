import { useCallback, useMemo, useState } from 'react';

import { useBoolean } from 'src/hooks/use-boolean';

import { toast } from 'src/components/snackbar';

import { useApproveShiftClaimMutation } from 'src/store/Reducer/shift-claims-api';

// ----------------------------------------------------------------------
// Shared approve behaviour for the shift-claim list and detail screens — keeps
// the mutation + confirmation logic in one place.
// ----------------------------------------------------------------------

export function useShiftClaimActions({ organizationId, onChanged } = {}) {
  const confirm = useBoolean();
  const [pending, setPending] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [approveShiftClaim] = useApproveShiftClaimMutation();

  const askApprove = useCallback(
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
      const activeOrgId =
        organizationId ||
        (typeof pending.organizationId === 'object' ? pending.organizationId?._id : pending.organizationId);

      const res = await approveShiftClaim({
        shiftClaimId: pending._id,
        organizationId: activeOrgId,
      }).unwrap();

      toast.success(res?.message || 'Shift claim approved successfully.');
      onChanged?.(res?.data || res);
      closeConfirm();
    } catch (error) {
      if (!error?.status) {
        toast.error(error?.data?.message || error?.message || 'Could not approve the shift claim.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [pending, organizationId, approveShiftClaim, onChanged, closeConfirm]);

  const confirmProps = useMemo(
    () => ({
      open: confirm.value,
      onClose: closeConfirm,
      onConfirm,
      loading: isSubmitting,
      claim: pending,
    }),
    [confirm.value, closeConfirm, onConfirm, isSubmitting, pending]
  );

  return { askApprove, confirmProps };
}
