import { useState, useCallback } from 'react';

import { toast } from 'src/components/snackbar';

import {
  resendMockFamilyInvitation,
  revokeMockFamilyInvitation,
  deleteMockFamilyInvitation,
  toggleFamilyMemberStatus,
  deleteMockFamilyMember,
} from './mocks/data';

// ----------------------------------------------------------------------
// Invitation Actions Hook
// ----------------------------------------------------------------------

export function useFamilyMembershipActions({ onChanged }) {
  const [target, setTarget] = useState(null);
  const [dialogState, setDialogState] = useState({
    open: false,
    title: '',
    confirmLabel: 'Confirm',
    isDelete: false,
    loading: false,
  });

  const resend = useCallback((invitation) => {
    try {
      resendMockFamilyInvitation(invitation._id);
      toast.success(`Invitation resent to ${invitation.name}`);
      onChanged?.(invitation);
    } catch (e) {
      toast.error('Failed to resend invitation');
    }
  }, [onChanged]);

  const askRevoke = useCallback((invitation) => {
    setTarget(invitation);
    setDialogState({
      open: true,
      title: 'Revoke Family Invitation',
      confirmLabel: 'Revoke',
      isDelete: false,
      loading: false,
    });
  }, []);

  const askDelete = useCallback((invitation) => {
    setTarget(invitation);
    setDialogState({
      open: true,
      title: 'Delete Invitation',
      confirmLabel: 'Delete',
      isDelete: true,
      loading: false,
    });
  }, []);

  const handleClose = useCallback(() => {
    setDialogState((prev) => ({ ...prev, open: false }));
    setTarget(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!target) return;
    setDialogState((prev) => ({ ...prev, loading: true }));
    try {
      if (dialogState.isDelete) {
        deleteMockFamilyInvitation(target._id);
        toast.success(`Invitation for ${target.name} permanently removed`);
        onChanged?.(null);
      } else {
        const updated = revokeMockFamilyInvitation(target._id);
        toast.success(`Invitation for ${target.name} revoked`);
        onChanged?.(updated);
      }
    } catch (e) {
      toast.error('Action failed');
    } finally {
      handleClose();
    }
  }, [target, dialogState.isDelete, onChanged, handleClose]);

  return {
    resend,
    askRevoke,
    askDelete,
    confirmProps: {
      ...dialogState,
      name: target?.name || '',
      onClose: handleClose,
      onConfirm: handleConfirm,
    },
  };
}

// ----------------------------------------------------------------------
// Member Actions Hook
// ----------------------------------------------------------------------

export function useFamilyMemberActions({ onChanged }) {
  const [target, setTarget] = useState(null);
  const [dialogState, setDialogState] = useState({
    open: false,
    title: '',
    confirmLabel: 'Confirm',
    isDelete: false,
    isCurrentlyActive: true,
    loading: false,
  });

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
      title: 'Delete Family Member',
      confirmLabel: 'Delete',
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
    if (!target) return;
    setDialogState((prev) => ({ ...prev, loading: true }));
    try {
      if (dialogState.isDelete) {
        deleteMockFamilyMember(target._id);
        toast.success(`Family member ${target.name} permanently removed`);
        onChanged?.(null);
      } else {
        const updated = toggleFamilyMemberStatus(target._id);
        const newStatus = updated.status;
        toast.success(
          newStatus === 'active'
            ? `${target.name} reactivated successfully`
            : `${target.name} deactivated`
        );
        onChanged?.(updated);
      }
    } catch (e) {
      toast.error('Action failed');
    } finally {
      handleClose();
    }
  }, [target, dialogState.isDelete, onChanged, handleClose]);

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