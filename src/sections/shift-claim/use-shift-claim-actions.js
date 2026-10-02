import { useCallback, useMemo, useState } from 'react';

import { useBoolean } from 'src/hooks/use-boolean';

import { toast } from 'src/components/snackbar';

// import { useApproveShiftClaimMutation } from 'src/store/Reducer/shift-claims-api';
import { approveMockShiftClaim } from './mocks/data';

// ----------------------------------------------------------------------
// Shared approve behaviour for the shift-claim list and detail screens — keeps
// the (mock) mutation + confirmation logic in one place.
// ----------------------------------------------------------------------

export function useShiftClaimActions({ organizationId, onChanged } = {}) {
  const confirm = useBoolean();
  const [pending, setPending] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const [approveShiftClaim] = useApproveShiftClaimMutation();

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
      // TODO: await approveShiftClaim({ shiftClaimId: pending._id, organizationId }).unwrap();
      const updated = approveMockShiftClaim(pending._id);
      toast.success('Shift claim approved.');
      onChanged?.(updated);
      closeConfirm();
    } catch (error) {
      toast.error(error?.data?.message || 'Could not approve the shift claim.');
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
      claim: pending,
    }),
    [confirm.value, closeConfirm, onConfirm, isSubmitting, pending]
  );

  return { askApprove, confirmProps };
}
