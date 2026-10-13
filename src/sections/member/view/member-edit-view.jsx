import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { MemberEditForm } from '../member-edit-form';

// ----------------------------------------------------------------------

export function MemberEditView({ member: currentMember }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit membership"
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Members', href: paths.owner.memberships.members.root },
          { name: currentMember?.name || currentMember?.user?.name || 'Member' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <MemberEditForm
        organizationId={currentMember?.organizationId}
        currentMember={currentMember}
      />
    </DashboardContent>
  );
}
