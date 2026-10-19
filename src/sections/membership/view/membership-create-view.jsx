import { paths } from 'src/routes/paths';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { MembershipNewEditForm } from '../membership-new-edit-form';

// ----------------------------------------------------------------------

export function MembershipCreateView() {
  const { organizationId } = useCurrentOrganization();

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="New invitation"
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Invitations', href: paths.owner.memberships.invitations.root },
          { name: 'New invitation' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <MembershipNewEditForm organizationId={organizationId} />
    </DashboardContent>
  );
}
