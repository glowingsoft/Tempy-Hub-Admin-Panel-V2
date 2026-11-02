import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useParams, useRouter, usePathname } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { fDateTime } from 'src/utils/format-time';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useGetBillingUsageByOrgQuery } from 'src/store/Reducer/billing-api';

import { formatGb } from '../utils';

// ----------------------------------------------------------------------

export function DataUsageDetailView({ pathsConfig } = {}) {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { organizationId: currentOrganizationId, isOwner } = useCurrentOrganization();

  const isAdminDashboard = pathname.startsWith(paths.adminDashboard.root);

  const resolvedPaths = useMemo(
    () => ({
      dashboardRoot: isOwner
        ? paths.owner.root
        : isAdminDashboard
          ? paths.adminDashboard.root
          : paths.dashboard.root,
      root: isOwner
        ? paths.owner.dataUsage.root
        : isAdminDashboard
          ? paths.adminDashboard.dataUsage.root
          : paths.dashboard.dataUsage.root,
      ...pathsConfig,
    }),
    [isOwner, isAdminDashboard, pathsConfig]
  );

  const { data, isLoading, isFetching, isError } = useGetBillingUsageByOrgQuery(
    {
      organizationId: id,
      headerOrganizationId: isOwner ? currentOrganizationId || id : undefined,
    },
    { skip: !id }
  );

  const organization = data?.organization;
  const storage = data?.storage || {};
  const categories = data?.categories || [];
  const branches = data?.branches || [];
  const billing = data?.billing || {};
  const record = data?.record || {};

  if (isLoading || isFetching) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <EmptyContent title="Loading usage details..." sx={{ py: 10 }} />
      </Box>
    );
  }

  if (isError || !organization) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <Button
          onClick={() => router.push(resolvedPaths.root)}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <EmptyContent filled title="Data usage record not found" sx={{ py: 10 }} />
      </Box>
    );
  }

  const {
    name,
    owner,
    status,
  } = organization;

  const totalUsedGb = storage.totalUsedGb ?? 0;
  const quotaGb = storage.planQuotaGb ?? billing.planLimitGb ?? 0;
  const usagePercentage = storage.quotaPercent ?? 0;
  const imageUsageGb = storage.images?.gb ?? 0;
  const otherFilesGb = storage.files?.gb ?? 0;
  const imageCount = storage.images?.count ?? 0;
  const documentCount = storage.files?.count ?? 0;
  const imageRatio = storage.images?.percentOfUsed ?? storage.images?.percentOfTotal ?? 0;
  const otherRatio = storage.files?.percentOfUsed ?? storage.files?.percentOfTotal ?? 0;

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2 }}>
        <Button onClick={router.back} startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}>
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading={name || 'Billing & Usage'}
        links={[
          { name: 'Dashboard', href: resolvedPaths.dashboardRoot },
          { name: 'Billing & Usage', href: resolvedPaths.root },
          { name: name || 'Details' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        <DetailCard title="Organization">
          <DetailItem label="Name" value={name || '—'} />
          <DetailItem label="Account owner" value={owner?.name || '—'} />
          <DetailItem label="Owner email" value={owner?.email || '—'} />
          <DetailItem label="Status" value={status ? String(status).toUpperCase() : '—'} />
        </DetailCard>

        <DetailCard title="Storage Usage">
          <DetailItem label="Total data used" value={`${formatGb(totalUsedGb)} GB`} />
          <DetailItem label="Plan quota limit" value={`${formatGb(quotaGb)} GB`} />
          <DetailItem
            label="Quota utilization"
            value={`${usagePercentage}%${storage.statusLabel ? ` · ${storage.statusLabel}` : ''}`}
          />
          <DetailItem
            label="Image storage"
            value={`${formatGb(imageUsageGb)} GB (${Math.round(imageRatio)}% of total)`}
          />
          <DetailItem
            label="Images uploaded"
            value={`${imageCount.toLocaleString()} images`}
          />
          <DetailItem
            label="Other files storage"
            value={`${formatGb(otherFilesGb)} GB (${Math.round(otherRatio)}% of total)`}
          />
          <DetailItem
            label="Other files archived"
            value={`${documentCount.toLocaleString()} files & documents`}
          />
        </DetailCard>

        {categories.length > 0 && (
          <DetailCard title="Category Breakdown">
            {categories.map((cat) => (
              <DetailItem
                key={cat.key || cat.label}
                label={cat.label}
                value={`${formatGb(cat.gb)} GB (${(
                  (cat.images?.count || 0) + (cat.files?.count || 0)
                ).toLocaleString()} items)`}
              />
            ))}
          </DetailCard>
        )}

        {branches.length > 0 && (
          <DetailCard title="Sites">
            {branches.map((site) => (
              <DetailItem
                key={site.branchId || site.name}
                label={site.name}
                value={`${formatGb(site.usedGb)} GB (${formatGb(site.images?.gb)} GB images)`}
              />
            ))}
          </DetailCard>
        )}

        <DetailCard title="Billing & Pricing">
          <DetailItem label="Active plan tier" value={`${formatGb(billing.planLimitGb ?? quotaGb)} GB`} />
          <DetailItem
            label="Monthly base rate"
            value={billing.monthlyBaseGbp != null ? `£${billing.monthlyBaseGbp}/month` : '—'}
          />
          <DetailItem
            label="Overage pricing rate"
            value={`£${billing.overageGbpPerGb ?? 0.15} per additional GB above ${formatGb(billing.planLimitGb ?? quotaGb)} GB`}
          />
          <DetailItem label="Billing health" value={billing.label || 'Within Plan'} />
          <DetailItem
            label="Projected monthly overage"
            value={`£${Number(billing.projectedOverageGbp ?? 0).toFixed(2)}`}
          />
        </DetailCard>

        <DetailCard title="Record">
          <DetailItem label="Created at" value={fDateTime(record.createdAt)} />
          <DetailItem label="Updated at" value={fDateTime(record.updatedAt)} />
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
