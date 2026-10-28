import { useState } from 'react';

import { FamilyGroupDetails } from '../family-group-details';
import { FamilyGroupList } from '../family-group-list';
import { FamilyGroupManageDialog } from '../family-group-manage-dialog';
import { useFamilyGroupInvitationActions, useFamilyGroupInviteDialog } from '../use-family-group';

// ----------------------------------------------------------------------

export function FamilyGroupView() {
  const [selectedResidentId, setSelectedResidentId] = useState(null);
  const dialog = useFamilyGroupInviteDialog();
  const { resend, revoke } = useFamilyGroupInvitationActions();

  return (
    <>
      {selectedResidentId ? (
        <FamilyGroupDetails
          residentId={selectedResidentId}
          onBack={() => setSelectedResidentId(null)}
          onInvite={dialog.openCreate}
          onEdit={dialog.openEdit}
          onResend={resend}
          onRevoke={revoke}
        />
      ) : (
        <FamilyGroupList
          onView={(row) => setSelectedResidentId(row.residentId)}
          onInvite={dialog.openCreate}
        />
      )}

      <FamilyGroupManageDialog
        open={dialog.open}
        onClose={dialog.close}
        invitation={dialog.invitation}
        defaultResident={dialog.defaultResident}
      />
    </>
  );
}

export default FamilyGroupView;
