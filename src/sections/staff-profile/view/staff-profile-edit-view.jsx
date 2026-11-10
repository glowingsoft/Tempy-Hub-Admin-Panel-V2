import { useMemo } from 'react';

import { useParams } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { LoadingScreen } from 'src/components/loading-screen';
import { useGetStaffProfileQuery } from 'src/store/Reducer/staff-profiles-api';

import { StaffProfileNewEditForm } from '../staff-profile-new-edit-form';

// ----------------------------------------------------------------------

export function StaffProfileEditView({ staffProfile: propStaffProfile, pathsConfig } = {}) {
  const { id } = useParams();
  const { organizationId, isOwner } = useCurrentOrganization();

  const profileId = id || propStaffProfile?._id;

  const {
    data: apiProfile,
    isLoading,
    isFetching,
  } = useGetStaffProfileQuery(
    { staffProfileId: profileId, organizationId },
    { skip: !profileId }
  );

  const currentStaffProfile = apiProfile || propStaffProfile;

  const resolvedPaths = useMemo(
    () => ({
      dashboardRoot: isOwner ? paths.owner.root : paths.dashboard.root,
      root: isOwner ? paths.owner.staffProfiles.root : paths.dashboard.staffProfiles.root,
      detail: (detailId) =>
        isOwner
          ? paths.owner.staffProfiles.detail(detailId)
          : organizationId
            ? `${paths.dashboard.staffProfiles.detail(detailId)}?orgId=${organizationId}`
            : paths.dashboard.staffProfiles.detail(detailId),
      ...pathsConfig,
    }),
    [isOwner, pathsConfig, organizationId]
  );

  if (isLoading || isFetching) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Edit staff profile"
          links={[
            { name: 'Dashboard', href: resolvedPaths.dashboardRoot },
            { name: 'Staff Profiles', href: resolvedPaths.root },
            { name: 'Loading...' },
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        <LoadingScreen sx={{ py: 10 }} />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit staff profile"
        links={[
          { name: 'Dashboard', href: resolvedPaths.dashboardRoot },
          { name: 'Staff Profiles', href: resolvedPaths.root },
          { name: currentStaffProfile?.userId?.name || currentStaffProfile?.user?.name || 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <StaffProfileNewEditForm
        organizationId={currentStaffProfile?.organizationId || organizationId}
        currentStaffProfile={currentStaffProfile}
        pathsConfig={resolvedPaths}
      />
    </DashboardContent>
  );
}
