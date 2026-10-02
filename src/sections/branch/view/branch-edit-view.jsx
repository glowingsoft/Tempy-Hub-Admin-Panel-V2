import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { BranchNewEditForm } from '../branch-new-edit-form';

// ----------------------------------------------------------------------

export function BranchEditView({ branch: currentBranch }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit site"
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Sites', href: paths.owner.sites.root },
          { name: currentBranch?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <BranchNewEditForm
        organizationId={currentBranch?.organizationId}
        currentBranch={currentBranch}
      />
    </DashboardContent>
  );
}
