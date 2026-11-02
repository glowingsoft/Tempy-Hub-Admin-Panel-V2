import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Scrollbar } from 'src/components/scrollbar';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import { CONFIG } from 'src/config-global';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useDebounce } from 'src/hooks/use-debounce';
import { DashboardContent } from 'src/layouts/dashboard';
import { usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { useGetBillingUsageQuery } from 'src/store/Reducer/billing-api';
import { useGetOrganizationsQuery } from 'src/store/Reducer/organizations-api';

import { OrganizationCreateEditModal } from 'src/sections/organization/organization-create-edit-modal';
import { DataUsageSummaryCard } from '../data-usage-summary-card';
import { DataUsageTableRow } from '../data-usage-table-row';
import { DataUsageTableToolbar } from '../data-usage-table-toolbar';
import {
  formatGb,
  getBillingSortParam,
  mapUsageListRow,
  mapUsageSummary,
} from '../utils';

// ----------------------------------------------------------------------

export function DataUsageView({ rootPath = paths.dashboard.root }) {
  const router = useRouter();
  const pathname = usePathname();
  const table = useTable({ defaultOrderBy: 'totalUsedGb', defaultOrder: 'desc' });
  const { organizationId: currentOrganizationId, isOwner } = useCurrentOrganization();

  const isAdminDashboard = pathname.startsWith(paths.adminDashboard.root);

  const currentRoot = isOwner
    ? paths.owner.root
    : isAdminDashboard
      ? paths.adminDashboard.root
      : rootPath;

  const currentDetailPath = useCallback(
    (id) => {
      if (isOwner) {
        return paths.owner.dataUsage.detail(id);
      }
      if (isAdminDashboard) {
        return paths.adminDashboard.dataUsage.detail(id);
      }
      return paths.dashboard.dataUsage.detail(id);
    },
    [isOwner, isAdminDashboard]
  );

  const [selectedOrgId, setSelectedOrgId] = useState('all');
  const [organizationToEdit, setOrganizationToEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filterOrganizationId =
    isOwner ? undefined : selectedOrgId !== 'all' ? selectedOrgId : undefined;

  const { data, isLoading, isFetching, isError, refetch } = useGetBillingUsageQuery(
    {
      page: table.page + 1,
      limit: table.rowsPerPage,
      keyword: debouncedSearch,
      sort: getBillingSortParam(table.orderBy, table.order),
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
  const rows = useMemo(() => {
    const mapped = (data?.data ?? []).map(mapUsageListRow);
    if (!meta.organization?.canEdit) return mapped;
    return mapped.map((row) => ({ ...row, canEdit: true }));
  }, [data, meta.organization?.canEdit]);
  const stats = useMemo(
    () =>
      mapUsageSummary(meta.summary, {
        isFiltered: Boolean(filterOrganizationId) || isOwner,
        organization: meta.organization,
      }),
    [filterOrganizationId, isOwner, meta.organization, meta.summary]
  );

  const organizationOptions = useMemo(() => {
    const fromApi = (organizationsData?.data ?? []).map((org) => ({
      id: org._id || org.organizationId,
      name: org.name,
    }));
    if (fromApi.length) return fromApi;
    return rows
      .filter((row) => row.organizationId)
      .map((row) => ({ id: row.organizationId, name: row.name }));
  }, [organizationsData, rows]);

  const tableHead = useMemo(
    () => [
      {
        id: 'name',
        label: rows.some((row) => row.isSite) ? 'Site' : 'Organization',
        minWidth: 240,
      },
      { id: 'totalUsedGb', label: 'Total Used', minWidth: 140 },
      { id: 'imageUsageGb', label: 'Image Usage', minWidth: 160 },
      { id: 'otherFilesGb', label: 'Other Files', minWidth: 140 },
      { id: 'usagePercentage', label: 'Usage %', minWidth: 180 },
      { id: 'actions', label: 'Actions', width: 80, align: 'right' },
    ],
    [rows]
  );

  const handleOrgChange = useCallback(
    (orgId) => {
      setSelectedOrgId(orgId);
      table.onResetPage();
    },
    [table]
  );

  const handleSearchChange = useCallback(
    (value) => {
      setSearchQuery(value);
      table.onResetPage();
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setSelectedOrgId('all');
    setSearchQuery('');
    table.onResetPage();
  }, [table]);

  const canReset = (!isOwner && selectedOrgId !== 'all') || !!searchQuery;
  const loading = isLoading || isFetching;
  const notFound = !loading && !rows.length;
  const totalRecords = meta.totalRecords ?? rows.length;

  const handleViewDetail = useCallback(
    (id) => {
      if (!id) return;
      router.push(currentDetailPath(id));
    },
    [router, currentDetailPath]
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

      <Card>
        <DataUsageTableToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedOrg={selectedOrgId}
          onOrgChange={handleOrgChange}
          organizations={organizationOptions}
          showOrgFilter={!isOwner}
          onResetFilters={handleResetFilters}
          canReset={canReset}
        />

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={tableHead}
                rowCount={rows.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
              />

              <TableBody>
                {loading ? (
                  <TableBodySkeleton
                    rowCount={table.rowsPerPage}
                    cellCount={tableHead.length}
                    dense={table.dense}
                  />
                ) : (
                  <>
                    {rows.map((row) => (
                      <DataUsageTableRow
                        key={row.id}
                        row={row}
                        onViewDetail={handleViewDetail}
                        onEdit={handleEditOrganization}
                      />
                    ))}

                    <TableNoData
                      notFound={notFound}
                      title={isError ? 'Unable to load usage' : 'No Organizations Found'}
                      subTitle={
                        isError
                          ? 'Billing & usage could not be loaded. Try again shortly.'
                          : debouncedSearch
                            ? `No records match the search term "${debouncedSearch}".`
                            : 'No data usage records currently available.'
                      }
                    />
                  </>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          count={totalRecords}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>

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
