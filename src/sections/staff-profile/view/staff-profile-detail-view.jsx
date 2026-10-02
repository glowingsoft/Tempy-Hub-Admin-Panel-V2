import { useMemo } from 'react';
import { useSelector } from 'react-redux';

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

// import { useGetStaffProfileQuery } from 'src/store/Reducer/staff-profiles-api';
import { getMockStaffProfileById } from '../mocks/data';

// ----------------------------------------------------------------------

export function StaffProfileDetailView({ pathsConfig } = {}) {
  const { id } = useParams();
  const router = useRouter();

  const { user } = useSelector((state) => state.user);
  const isOwner = user?.permission === 4;

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

  // TODO: swap for the real query once the endpoint is wired up:
  // const { data: profile, isLoading } = useGetStaffProfileQuery(id);
  const profile = useMemo(() => getMockStaffProfileById(id), [id]);

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

  const departmentNames = (profile.departments || []).map((dep) => dep.name).join(', ');

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading={profile.user?.name || 'Staff profile'}
        links={[
          { name: 'Dashboard', href: resolvedPaths.dashboardRoot },
          { name: 'Staff Profiles', href: resolvedPaths.root },
          { name: profile.user?.name || 'Staff profile' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={resolvedPaths.edit(profile._id)}
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
          <DetailItem label="Name" value={profile.user?.name || '—'} />
          <DetailItem label="Email" value={profile.user?.email || '—'} />
        </DetailCard>

        <DetailCard title="Assignment">
          <DetailItem label="Site" value={profile.branch?.name || '—'} />
          <DetailItem label="Job title" value={profile.jobTitle?.name || '—'} />
          <DetailItem label="Departments" value={departmentNames || '—'} />
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
          <DetailItem label="Organization" value={profile.organization?.name || '—'} />
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
