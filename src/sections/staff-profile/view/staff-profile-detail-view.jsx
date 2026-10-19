import { useMemo } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
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
import { Label } from 'src/components/label';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';
import { useGetOrganizationByIdQuery } from 'src/store/Reducer/organizations-api';
import { useGetStaffProfileQuery } from 'src/store/Reducer/staff-profiles-api';
import { getMockStaffProfileById } from '../mocks/data';
import { StaffProfileDetailSkeleton } from '../staff-profile-detail-skeleton';

// ----------------------------------------------------------------------

const STATUS_COLOR = {
  active: 'success',
  inactive: 'error',
  suspended: 'warning',
};

function displayValue(value) {
  if (value == null) return '';
  const text = String(value).trim();
  if (!text || text === '—') return '';
  return text;
}

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

  if (isLoading || isFetching || isOrgLoading || isLookupsLoading) {
    return <StaffProfileDetailSkeleton />;
  }

  if (!profile) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          color="primary"
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

  const branchName =
    profile.branch?.name ||
    (typeof profile.branchId === 'object' && profile.branchId?.name) ||
    profile.branchName ||
    (typeof profile.branch === 'string' && branchesMap[profile.branch]?.name) ||
    (typeof profile.branchId === 'string' && branchesMap[profile.branchId]?.name) ||
    '';

  const jobTitleName =
    profile.jobTitle?.name ||
    (typeof profile.jobTitleId === 'object' && profile.jobTitleId?.name) ||
    profile.jobTitleName ||
    (typeof profile.jobTitle === 'string' && jobTitlesMap[profile.jobTitle]?.name) ||
    (typeof profile.jobTitleId === 'string' && jobTitlesMap[profile.jobTitleId]?.name) ||
    '';

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
          return departmentsMap[id]?.name || '';
        })
        .filter(Boolean);
      if (names.length > 0) return names;
    }
    if (profile.department?.name) {
      return [profile.department.name];
    }
    return [];
  })();

  const staffName =
    profile.userId?.name || profile.user?.name || profile.userName || profile.name || 'Staff profile';

  const staffEmail =
    profile.userId?.email || profile.user?.email || profile.userEmail || profile.email || '';

  const reportsTo = displayValue(
    typeof profile.reportsToStaffId === 'object'
      ? profile.reportsToStaffId?.employeeCode ||
        profile.reportsToStaffId?.userId?.name ||
        profile.reportsToStaffId?.user?.name
      : ''
  );

  const orgName =
    profile.organization?.name ||
    (typeof profile.organizationId === 'object' && profile.organizationId?.name) ||
    organization?.name ||
    profile.organizationName ||
    resolvedOrgName ||
    '';

  const statusValue = profile.status || '';
  const statusColor = STATUS_COLOR[statusValue] || 'default';
  const avatarSrc = profile.photoUrl || profile.user?.profileIcon || '';
  const initials = staffName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const orgValue =
    !isOwner && orgIdForLookups && orgName ? (
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
    );

  const detailRows = [
    { label: 'Phone', value: displayValue(profile.phone) },
    { label: 'Organization', value: orgValue },
    { label: 'Ward', value: displayValue(profile.ward) },
    { label: 'Location', value: displayValue(profile.locationLabel) },
    { label: 'Reports to', value: reportsTo },
    { label: 'PIN', value: displayValue(profile.pin) },
    {
      label: 'Hourly rate',
      value:
        profile.hourlyRate != null
          ? fCurrency(profile.hourlyRate, { code: 'en-GB', currency: 'GBP' })
          : '',
    },
  ].filter((row) => row.value);

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={staffName}
        links={[
          { name: 'Dashboard', href: resolvedPaths.dashboardRoot },
          ...(isOwner
            ? [{ name: 'Staff Profiles', href: resolvedPaths.root }]
            : [
                { name: 'Organizations', href: paths.dashboard.organizations.root },
                ...(orgIdForLookups && orgName
                  ? [
                      {
                        name: orgName,
                        href: `${paths.dashboard.organizations.detail(orgIdForLookups)}?tab=staff-profiles`,
                      },
                    ]
                  : []),
                { name: 'Staff Profiles', href: resolvedPaths.root },
              ]),
          { name: staffName },
        ]}
        action={
          <Button
            component={RouterLink}
            href={resolvedPaths.edit(profile._id || id)}
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="solar:pen-bold" />}
          >
            Edit
          </Button>
        }
        sx={{ mb: 3 }}
      />

      <Card sx={{ p: { xs: 2.5, md: 3 }, mb: 2.5 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2.5}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
        >
          <Avatar
            src={avatarSrc}
            alt={staffName}
            sx={{ width: 72, height: 72, typography: 'h4', bgcolor: 'primary.main', color: 'white' }}
          >
            {initials}
          </Avatar>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h5" sx={{ textTransform: 'capitalize' }}>
              {staffName}
            </Typography>

            {staffEmail && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                {String(staffEmail).toLowerCase()}
              </Typography>
            )}

            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mt: 1.25 }}>
              {statusValue && (
                <Label variant="soft" color={statusColor} sx={{ textTransform: 'capitalize' }}>
                  {statusValue}
                </Label>
              )}
              {profile.employeeCode && (
                <Label variant="soft" color="info">
                  {profile.employeeCode}
                </Label>
              )}
              {jobTitleName && (
                <Label variant="soft" color="default" sx={{ textTransform: 'capitalize' }}>
                  {jobTitleName}
                </Label>
              )}
            </Stack>
          </Box>
        </Stack>
      </Card>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          mb: 2.5,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        }}
      >
        <SummaryTile
          icon="solar:home-2-bold"
          label="Site"
          value={branchName || '—'}
        />
        <SummaryTile
          icon="solar:calendar-date-bold"
          label="Start date"
          value={profile.startDate ? fDate(profile.startDate) : '—'}
        />
        <SummaryTile
          icon="solar:clock-circle-bold"
          label="Weekly hours"
          value={
            profile.contractedWeeklyHours != null ? `${profile.contractedWeeklyHours} hrs` : '—'
          }
        />
      </Box>

      <Card sx={{ p: { xs: 2.5, md: 3 } }}>
        <Typography variant="h6">Assignment</Typography>
        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
            Departments
          </Typography>
          {departmentNames.length ? (
            <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75}>
              {departmentNames.map((name) => (
                <Chip
                  key={name}
                  size="small"
                  variant="soft"
                  color="primary"
                  label={name}
                  sx={{ textTransform: 'capitalize' }}
                />
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              —
            </Typography>
          )}
        </Box>

        {detailRows.length > 0 && (
          <Box
            sx={{
              display: 'grid',
              rowGap: 2,
              columnGap: 3,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
            }}
          >
            {detailRows.map((row) => (
              <DetailItem key={row.label} label={row.label} value={row.value} />
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2.5 }} />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 1, sm: 4 }}
          sx={{ color: 'text.secondary' }}
        >
          <Typography variant="caption">
            Created {profile.createdAt ? fDateTime(profile.createdAt) : '—'}
          </Typography>
          <Typography variant="caption">
            Updated {profile.updatedAt ? fDateTime(profile.updatedAt) : '—'}
          </Typography>
        </Stack>
      </Card>
    </Box>
  );
}

// ----------------------------------------------------------------------

function SummaryTile({ icon, label, value }) {
  return (
    <Card sx={{ p: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'primary.lighter',
            color: 'primary.dark',
          }}
        >
          <Iconify icon={icon} width={22} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {label}
          </Typography>
          <Typography
            variant="subtitle2"
            noWrap
            sx={{ textTransform: 'capitalize' }}
          >
            {value}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}

function DetailItem({ label, value }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        component="div"
        sx={{ fontWeight: 600, textTransform: label === 'Employee code' ? 'none' : 'capitalize' }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
