import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { MembershipNewEditForm } from '../membership-new-edit-form';

// ----------------------------------------------------------------------

export function MembershipEditView({ membership: currentMembership }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit invitation"
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Invitations', href: paths.owner.memberships.invitations.root },
          { name: currentMembership?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <MembershipNewEditForm
        organizationId={currentMembership?.organizationId}
        currentMembership={currentMembership}
      />
    </DashboardContent>
  );
}
