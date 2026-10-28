import { useCallback, useState } from 'react';

import { toast } from 'src/components/snackbar';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useDecideFamilyInvitationMutation } from 'src/store/Reducer/family-invitations-api';

import { getInvitationId } from './mocks/data';

// ----------------------------------------------------------------------

export function useFamilyGroupInviteDialog() {
  const [open, setOpen] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [defaultResident, setDefaultResident] = useState(null);

  const openCreate = useCallback((resident = null) => {
    setInvitation(null);
    setDefaultResident(resident || null);
    setOpen(true);
  }, []);

  const openEdit = useCallback((row) => {
    if (!getInvitationId(row)) return;
    setDefaultResident(null);
    setInvitation(row);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setInvitation(null);
    setDefaultResident(null);
  }, []);

  return { open, invitation, defaultResident, openCreate, openEdit, close };
}

export function useFamilyGroupInvitationActions() {
  const { organizationId } = useCurrentOrganization();
  const [decideFamilyInvitation] = useDecideFamilyInvitationMutation();

  const runAction = useCallback(
    async (row, action, successMessage) => {
      const familyInvitationId = getInvitationId(row);
      if (!familyInvitationId) return;

      try {
        await decideFamilyInvitation({
          organizationId,
          familyInvitationId,
          action,
        }).unwrap();
        toast.success(successMessage);
      } catch (error) {
        toast.error(error?.data?.message || error?.message || `Failed to ${action} invitation`);
      }
    },
    [decideFamilyInvitation, organizationId]
  );

  const resend = useCallback(
    (row) => runAction(row, 'resend', 'Invitation resent'),
    [runAction]
  );

  const revoke = useCallback(
    (row) => runAction(row, 'revoke', 'Invitation revoked'),
    [runAction]
  );

  return { resend, revoke };
}
