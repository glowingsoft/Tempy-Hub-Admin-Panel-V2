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

import { getAllDataUsageRows } from '../mocks/data-usage';

// ----------------------------------------------------------------------

export function DataUsageDetailView({ pathsConfig } = {}) {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const isOwner = pathname.startsWith(paths.owner.root);
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

  const allRows = useMemo(() => getAllDataUsageRows(), []);

  const organization = useMemo(
    () => allRows.find((item) => item.id === id) || allRows[0],
    [allRows, id]
  );

  if (!organization) {
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
    ownerName,
    ownerEmail,
    status,
    createdAt,
    totalUsedGb,
    imageUsageGb,
    otherFilesGb,
    quotaGb,
    usagePercentage,
    imageCount,
    documentCount,
    billingTier,
    billingStatus,
    tierMonthlyCost,
    sites = [],
    categories = [],
  } = organization;

  const imageRatio = totalUsedGb > 0 ? Math.round((imageUsageGb / totalUsedGb) * 100) : 0;
  const otherRatio = totalUsedGb > 0 ? Math.round((otherFilesGb / totalUsedGb) * 100) : 0;

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
        {/* Organization Card */}
        <DetailCard title="Organization">
          <DetailItem label="Name" value={name || '—'} />
          <DetailItem label="Account owner" value={ownerName || '—'} />
          <DetailItem label="Owner email" value={ownerEmail || '—'} />
          <DetailItem label="Status" value={status ? status.toUpperCase() : '—'} />
        </DetailCard>

        {/* Storage Usage Card */}
        <DetailCard title="Storage Usage">
          <DetailItem label="Total data used" value={`${totalUsedGb} GB`} />
          <DetailItem label="Plan quota limit" value={`${quotaGb} GB`} />
          <DetailItem label="Quota utilization" value={`${usagePercentage}%`} />
          <DetailItem
            label="Image storage"
            value={`${imageUsageGb} GB (${imageRatio}% of total)`}
          />
          <DetailItem
            label="Images uploaded"
            value={`${imageCount?.toLocaleString() || 0} images`}
          />
          <DetailItem
            label="Other files storage"
            value={`${otherFilesGb} GB (${otherRatio}% of total)`}
          />
          <DetailItem
            label="Other files archived"
            value={`${documentCount?.toLocaleString() || 0} files & documents`}
          />
        </DetailCard>

        {/* Category Breakdown Card */}
        {categories.length > 0 && (
          <DetailCard title="Category Breakdown">
            {categories.map((cat, index) => (
              <DetailItem
                key={index}
                label={cat.name}
                value={`${cat.sizeGb} GB (${cat.count?.toLocaleString() || 0} ${cat.type === 'image' ? 'images' : 'files'})`}
              />
            ))}
          </DetailCard>
        )}

        {/* Sites & Operating Branches Card */}
        {sites.length > 0 && (
          <DetailCard title="Sites & Operating Branches">
            {sites.map((site, index) => (
              <DetailItem
                key={index}
                label={site.name}
                value={`${site.totalGb} GB (${site.imageGb} GB images)`}
              />
            ))}
          </DetailCard>
        )}

        {/* Billing Card */}
        <DetailCard title="Billing & Pricing">
          <DetailItem label="Active plan tier" value={billingTier || '—'} />
          <DetailItem
            label="Monthly base rate"
            value={tierMonthlyCost != null ? `£${tierMonthlyCost}/month` : '—'}
          />
          <DetailItem label="Overage pricing rate" value={`£0.15 per additional GB above ${quotaGb} GB`} />
          <DetailItem label="Billing health" value={billingStatus || 'Within Plan'} />
          <DetailItem label="Projected monthly overage" value="£0.00 (within plan)" />
        </DetailCard>

        {/* Record Card */}
        <DetailCard title="Record">
          <DetailItem label="Created at" value={fDateTime(createdAt)} />
          <DetailItem label="Updated at" value={fDateTime(createdAt)} />
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
