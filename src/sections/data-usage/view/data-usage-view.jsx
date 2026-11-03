import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CONFIG } from 'src/config-global';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useGetBillingUsageQuery } from 'src/store/Reducer/billing-api';
import { useGetOrganizationsQuery } from 'src/store/Reducer/organizations-api';

import { OrganizationCreateEditModal } from 'src/sections/organization/organization-create-edit-modal';
import { DataUsageRecordsTable } from '../data-usage-records-table';
import { DataUsageSummaryCard } from '../data-usage-summary-card';
import { formatGb, mapUsageSummary } from '../utils';

// ----------------------------------------------------------------------

export function DataUsageView({ rootPath = paths.dashboard.root }) {
  const router = useRouter();
  const pathname = usePathname();
  const { organizationId: currentOrganizationId, isOwner } = useCurrentOrganization();

  const isAdminDashboard = pathname.startsWith(paths.adminDashboard.root);

  const currentRoot = isOwner
    ? paths.owner.root
    : isAdminDashboard
      ? paths.adminDashboard.root
      : rootPath;

  const usagePaths = isOwner
    ? paths.owner.dataUsage
    : isAdminDashboard
      ? paths.adminDashboard.dataUsage
      : paths.dashboard.dataUsage;

  const [selectedOrgId, setSelectedOrgId] = useState('all');
  const [organizationToEdit, setOrganizationToEdit] = useState(null);

  const filterOrganizationId =
    isOwner ? undefined : selectedOrgId !== 'all' ? selectedOrgId : undefined;

  const { data, refetch } = useGetBillingUsageQuery(
    {
      page: 1,
      limit: 10,
      organizationId: filterOrganizationId,
      headerOrganizationId: isOwner ? currentOrganizationId : undefined,
    },
    { skip: isOwner && !currentOrganizationId }
  );

  const { data: organizationsData } = useGetOrganizationsQuery(
    { page: 1, limit: 100 },
    { skip: isOwner }
  );

  const meta = data?.meta ?? {};
  const stats = useMemo(
    () =>
      mapUsageSummary(meta.summary, {
        isFiltered: Boolean(filterOrganizationId) || isOwner,
        organization: meta.organization,
      }),
    [filterOrganizationId, isOwner, meta.organization, meta.summary]
  );

  const organizationOptions = useMemo(
    () =>
      (organizationsData?.data ?? []).map((org) => ({
        id: org._id || org.organizationId,
        name: org.name,
      })),
    [organizationsData]
  );

  const handleViewDetail = useCallback(
    (row) => {
      const organizationId = row?.organizationId || currentOrganizationId;
      if (row?.branchId && organizationId && usagePaths.site) {
        router.push(usagePaths.site(organizationId, row.branchId));
        return;
      }
      if (organizationId) {
        router.push(usagePaths.detail(organizationId));
      }
    },
    [router, usagePaths, currentOrganizationId]
  );

  const handleEditOrganization = useCallback(
    (row) => {
      const organization = meta.organization;
      const organizationId = row.organizationId || organization?.organizationId;
      if (!organizationId) return;

      setOrganizationToEdit({
        _id: organizationId,
        name: organization?.name || row.name,
        owner: organization?.owner || {
          name: row.ownerName,
          email: row.ownerEmail,
        },
        settings: {
          emergencyNotifyOffsite:
            organization?.emergencyNotifyOffsite ?? row.emergencyNotifyOffsite ?? false,
        },
      });
    },
    [meta.organization]
  );

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Billing & Usage"
        links={[
          { name: 'Dashboard', href: currentRoot },
          { name: 'Billing & Usage' },
        ]}
        sx={{ mb: { xs: 3, md: 4 } }}
      />

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          mb: { xs: 3, md: 4 },
        }}
      >
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
          <DataUsageSummaryCard
            title="Total Data Used"
            total={`${formatGb(stats.totalUsedGb)} GB`}
            color="primary"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-folder.svg`}
            subtitle={
              stats.isFiltered
                ? `Limit: ${formatGb(stats.quotaGb)} GB plan`
                : `${stats.organizationsCount} active organizations`
            }
            badge={{
              text: `${stats.usagePercentage}% Plan Quota`,
              color:
                stats.usagePercentage >= 85
                  ? 'error'
                  : stats.usagePercentage >= 60
                    ? 'warning'
                    : 'primary',
            }}
          />
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
          <DataUsageSummaryCard
            title="Image Usage"
            total={`${formatGb(stats.imageUsageGb)} GB`}
            color="info"
            icon="solar:gallery-wide-bold-duotone"
            subtitle={`${(stats.imageCount || 0).toLocaleString()} images uploaded`}
            badge={{
              text: `${Math.round(stats.imagePercentOfTotal || 0)}% of total`,
              color: 'info',
            }}
          />
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
          <DataUsageSummaryCard
            title="Other Files"
            total={`${formatGb(stats.otherFilesGb)} GB`}
            color="secondary"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-document.svg`}
            subtitle={`${(stats.documentCount || 0).toLocaleString()} files archived`}
            badge={{
              text: `${Math.round(stats.filesPercentOfTotal || 0)}% of total`,
              color: 'secondary',
            }}
          />
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
          <DataUsageSummaryCard
            title="Billing Readiness"
            total={stats.billingStatus}
            color="warning"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-banking.svg`}
            subtitle={`Base Tier: £${stats.tierMonthlyCost}/mo`}
            badge={{
              text: `£${stats.overageGbpPerGb}/GB overage tier`,
              color: 'warning',
            }}
          />
        </Box>
      </Box>

      <DataUsageRecordsTable
        organizationId={filterOrganizationId}
        headerOrganizationId={isOwner ? currentOrganizationId : undefined}
        showOrgFilter={!isOwner}
        organizations={organizationOptions}
        selectedOrg={selectedOrgId}
        onOrgChange={setSelectedOrgId}
        onViewDetail={handleViewDetail}
        onEdit={handleEditOrganization}
      />

      <OrganizationCreateEditModal
        open={!!organizationToEdit}
        onClose={() => setOrganizationToEdit(null)}
        currentOrganization={organizationToEdit}
        onSuccess={() => {
          setOrganizationToEdit(null);
          refetch();
        }}
      />
    </DashboardContent>
  );
}
