import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useParams, usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { fDateTime } from 'src/utils/format-time';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';
import { Iconify } from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useGetBillingUsageByOrgQuery } from 'src/store/Reducer/billing-api';

import { DataUsageRecordsTable } from '../data-usage-records-table';
import { formatGb } from '../utils';

// ----------------------------------------------------------------------

export function DataUsageDetailView({ pathsConfig } = {}) {
  const { id, branchId } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { organizationId: currentOrganizationId, isOwner } = useCurrentOrganization();
  const isSiteDetail = Boolean(branchId);

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
      orgDetail: isOwner
        ? paths.owner.dataUsage.detail
        : isAdminDashboard
          ? paths.adminDashboard.dataUsage.detail
          : paths.dashboard.dataUsage.detail,
      site: isOwner
        ? paths.owner.dataUsage.site
        : isAdminDashboard
          ? paths.adminDashboard.dataUsage.site
          : paths.dashboard.dataUsage.site,
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
  const site = isSiteDetail
    ? branches.find((item) => String(item.branchId) === String(branchId)) || null
    : null;

  if (isLoading || (!data && isFetching)) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3 }}>
        <LoadingScreen sx={{ py: 10 }} />
      </Box>
    );
  }

  if (isError || !organization || (isSiteDetail && !site)) {
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
        <EmptyContent filled title="Data usage record not found" sx={{ py: 10 }} />
      </Box>
    );
  }

  const {
    name,
    owner,
    status,
  } = organization;

  const quotaGb = storage.planQuotaGb ?? billing.planLimitGb ?? 0;
  const totalUsedGb = isSiteDetail ? site?.usedGb ?? 0 : storage.totalUsedGb ?? 0;
  const imageUsageGb = isSiteDetail ? site?.images?.gb ?? 0 : storage.images?.gb ?? 0;
  const otherFilesGb = isSiteDetail ? site?.files?.gb ?? 0 : storage.files?.gb ?? 0;
  const imageCount = isSiteDetail ? site?.images?.count ?? 0 : storage.images?.count ?? 0;
  const documentCount = isSiteDetail ? site?.files?.count ?? 0 : storage.files?.count ?? 0;
  const usagePercentage = isSiteDetail
    ? quotaGb > 0
      ? Math.round((Number(totalUsedGb) / Number(quotaGb)) * 100)
      : 0
    : storage.quotaPercent ?? 0;
  const imageRatio = isSiteDetail
    ? totalUsedGb > 0
      ? Math.round((Number(imageUsageGb) / Number(totalUsedGb)) * 100)
      : 0
    : storage.images?.percentOfUsed ?? storage.images?.percentOfTotal ?? 0;
  const otherRatio = isSiteDetail
    ? totalUsedGb > 0
      ? Math.round((Number(otherFilesGb) / Number(totalUsedGb)) * 100)
      : 0
    : storage.files?.percentOfUsed ?? storage.files?.percentOfTotal ?? 0;

  const heading = isSiteDetail ? site?.name || 'Site usage' : name || 'Billing & Usage';

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      {isFetching && !isLoading && <LoadingScreen sx={{ py: 2 }} />}

      <Box sx={{ mb: 2 }}>
        <Button
          color="primary"
          onClick={router.back}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
        >
          Back
        </Button>
      </Box>

      <CustomBreadcrumbs
        heading={heading}
        links={[
          { name: 'Dashboard', href: resolvedPaths.dashboardRoot },
          { name: 'Billing & Usage', href: resolvedPaths.root },
          ...(isSiteDetail
            ? [
                { name: name || 'Organization', href: resolvedPaths.orgDetail(id) },
                { name: site?.name || 'Site' },
              ]
            : [{ name: name || 'Details' }]),
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack spacing={3}>
        {isSiteDetail ? (
          <DetailCard title="Site">
            <DetailItem label="Name" value={site?.name || '—'} />
            <DetailItem label="Organization" value={name || '—'} />
            <DetailItem label="Account owner" value={owner?.name || '—'} />
            <DetailItem label="Owner email" value={owner?.email || '—'} />
          </DetailCard>
        ) : (
          <DetailCard title="Organization">
            <DetailItem label="Name" value={name || '—'} />
            <DetailItem label="Account owner" value={owner?.name || '—'} />
            <DetailItem label="Owner email" value={owner?.email || '—'} />
            <DetailItem label="Status" value={status ? String(status).toUpperCase() : '—'} />
          </DetailCard>
        )}

        <DetailCard title="Storage Usage">
          <DetailItem label="Total data used" value={`${formatGb(totalUsedGb)} GB`} />
          <DetailItem label="Plan quota limit" value={`${formatGb(quotaGb)} GB`} />
          <DetailItem
            label="Quota utilization"
            value={`${usagePercentage}%${storage.statusLabel ? ` · ${storage.statusLabel}` : ''}`}
          />
          <DetailItem
            label="Image storage"
            value={`${formatGb(imageUsageGb)} GB`}
          />
          <DetailItem
            label="Images uploaded"
            value={`${imageCount.toLocaleString()} images`}
          />
          <DetailItem
            label="Other files storage"
            value={`${formatGb(otherFilesGb)} GB`}
          />
          <DetailItem
            label="Other files archived"
            value={`${documentCount.toLocaleString()} files & documents`}
          />
        </DetailCard>

        {!isSiteDetail && categories.length > 0 && (
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

        {!isSiteDetail && branches.length > 0 && (
          <DetailCard title="Sites">
            {branches.map((item) => (
              <DetailItem
                key={item.branchId || item.name}
                label={item.name}
                value={`${formatGb(item.usedGb)} GB (${formatGb(item.images?.gb)} GB images)`}
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

        {!isOwner && !isSiteDetail && id ? (
          <DataUsageRecordsTable
            organizationId={id}
            showOrgFilter={false}
            nameColumnLabel="Site"
            onViewDetail={(row) => {
              if (row?.branchId && resolvedPaths.site) {
                router.push(resolvedPaths.site(id, row.branchId));
              }
            }}
          />
        ) : null}
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
