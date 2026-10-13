import { useMemo } from 'react';

import { paths } from 'src/routes/paths';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { StaffProfileNewEditForm } from '../staff-profile-new-edit-form';

// ----------------------------------------------------------------------

export function StaffProfileCreateView({ pathsConfig, organizationId: propOrgId } = {}) {
  const { organizationId, isOwner } = useCurrentOrganization(propOrgId);

  const resolvedPaths = useMemo(
    () => ({
      dashboardRoot: isOwner ? paths.owner.root : paths.dashboard.root,
      root: isOwner ? paths.owner.staffProfiles.root : paths.dashboard.staffProfiles.root,
      detail: (id) =>
        isOwner ? paths.owner.staffProfiles.detail(id) : paths.dashboard.staffProfiles.detail(id),
      ...pathsConfig,
    }),
    [isOwner, pathsConfig]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Add a new staff profile"
        links={[
          { name: 'Dashboard', href: resolvedPaths.dashboardRoot },
          { name: 'Staff Profiles', href: resolvedPaths.root },
          { name: 'New staff profile' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <StaffProfileNewEditForm
        organizationId={organizationId}
        pathsConfig={resolvedPaths}
      />
    </DashboardContent>
  );
}
