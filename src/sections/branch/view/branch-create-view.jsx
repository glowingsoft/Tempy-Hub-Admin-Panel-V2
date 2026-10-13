import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';

import { BranchNewEditForm } from '../branch-new-edit-form';

// ----------------------------------------------------------------------

export function BranchCreateView() {
  const { organizationId } = useCurrentOrganization();

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
