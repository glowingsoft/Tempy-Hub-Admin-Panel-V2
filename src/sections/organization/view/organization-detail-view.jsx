import { useMemo, useEffect } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { useParams, useRouter, useSearchParams } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';
import { useTabs } from 'src/hooks/use-tabs';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';

import { fDateTime } from 'src/utils/format-time';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

import { LoadingScreen } from 'src/components/loading-screen';
import { StaffProfileListView } from 'src/sections/staff-profile/view';

import { useGetOrganizationByIdQuery } from 'src/store/Reducer/organizations-api';
import { mockOrganizations, ORGANIZATION_STATUS_OPTIONS } from '../mocks/data';
import { canEditOrganization } from '../utils';
import { OrganizationCreateEditModal } from '../organization-create-edit-modal';
import { OrganizationModuleAccess } from '../organization-module-access';

// ----------------------------------------------------------------------

const STATUS_COLOR = ORGANIZATION_STATUS_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.color;
  return acc;
}, {});

// `value` also doubles as the `?tab=` query param used to deep-link a tab.
const TABS = [
  { value: 'details', label: 'Details', icon: 'solar:buildings-3-bold' },
  { value: 'module-access', label: 'Module Access', icon: 'solar:widget-5-bold' },
  { value: 'staff-profiles', label: 'Staff Profiles', icon: 'solar:user-id-bold' },
];

// ----------------------------------------------------------------------

export function OrganizationDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = TABS.some((tab) => tab.value === searchParams.get('tab'))
    ? searchParams.get('tab')
    : 'details';

  const tabs = useTabs(initialTab);
  const editModal = useBoolean();

  const { user } = useCurrentOrganization();
  const canEdit = canEditOrganization(user);

  const { data, isLoading } = useGetOrganizationByIdQuery(id, { skip: !id });
  const organization = useMemo(
    () => (data ? (data?.data ?? data) : (mockOrganizations.find((org) => org._id === id) ?? null)),
    [data, id]
  );

  useEffect(() => {
    if (organization?._id) {
      try {
        localStorage.setItem('activeOrganizationId', organization._id);
        if (organization.name) {
          localStorage.setItem('activeOrganizationName', organization.name);
        }
      } catch (_) {}
    }
  }, [organization]);

  if (isLoading) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <LoadingScreen sx={{ py: 10 }} />
      </Box>
    );
  }

  if (!organization) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          onClick={() => router.push(paths.dashboard.organizations.root)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title="Organization not found" sx={{ py: 10 }} />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading={organization.name}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Organizations', href: paths.dashboard.organizations.root },
          { name: organization.name },
        ]}
        action={
          canEdit && (
            <Button
              variant="contained"
              onClick={editModal.onTrue}
              startIcon={<Iconify icon="solar:pen-bold" />}
            >
              Edit
            </Button>
          )
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ mb: 3 }}>
        <Tabs value={tabs.value} onChange={tabs.onChange} sx={{ px: 3, pt: 1 }}>
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              icon={<Iconify icon={tab.icon} />}
            />
          ))}
        </Tabs>
      </Card>

      {tabs.value === 'details' && <OrganizationDetails organization={organization} />}

      {tabs.value === 'module-access' && (
        <OrganizationModuleAccess organizationId={organization._id} />
      )}

      {tabs.value === 'staff-profiles' && (
        <StaffProfileListView
          organizationId={organization._id}
          organizationName={organization.name}
          embedded
          pathsConfig={{
            dashboardRoot: paths.dashboard.root,
            root: `${paths.dashboard.organizations.detail(organization._id)}?tab=staff-profiles`,
            new: `${paths.dashboard.staffProfiles.new}?orgId=${organization._id}`,
            detail: (staffId) => `${paths.dashboard.staffProfiles.detail(staffId)}?orgId=${organization._id}`,
            edit: (staffId) => `${paths.dashboard.staffProfiles.edit(staffId)}?orgId=${organization._id}`,
          }}
        />
      )}

      <OrganizationCreateEditModal
        open={editModal.value}
        onClose={editModal.onFalse}
        currentOrganization={organization}
      />
    </Box>
  );
}

// ----------------------------------------------------------------------

function OrganizationDetails({ organization }) {
  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6">Organization details</Typography>
      <Divider sx={{ my: 2 }} />

      <Box
        sx={{
          display: 'grid',
          rowGap: 2.5,
          columnGap: 3,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
        }}
      >
        <DetailItem label="Organization Name" value={organization.name} />
        <DetailItem
          label="Status"
          value={
            <Label variant="soft" color={STATUS_COLOR[organization.status] || 'default'}>
              {organization.status}
            </Label>
          }
        />
        <DetailItem label="Owner Name" value={organization.owner?.name || '—'} />
        <DetailItem label="Owner Email" value={organization.owner?.email || '—'} />
        <DetailItem label="Created At" value={fDateTime(organization.createdAt)} />
        <DetailItem label="Last Updated" value={fDateTime(organization.updatedAt)} />
      </Box>
    </Card>
  );
}

// ----------------------------------------------------------------------

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
