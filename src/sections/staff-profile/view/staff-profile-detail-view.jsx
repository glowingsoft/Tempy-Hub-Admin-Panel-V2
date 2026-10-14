import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useParams, useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

import { fDate, fDateTime } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';
import { useGetOrganizationByIdQuery } from 'src/store/Reducer/organizations-api';
import { useGetStaffProfileQuery } from 'src/store/Reducer/staff-profiles-api';
import { getMockStaffProfileById } from '../mocks/data';

// ----------------------------------------------------------------------

export function StaffProfileDetailView({ pathsConfig, organizationId: propOrgId } = {}) {
  const { id } = useParams();
  const router = useRouter();

  const { organizationId: resolvedOrgId, isOwner, organizationName: resolvedOrgName } =
    useCurrentOrganization(propOrgId);

  const resolvedPaths = useMemo(
    () => ({
      dashboardRoot: isOwner ? paths.owner.root : paths.dashboard.root,
      root: isOwner
        ? paths.owner.staffProfiles.root
        : resolvedOrgId
          ? `${paths.dashboard.organizations.detail(resolvedOrgId)}?tab=staff-profiles`
          : paths.dashboard.staffProfiles.root,
      edit: (profileId) =>
        isOwner
          ? paths.owner.staffProfiles.edit(profileId)
          : resolvedOrgId
            ? `${paths.dashboard.staffProfiles.edit(profileId)}?orgId=${resolvedOrgId}`
            : paths.dashboard.staffProfiles.edit(profileId),
      ...pathsConfig,
    }),
    [isOwner, pathsConfig, resolvedOrgId]
  );

  const {
    data: apiProfile,
    isLoading,
    isFetching,
  } = useGetStaffProfileQuery(
    { staffProfileId: id, organizationId: resolvedOrgId },
    { skip: !id }
  );

  const mockProfile = useMemo(() => getMockStaffProfileById(id), [id]);
  const rawProfile = apiProfile || mockProfile;
  // Handle cases where response might be wrapped in data or direct object
  const profile = rawProfile?.data && !rawProfile?._id ? rawProfile.data : rawProfile;

  const orgIdForLookups =
    (typeof profile?.organizationId === 'object'
      ? profile.organizationId._id
      : profile?.organizationId) || resolvedOrgId;

  const { data: orgData, isLoading: isOrgLoading } = useGetOrganizationByIdQuery(orgIdForLookups, {
    skip: !orgIdForLookups,
  });
  const organization = orgData?.data || orgData;

  const {
    branchesMap,
    jobTitlesMap,
    departmentsMap,
    isLoading: isLookupsLoading,
  } = useOrganizationLookups({
    organizationId: orgIdForLookups,
    limit: 100,
  });

  // Keep the loader up until the profile and everything it resolves names from has loaded.
  if (isLoading || isFetching || isOrgLoading || isLookupsLoading) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <LoadingScreen sx={{ py: 10 }} />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          onClick={() => router.push(resolvedPaths.root)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title="Staff profile not found" sx={{ py: 10 }} />
      </Box>
    );
  }

  // Site / Branch name
  const branchName =
    profile.branch?.name ||
    (typeof profile.branchId === 'object' && profile.branchId?.name) ||
    profile.branchName ||
    (typeof profile.branch === 'string' && branchesMap[profile.branch]?.name) ||
    (typeof profile.branchId === 'string' && branchesMap[profile.branchId]?.name) ||
    '—';

  // Job title name
  const jobTitleName =
    profile.jobTitle?.name ||
    (typeof profile.jobTitleId === 'object' && profile.jobTitleId?.name) ||
    profile.jobTitleName ||
    (typeof profile.jobTitle === 'string' && jobTitlesMap[profile.jobTitle]?.name) ||
    (typeof profile.jobTitleId === 'string' && jobTitlesMap[profile.jobTitleId]?.name) ||
    '—';

  // Departments
  const departmentNames = (() => {
    const list =
      Array.isArray(profile.departments) && profile.departments.length > 0
        ? profile.departments
        : Array.isArray(profile.departmentIds) && profile.departmentIds.length > 0
          ? profile.departmentIds
          : [];

    if (list.length > 0) {
      const names = list
        .map((d) => {
          if (typeof d === 'object' && d?.name) return d.name;
          const id = typeof d === 'object' ? d?._id : d;
          return departmentsMap[id]?.name || id;
        })
        .filter(Boolean);
      if (names.length > 0) return names.join(', ');
    }
    if (profile.department?.name) {
      return profile.department.name;
    }
    return '—';
  })();

  const staffName =
    profile.userId?.name ||
    profile.user?.name ||
    profile.userName ||
    profile.name ||
    '—';

  const staffEmail =
    profile.userId?.email ||
    profile.user?.email ||
    profile.userEmail ||
    profile.email ||
    '—';

  const reportsTo =
    (typeof profile.reportsToStaffId === 'object'
      ? profile.reportsToStaffId?.employeeCode ||
        profile.reportsToStaffId?.userId?.name ||
        profile.reportsToStaffId?._id
      : profile.reportsToStaffId) || '—';

  const orgName =
    profile.organization?.name ||
    (typeof profile.organizationId === 'object' && profile.organizationId?.name) ||
    organization?.name ||
    profile.organizationName ||
    resolvedOrgName ||
    '—';

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading={staffName !== '—' ? staffName : 'Staff profile'}
        links={[
          { name: 'Dashboard', href: resolvedPaths.dashboardRoot },
          ...(isOwner
            ? [{ name: 'Staff Profiles', href: resolvedPaths.root }]
            : [
                { name: 'Organizations', href: paths.dashboard.organizations.root },
                ...(orgIdForLookups && orgName !== '—'
                  ? [
                      {
                        name: orgName,
                        href: `${paths.dashboard.organizations.detail(orgIdForLookups)}?tab=staff-profiles`,
                      },
                    ]
                  : []),
                { name: 'Staff Profiles', href: resolvedPaths.root },
              ]),
          { name: staffName !== '—' ? staffName : 'Staff profile' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={resolvedPaths.edit(profile._id || id)}
            variant="contained"
            startIcon={<Iconify icon="solar:pen-bold" />}
          >
            Edit
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        <DetailCard title="User">
          <DetailItem label="Name" value={staffName} />
          <DetailItem label="Email" value={staffEmail} />
          <DetailItem label="Phone" value={profile.phone || '—'} />
          <DetailItem label="Employee Code" value={profile.employeeCode || '—'} />
          <DetailItem label="Status" value={profile.status ? profile.status.toUpperCase() : '—'} />
        </DetailCard>

        <DetailCard title="Assignment">
          <DetailItem label="Site / Branch" value={branchName} />
          <DetailItem label="Job Title" value={jobTitleName} />
          <DetailItem label="Departments" value={departmentNames} />
          <DetailItem label="Start Date" value={fDate(profile.startDate)} />
          <DetailItem
            label="Weekly Hours"
            value={
              profile.contractedWeeklyHours != null
                ? `${profile.contractedWeeklyHours} hrs`
                : '—'
            }
          />
          <DetailItem label="Ward" value={profile.ward || '—'} />
          <DetailItem label="Location Label" value={profile.locationLabel || '—'} />
          <DetailItem label="Reports To" value={reportsTo} />
          {profile.pin && <DetailItem label="PIN" value={profile.pin} />}
          {profile.hourlyRate != null && (
            <DetailItem
              label="Hourly Rate"
              value={fCurrency(profile.hourlyRate, { code: 'en-GB', currency: 'GBP' })}
            />
          )}
          <DetailItem
            label="Organization"
            value={
              !isOwner && orgIdForLookups && orgName !== '—' ? (
                <Link
                  component={RouterLink}
                  href={`${paths.dashboard.organizations.detail(orgIdForLookups)}?tab=staff-profiles`}
                  color="inherit"
                  sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                >
                  {orgName}
                </Link>
              ) : (
                orgName
              )
            }
          />
        </DetailCard>

        <DetailCard title="Record">
          <DetailItem label="Created At" value={fDateTime(profile.createdAt)} />
          <DetailItem label="Updated At" value={fDateTime(profile.updatedAt)} />
        </DetailCard>
      </Stack>
    </Box>
  );
}

// ----------------------------------------------------------------------

function DetailCard({ title, children }) {
  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6">{title}</Typography>
      <Divider sx={{ my: 2 }} />
      <Box
        sx={{
          display: 'grid',
          rowGap: 2.5,
          columnGap: 3,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
        }}
      >
        {children}
      </Box>
    </Card>
  );
}

function DetailItem({ label, value }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Stack>
  );
}