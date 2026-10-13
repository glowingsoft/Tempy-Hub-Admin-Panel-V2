import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
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

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';
import { useGetStaffProfileQuery } from 'src/store/Reducer/staff-profiles-api';
import { getMockStaffProfileById } from '../mocks/data';

// ----------------------------------------------------------------------

export function StaffProfileDetailView({ pathsConfig, organizationId: propOrgId } = {}) {
  const { id } = useParams();
  const router = useRouter();

  const { organizationId: resolvedOrgId, isOwner } = useCurrentOrganization(propOrgId);

  const resolvedPaths = useMemo(
    () => ({
      dashboardRoot: isOwner ? paths.owner.root : paths.dashboard.root,
      root: isOwner ? paths.owner.staffProfiles.root : paths.dashboard.staffProfiles.root,
      edit: (profileId) =>
        isOwner
          ? paths.owner.staffProfiles.edit(profileId)
          : paths.dashboard.staffProfiles.edit(profileId),
      ...pathsConfig,
    }),
    [isOwner, pathsConfig]
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

  const orgIdForLookups = profile?.organizationId || resolvedOrgId;
  const { branchesMap, jobTitlesMap, departmentsMap } = useOrganizationLookups(orgIdForLookups);

  if (isLoading || isFetching) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', py: 4 }}>
          Loading staff profile...
        </Typography>
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
    profile.branchName ||
    (typeof profile.branch === 'string' && branchesMap[profile.branch]?.name) ||
    (profile.branchId && branchesMap[profile.branchId]?.name) ||
    '—';

  // Job title name
  const jobTitleName =
    profile.jobTitle?.name ||
    profile.jobTitleName ||
    (typeof profile.jobTitle === 'string' && jobTitlesMap[profile.jobTitle]?.name) ||
    (profile.jobTitleId && jobTitlesMap[profile.jobTitleId]?.name) ||
    '—';

  // Departments
  const departmentNames = (() => {
    if (Array.isArray(profile.departments) && profile.departments.length > 0) {
      if (typeof profile.departments[0] === 'object' && profile.departments[0]?.name) {
        return profile.departments.map((d) => d.name).filter(Boolean).join(', ');
      }
      if (typeof profile.departments[0] === 'string') {
        const names = profile.departments.map((depId) => departmentsMap[depId]?.name || depId).filter(Boolean);
        if (names.length > 0) return names.join(', ');
      }
    }
    if (Array.isArray(profile.departmentIds) && profile.departmentIds.length > 0) {
      const names = profile.departmentIds.map((depId) => departmentsMap[depId]?.name || depId).filter(Boolean);
      if (names.length > 0) return names.join(', ');
    }
    if (profile.department?.name) {
      return profile.department.name;
    }
    return '—';
  })();

  const staffName = profile.user?.name || profile.userName || profile.name || '—';
  const staffEmail = profile.user?.email || profile.userEmail || profile.email || '—';
  const orgName = profile.organization?.name || profile.organizationName || '—';

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
          { name: 'Staff Profiles', href: resolvedPaths.root },
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
        </DetailCard>

        <DetailCard title="Assignment">
          <DetailItem label="Site" value={branchName} />
          <DetailItem label="Job title" value={jobTitleName} />
          <DetailItem label="Departments" value={departmentNames} />
          <DetailItem label="Start date" value={fDate(profile.startDate)} />
          <DetailItem label="PIN" value={profile.pin || '—'} />
          <DetailItem
            label="Hourly rate"
            value={
              profile.hourlyRate != null
                ? fCurrency(profile.hourlyRate, { code: 'en-GB', currency: 'GBP' })
                : '—'
            }
          />
          <DetailItem label="Organization" value={orgName} />
        </DetailCard>

        <DetailCard title="Record">
          <DetailItem label="Created at" value={fDateTime(profile.createdAt)} />
          <DetailItem label="Updated at" value={fDateTime(profile.updatedAt)} />
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
