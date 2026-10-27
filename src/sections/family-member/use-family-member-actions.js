import { useCallback, useState } from 'react';

import { toast } from 'src/components/snackbar';
import {
  useDecideFamilyMemberAccessMutation,
  useRemoveFamilyMemberMutation,
} from 'src/store/Reducer/family-members-api';

import { getFamilyMemberId } from './utils';

// ----------------------------------------------------------------------

export function useFamilyMemberActions({ organizationId, onChanged } = {}) {
  const [target, setTarget] = useState(null);
  const [dialogState, setDialogState] = useState({
    open: false,
    title: '',
    confirmLabel: 'Confirm',
    isDelete: false,
    isCurrentlyActive: true,
    loading: false,
  });
  const [decideFamilyMemberAccess] = useDecideFamilyMemberAccessMutation();
  const [removeFamilyMember] = useRemoveFamilyMemberMutation();

  const askDeactivate = useCallback((member) => {
    const isActive = member.status === 'active';
    setTarget(member);
    setDialogState({
      open: true,
      title: isActive ? 'Deactivate Family Member' : 'Reactivate Family Member',
      confirmLabel: isActive ? 'Deactivate' : 'Reactivate',
      isDelete: false,
      isCurrentlyActive: isActive,
      loading: false,
    });
  }, []);

  const askDelete = useCallback((member) => {
    setTarget(member);
    setDialogState({
      open: true,
      title: 'Remove Family Member',
      confirmLabel: 'Remove',
      isDelete: true,
      isCurrentlyActive: false,
      loading: false,
    });
  }, []);

  const handleClose = useCallback(() => {
    setDialogState((prev) => ({ ...prev, open: false }));
    setTarget(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    const memberId = getFamilyMemberId(target);
    if (!memberId) return;

    setDialogState((prev) => ({ ...prev, loading: true }));
    try {
      if (dialogState.isDelete) {
        await removeFamilyMember({
          organizationId,
          residentId: target.residentId,
          memberId,
        }).unwrap();
        toast.success(`Family member ${target.name} permanently removed`);
        onChanged?.(null);
      } else {
        const action = dialogState.isCurrentlyActive ? 'deactivate' : 'activate';
        await decideFamilyMemberAccess({ organizationId, memberId, action }).unwrap();
        toast.success(
          action === 'activate'
            ? `${target.name} reactivated successfully`
            : `${target.name} deactivated`
        );
        onChanged?.(target);
      }
      handleClose();
    } catch (error) {
      setDialogState((prev) => ({ ...prev, loading: false }));
      toast.error(error?.data?.message || error?.message || 'Action failed');
    }
  }, [
    decideFamilyMemberAccess,
    dialogState.isCurrentlyActive,
    dialogState.isDelete,
    handleClose,
    onChanged,
    organizationId,
    removeFamilyMember,
    target,
  ]);

  return {
    askDeactivate,
    askDelete,
    confirmProps: {
      ...dialogState,
      name: target?.name || '',
      onClose: handleClose,
      onConfirm: handleConfirm,
    },
  };
}
