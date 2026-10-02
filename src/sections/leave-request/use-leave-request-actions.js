import { useCallback, useMemo, useState } from 'react';

import { useBoolean } from 'src/hooks/use-boolean';

import { toast } from 'src/components/snackbar';

// import {
//   useApproveLeaveRequestMutation,
//   useRejectLeaveRequestMutation,
// } from 'src/store/Reducer/leave-requests-api';
import { approveMockLeaveRequest, rejectMockLeaveRequest } from './mocks/data';

// ----------------------------------------------------------------------
// Shared approve / reject behaviour for the leave-request list and detail
// screens — keeps the (mock) mutation + confirmation logic in one place so the
// Owner and Line Manager surfaces behave identically.
// ----------------------------------------------------------------------

export function useLeaveRequestActions({ organizationId, onChanged } = {}) {
  const confirm = useBoolean();
  const [pending, setPending] = useState(null); // { mode: 'approve' | 'reject', row }
  const [isSubmitting, setIsSubmitting] = useState(false);

  // const [approveLeaveRequest] = useApproveLeaveRequestMutation();
  // const [rejectLeaveRequest] = useRejectLeaveRequestMutation();

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
        let updated;
        if (pending.mode === 'reject') {
          // TODO: await rejectLeaveRequest({ leaveRequestId: pending.row._id, organizationId, decisionNote }).unwrap();
          updated = rejectMockLeaveRequest(pending.row._id, decisionNote);
          toast.success('Leave request rejected.');
        } else {
          // TODO: await approveLeaveRequest({ leaveRequestId: pending.row._id, organizationId }).unwrap();
          updated = approveMockLeaveRequest(pending.row._id);
          toast.success('Leave request approved.');
        }
        onChanged?.(updated);
        closeConfirm();
      } catch (error) {
        toast.error(error?.data?.message || 'Could not update the leave request.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [pending, organizationId, onChanged, closeConfirm]
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
