import { useState, useMemo, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';
import { CONFIG } from 'src/config-global';
import { useDebounce } from 'src/hooks/use-debounce';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Scrollbar } from 'src/components/scrollbar';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';

import {
  getAllDataUsageRows,
  getDataUsageStats,
} from '../mocks/data-usage';
import { DataUsageSummaryCard } from '../data-usage-summary-card';
import { DataUsageTableRow } from '../data-usage-table-row';
import { DataUsageTableToolbar } from '../data-usage-table-toolbar';
import { OrganizationCreateEditModal } from 'src/sections/organization/organization-create-edit-modal';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Organization', minWidth: 240 },
  { id: 'totalUsedGb', label: 'Total Used', minWidth: 140 },
  { id: 'imageUsageGb', label: 'Image Usage', minWidth: 160 },
  { id: 'otherFilesGb', label: 'Other Files', minWidth: 140 },
  { id: 'usagePercentage', label: 'Usage %', minWidth: 180 },
  { id: 'actions', label: 'Actions', width: 80, align: 'right' },
];

// ----------------------------------------------------------------------

export function DataUsageView({ rootPath = paths.dashboard.root }) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const table = useTable({ defaultOrderBy: 'totalUsedGb', defaultOrder: 'desc' });

  const isOwner = pathname.startsWith(paths.owner.root);
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

  // Filter and search states
  const [selectedOrgId, setSelectedOrgId] = useState('all');
  const [organizationToEdit, setOrganizationToEdit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  // All raw data rows bound to current organizations
  const allRows = useMemo(() => getAllDataUsageRows(), []);

  // Summary statistics calculated dynamically based on selected organization
  const stats = useMemo(() => getDataUsageStats(selectedOrgId), [selectedOrgId]);

  // Handle organization filter change from dropdown
  const handleOrgChange = useCallback(
    (orgId) => {
      setSelectedOrgId(orgId);
      table.onResetPage();
    },
    [table]
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    (value) => {
      setSearchQuery(value);
      table.onResetPage();
    },
    [table]
  );

  // Reset all filters
  const handleResetFilters = useCallback(() => {
    setSelectedOrgId('all');
    setSearchQuery('');
    table.onResetPage();
  }, [table]);

  const canReset = selectedOrgId !== 'all' || !!searchQuery;

  // Navigate to organization detail page
  const handleViewDetail = useCallback(
    (id) => {
      router.push(currentDetailPath(id));
    },
    [router, currentDetailPath]
  );

  const handleEditOrganization = useCallback((row) => {
    setOrganizationToEdit({
      _id: row.id,
      name: row.name,
      owner: {
        name: row.ownerName,
        email: row.ownerEmail,
      },
    });
  }, []);

  // Filter and sort table data
  const filteredData = useMemo(() => {
    let list = [...allRows];

    // Filter by organization dropdown if not 'all'
    if (selectedOrgId && selectedOrgId !== 'all') {
      list = list.filter((item) => item.id === selectedOrgId);
    }

    // Filter by debounced search keyword across org name, owner, and email
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.ownerName.toLowerCase().includes(query) ||
          item.ownerEmail.toLowerCase().includes(query)
      );
    }

    // Sort according to table order and orderBy
    if (table.orderBy) {
      list.sort((a, b) => {
        let aValue = a[table.orderBy];
        let bValue = b[table.orderBy];

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = (bValue || '').toLowerCase();
        }

        if (table.order === 'asc') {
          return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
      });
    }

    return list;
  }, [allRows, selectedOrgId, debouncedSearch, table.order, table.orderBy]);

  const paginatedData = useMemo(() => {
    const start = table.page * table.rowsPerPage;
    return filteredData.slice(start, start + table.rowsPerPage);
  }, [filteredData, table.page, table.rowsPerPage]);

  const notFound = !filteredData.length;

  return (
    <DashboardContent maxWidth="xl">
      {/* Breadcrumbs & Title */}
      <CustomBreadcrumbs
        heading="Billing & Usage"
        links={[
          { name: 'Dashboard', href: currentRoot },
          { name: 'Billing & Usage' },
        ]}
        sx={{ mb: { xs: 3, md: 4 } }}
      />

      {/* 4 KPI Summary Cards: 2 cards in one row using flex */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          mb: { xs: 3, md: 4 },
        }}
      >
        {/* Card 1: Total Data Used */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
          <DataUsageSummaryCard
            title="Total Data Used"
            total={`${stats.totalUsedGb} GB`}
            color="primary"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-folder.svg`}
            subtitle={
              stats.isFiltered
                ? `Limit: ${stats.quotaGb} GB plan`
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

        {/* Card 2: Image Usage */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
          <DataUsageSummaryCard
            title="Image Usage"
            total={`${stats.imageUsageGb} GB`}
            color="info"
            icon="solar:gallery-wide-bold-duotone"
            subtitle={`${stats.imageCount.toLocaleString()} images uploaded`}
            badge={{
              text: `${Math.round((stats.imageUsageGb / stats.totalUsedGb) * 100 || 0)}% of total`,
              color: 'info',
            }}
          />
        </Box>

        {/* Card 3: Other Files */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
          <DataUsageSummaryCard
            title="Other Files"
            total={`${stats.otherFilesGb} GB`}
            color="secondary"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-document.svg`}
            subtitle={`${stats.documentCount.toLocaleString()} files archived`}
            badge={{
              text: `${Math.round((stats.otherFilesGb / stats.totalUsedGb) * 100 || 0)}% of total`,
              color: 'secondary',
            }}
          />
        </Box>

        {/* Card 4: Billing Readiness */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
          <DataUsageSummaryCard
            title="Billing Readiness"
            total={stats.billingStatus}
            color="warning"
            icon={`${CONFIG.site.basePath}/assets/icons/navbar/ic-banking.svg`}
            subtitle={`Base Tier: £${stats.tierMonthlyCost}/mo`}
            badge={{
              text: '£0.15/GB overage tier',
              color: 'warning',
            }}
          />
        </Box>
      </Box>

      {/* Main Table Card */}
      <Card>
        {/* Toolbar with Org Dropdown & Search (full-width search, no counts) */}
        <DataUsageTableToolbar
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          selectedOrg={selectedOrgId}
          onOrgChange={handleOrgChange}
          organizations={allRows}
          onResetFilters={handleResetFilters}
          canReset={canReset}
        />

        {/* Data Usage Table */}
        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={filteredData.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
              />

              <TableBody>
                {paginatedData.map((row) => (
                  <DataUsageTableRow
                    key={row.id}
                    row={row}
                    onViewDetail={handleViewDetail}
                    onEdit={handleEditOrganization}
                  />
                ))}

                <TableNoData
                  notFound={notFound}
                  title="No Organizations Found"
                  subTitle={
                    debouncedSearch
                      ? `No organizations match the search term "${debouncedSearch}".`
                      : 'No data usage records currently available.'
                  }
                />
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        {/* Pagination */}
        <TablePaginationCustom
          count={filteredData.length}
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
        onSuccess={() => setOrganizationToEdit(null)}
      />
    </DashboardContent>
  );
}
