import { useCallback, useMemo, useState } from 'react';

import { useBoolean } from 'src/hooks/use-boolean';

import { toast } from 'src/components/snackbar';

import {
  useApproveLeaveRequestMutation,
  useRejectLeaveRequestMutation,
} from 'src/store/Reducer/leave-requests-api';

// ----------------------------------------------------------------------
// Shared approve / reject behaviour for the leave-request list and detail
// screens — keeps the mutation + confirmation logic in one place so the
// Owner and Line Manager surfaces behave identically.
// ----------------------------------------------------------------------

export function useLeaveRequestActions({ organizationId, onChanged } = {}) {
  const confirm = useBoolean();
  const [pending, setPending] = useState(null); // { mode: 'approve' | 'reject', row }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [approveLeaveRequest] = useApproveLeaveRequestMutation();
  const [rejectLeaveRequest] = useRejectLeaveRequestMutation();

  const askApprove = useCallback(
    (row) => {
      setPending({ mode: 'approve', row });
      confirm.onTrue();
    },
    [confirm]
  );

  const askReject = useCallback(
    (row) => {
      setPending({ mode: 'reject', row });
      confirm.onTrue();
    },
    [confirm]
  );

  const closeConfirm = useCallback(() => {
    confirm.onFalse();
    setPending(null);
  }, [confirm]);

  const onConfirm = useCallback(
    async (decisionNote = '') => {
      if (!pending) return;

      setIsSubmitting(true);
      try {
        const rowOrgId =
          (typeof pending.row?.organizationId === 'object'
            ? pending.row?.organizationId?._id
            : pending.row?.organizationId) || organizationId;

        let res;
        if (pending.mode === 'reject') {
          res = await rejectLeaveRequest({
            leaveRequestId: pending.row._id,
            organizationId: rowOrgId,
            decisionNote,
          }).unwrap();
          toast.success('Leave request rejected.');
        } else {
          res = await approveLeaveRequest({
            leaveRequestId: pending.row._id,
            organizationId: rowOrgId,
          }).unwrap();
          toast.success('Leave request approved.');
        }
        onChanged?.(res?.data || res || pending.row);
        closeConfirm();
      } catch (error) {
        if (!error?.status) {
          toast.error(error?.message || 'Could not update the leave request.');
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [pending, organizationId, onChanged, closeConfirm, approveLeaveRequest, rejectLeaveRequest]
  );

  const dialogProps = useMemo(
    () => ({
      open: confirm.value,
      mode: pending?.mode ?? 'approve',
      request: pending?.row ?? null,
      loading: isSubmitting,
      onClose: closeConfirm,
      onConfirm,
    }),
    [confirm.value, pending, isSubmitting, closeConfirm, onConfirm]
  );

  return { askApprove, askReject, dialogProps };
}
