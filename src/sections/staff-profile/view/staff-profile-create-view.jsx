import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { StaffProfileNewEditForm } from '../staff-profile-new-edit-form';
import { getOwnerOrganizationId } from '../utils';

// ----------------------------------------------------------------------

export function StaffProfileCreateView({ pathsConfig, organizationId: propOrgId } = {}) {
  const { user } = useSelector((state) => state.user);
  const isOwner = user?.permission === 4;
  const organizationId =
    propOrgId !== undefined ? propOrgId : (isOwner ? getOwnerOrganizationId(user) : null);

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
