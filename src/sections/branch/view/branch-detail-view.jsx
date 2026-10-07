import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useParams, useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';
import { useSelector } from 'react-redux';

import { fDateTime } from 'src/utils/format-time';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { LoadingScreen } from 'src/components/loading-screen';

import { useGetBranchQuery } from 'src/store/Reducer/branches-api';
import { getBranchStatusMeta } from '../mocks/data';
import { getOwnerOrganizationId } from '../utils';

// ----------------------------------------------------------------------

const yesNo = (value) => (value ? 'Yes' : 'No');

export function BranchDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useSelector((state) => state.user);
  const organizationId = getOwnerOrganizationId(user);
  const { data: response, isLoading, isError, error } = useGetBranchQuery(
    { branchId: id, organizationId },
    { skip: !id || !organizationId }
  );
  const branch = response
    ? {
        ...response,
        organization:
          response.organization ??
          user?.access?.organizations?.find((organization) => organization._id === organizationId),
        settings: {
          ...response.settings,
          breaksPaid: response.settings?.breaksPaid ?? response.settings?.paidBreaks,
        },
        activation:
          response.activation ??
          (response.activatedAt
            ? { activatedAt: response.activatedAt, activatedBy: response.activatedBy }
            : null),
        manager: response.manager ?? response.managerInvitation ?? null,
      }
    : null;

  if (isLoading) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <LoadingScreen sx={{ py: 10 }} />
      </Box>
    );
  }

  if (isError) {
    const errorMessage =
      error?.data?.message || error?.data?.error || error?.error || 'Unable to load site details.';

    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          onClick={() => router.push(paths.owner.sites.root)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title={errorMessage} sx={{ py: 10 }} />
      </Box>
    );
  }

  if (!branch) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          onClick={() => router.push(paths.owner.sites.root)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title="Site not found" sx={{ py: 10 }} />
      </Box>
    );
  }

  const status = getBranchStatusMeta(branch.status);
  const { settings = {}, activation, manager } = branch;

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading={branch.name}
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Sites', href: paths.owner.sites.root },
          { name: branch.name },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.owner.sites.edit(branch._id)}
            variant="contained"
            startIcon={<Iconify icon="solar:pen-bold" />}
          >
            Edit Site
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        <DetailCard title="Site details">
          <DetailItem label="Name" value={branch.name} />
          <DetailItem label="Code" value={branch.code || '—'} />
          <DetailItem
            label="Status"
            value={
              <Label variant="soft" color={status.color}>
                {status.label}
              </Label>
            }
          />
          <DetailItem label="Assembly point" value={branch.assemblyPoint || '—'} />
          <DetailItem label="Address" value={branch.address || '—'} />
          <DetailItem label="Organization" value={branch.organization?.name || '—'} />
          <DetailItem label="Created At" value={fDateTime(branch.createdAt)} />
          <DetailItem label="Updated At" value={fDateTime(branch.updatedAt)} />
        </DetailCard>

        <DetailCard title="Attendance settings">
          <DetailItem label="Enable breaks" value={yesNo(settings.enableBreaks)} />
          {settings.enableBreaks && (
            <>
              <DetailItem label="Paid breaks" value={yesNo(settings.breaksPaid)} />
              {!settings.breaksPaid && (
                <DetailItem
                  label="Unpaid break rules"
                  value={
                    settings.breakRules?.length
                      ? settings.breakRules
                          .map((rule) => `${rule.minHours}h+ shift → ${rule.unpaidMinutes} min`)
                          .join(', ')
                      : '—'
                  }
                />
              )}
            </>
          )}
          <DetailItem label="Late grace minutes" value={settings.lateGraceMinutes ?? '—'} />
          <DetailItem label="Allow phone check-in" value={yesNo(settings.allowPhoneCheckIn)} />
        </DetailCard>

        <DetailCard title="Activation">
          {activation ? (
            <>
              <DetailItem label="Activated at" value={fDateTime(activation.activatedAt)} />
              <DetailItem label="Activated by" value={activation.activatedBy || '—'} />
            </>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              This site has not been activated yet.
            </Typography>
          )}
        </DetailCard>

        <DetailCard title="Site manager">
          {manager ? (
            <>
              <DetailItem label="Name" value={manager.name || '—'} />
              <DetailItem label="Email" value={manager.email || '—'} />
              <DetailItem label="Job title" value={manager.jobTitle?.name || '—'} />
              <DetailItem label="Department" value={manager.department?.name || '—'} />
              <DetailItem label="Start date" value={fDateTime(manager.startDate)} />
            </>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No manager assigned.
            </Typography>
          )}
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
