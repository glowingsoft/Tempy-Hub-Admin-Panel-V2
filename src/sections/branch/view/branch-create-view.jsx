import { useSelector } from 'react-redux';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { mockOrganizations } from 'src/sections/organization/mocks/data';

import { BranchNewEditForm } from '../branch-new-edit-form';
import { getOwnerOrganizationId } from '../utils';

// ----------------------------------------------------------------------

export function BranchCreateView() {
  const { user } = useSelector((state) => state.user);
  const organizationId = getOwnerOrganizationId(user) ?? mockOrganizations[0]?._id ?? null;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Add a new site"
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Sites', href: paths.owner.sites.root },
          { name: 'New site' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <BranchNewEditForm organizationId={organizationId} />
    </DashboardContent>
  );
}
