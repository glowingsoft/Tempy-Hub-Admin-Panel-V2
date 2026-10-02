import { useSelector } from 'react-redux';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { MembershipNewEditForm } from '../membership-new-edit-form';
import { getOwnerOrganizationId } from '../utils';

// ----------------------------------------------------------------------

export function MembershipCreateView() {
  const { user } = useSelector((state) => state.user);
  const organizationId = getOwnerOrganizationId(user);

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
