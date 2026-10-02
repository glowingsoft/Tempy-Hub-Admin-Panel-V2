import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { StaffProfileNewEditForm } from '../staff-profile-new-edit-form';

// ----------------------------------------------------------------------

export function StaffProfileEditView({ staffProfile: currentStaffProfile, pathsConfig } = {}) {
  const { user } = useSelector((state) => state.user);
  const isOwner = user?.permission === 4;

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
        heading="Edit staff profile"
        links={[
          { name: 'Dashboard', href: resolvedPaths.dashboardRoot },
          { name: 'Staff Profiles', href: resolvedPaths.root },
          { name: currentStaffProfile?.user?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <StaffProfileNewEditForm
        organizationId={currentStaffProfile?.organizationId}
        currentStaffProfile={currentStaffProfile}
        pathsConfig={resolvedPaths}
      />
    </DashboardContent>
  );
}
