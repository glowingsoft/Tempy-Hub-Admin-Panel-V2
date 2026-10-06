import { useCallback, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { CONFIG } from 'src/config-global';
import { useSetState } from 'src/hooks/use-set-state';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { UserTableFiltersResult } from 'src/sections/user/user-table-filters-result';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';

import {
  mockFamilyGroupsData,
  FAMILY_GROUP_STATUS_OPTIONS,
} from '../mocks/data';
import { FamilyGroupTableRow } from '../family-group-table-row';

// ----------------------------------------------------------------------

const icon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 60 },
  { id: 'resident', label: 'Resident', width: '25%', minWidth: 200 },
  { id: 'nextOfKin', label: 'Next of kin', width: '22%', minWidth: 180 },
  { id: 'members', label: 'Members', align: 'center', width: '12%', minWidth: 100 },
  { id: 'status', label: 'Status', align: 'center', width: '16%', minWidth: 140 },
  { id: 'actions', label: 'Actions', align: 'center', width: '25%', minWidth: 200 },
];

const FILTER_FIELDS = [
  createFilterField.status({
    key: 'status',
    label: 'Family groups',
    options: FAMILY_GROUP_STATUS_OPTIONS,
    showCounts: true,
  }),
  createFilterField.search({
    placeholder: 'Search resident, next of kin, or room...',
  }),
];

// ----------------------------------------------------------------------

export function FamilyGroupView() {
  const table = useTable();
  const familyPaths = useFamilyEngagementPaths();

  const [tableData] = useState(mockFamilyGroupsData.residents);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Filters using useSetState (matches Gazettes & project tables)
  const filters = useSetState({
    name: '',
    status: 'all',
  });

  // Role-based breadcrumbs
  const breadcrumbLinks = [
    { name: 'Dashboard', href: familyPaths.dashboardRoot },
    { name: 'Family Engagement', href: familyPaths.familyOverview },
    { name: 'Family Groups' },
  ];

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((f) => f.type === 'status'),
    []
  );

  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((f) => f.type !== 'status'),
    []
  );

  const handleSearchChange = useCallback(
    (event) => {
      table.onResetPage();
      filters.setState({ name: event.target.value });
    },
    [filters, table]
  );

  const handleFilterChange = useCallback(
    (key, value) => {
      table.onResetPage();
      filters.setState({ [key]: value });
    },
    [filters, table]
  );

  const handleResetFilters = useCallback(() => {
    table.onResetPage();
    filters.setState({ name: '', status: 'all' });
  }, [filters, table]);

  const getStatusCount = useCallback(
    (statusValue) => {
      if (statusValue === 'all') return tableData.length;
      return tableData.filter((item) => item.status === statusValue).length;
    },
    [tableData]
  );

  // Summary counts
  const summaryCounts = useMemo(() => {
    const active = tableData.filter((r) => r.status === 'active').length;
    const pending = tableData.filter((r) => r.status === 'invite_pending').length;
    const noFamily = tableData.filter((r) => r.status === 'no_family').length;
    return {
      all: tableData.length,
      active,
      pending,
      noFamily,
    };
  }, [tableData]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    const search = filters.state.name.trim().toLowerCase();
    const status = filters.state.status;

    return tableData.filter((item) => {
      // Status tab filter
      if (status !== 'all' && item.status !== status) {
        return false;
      }

      // Text search
      if (search) {
        const residentName = (item.resident || item.name || '').toLowerCase();
        const nokMatch = (item.nextOfKin || '').toLowerCase().includes(search);
        const roomMatch = (item.room || item.roomNumber || '').toString().toLowerCase().includes(search);
        const residentMatch = residentName.includes(search);
        if (!residentMatch && !nokMatch && !roomMatch) {
          return false;
        }
      }

      return true;
    });
  }, [tableData, filters.state]);

  const dataInPage = useMemo(() => {
    const start = table.page * table.rowsPerPage;
    return filteredRows.slice(start, start + table.rowsPerPage);
  }, [filteredRows, table.page, table.rowsPerPage]);

  const canReset = filters.state.name !== '' || filters.state.status !== 'all';

  const notFound = !filteredRows.length && canReset;

  // Action button handlers (icon button actions)
  const handleManage = useCallback((group) => {
    toast.info(`Manage family group for ${group.resident}`);
  }, []);

  const handleInvite = useCallback((group) => {
    toast.success(`Invite sent for ${group.resident}'s family group`);
  }, []);

  const handleResendInvite = useCallback((group) => {
    const contactName = group.nextOfKin || group.resident;
    toast.success(`Invitation resent to ${contactName}`);
  }, []);

  const handleAddNok = useCallback((group) => {
    toast.info(`Add next of kin for ${group.resident}`);
  }, []);

  return (
    <>
      <Helmet>
        <title>{`Family Groups | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent maxWidth="xl">
        {/* Custom Header & Breadcrumbs */}
        <CustomBreadcrumbs
          heading="Family Groups"
          links={breadcrumbLinks}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:user-plus-bold" />}
              onClick={() => toast.info('Invite Family Member')}
            >
              Invite Family Member
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {/* Top Summary KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid xs={12} sm={6} md={3}>
            <CourseWidgetSummary
              title="Total Family Groups"
              total={summaryCounts.all}
              color="primary"
              icon={icon('ic-users')}
              sx={{
                border: (t) => `1px solid ${t.palette.divider}`,
                cursor: 'default',
                userSelect: 'none',
              }}
            />
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <CourseWidgetSummary
              title="Active Groups"
              total={summaryCounts.active}
              color="success"
              icon={icon('ic-user')}
              sx={{
                border: (t) => `1px solid ${t.palette.divider}`,
                cursor: 'default',
                userSelect: 'none',
              }}
            />
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <CourseWidgetSummary
              title="Invite Pending"
              total={summaryCounts.pending}
              color="warning"
              icon={icon('ic-mail')}
              sx={{
                border: (t) => `1px solid ${t.palette.divider}`,
                cursor: 'default',
                userSelect: 'none',
              }}
            />
          </Grid>

          <Grid xs={12} sm={6} md={3}>
            <CourseWidgetSummary
              title="No Family Linked"
              total={summaryCounts.noFamily}
              color="error"
              icon={icon('ic-disabled')}
              sx={{
                border: (t) => `1px solid ${t.palette.divider}`,
                cursor: 'default',
                userSelect: 'none',
              }}
            />
          </Grid>
        </Grid>

        {/* Table in Card Container */}
        <Card sx={{ mb: 4 }}>
          {/* Status Tabs Filter for Family Groups */}
          <StatusTabsFilterWrapper
            filterField={statusFilterField}
            value={filters.state.status}
            onChange={handleFilterChange}
            getCount={getStatusCount}
          />

          {/* Flexible Toolbar with Search */}
          <FlexibleTableToolbar
            filterFields={toolbarFilterFields}
            filterValues={filters.state}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
          />

          {/* Active Filters Result Bar */}
          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              totalResults={filteredRows.length}
              onResetPage={handleResetFilters}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          {/* Table Container */}
          <TableContainer>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} />

                <TableBody>
                  {dataInPage.map((row, index) => (
                    <FamilyGroupTableRow
                      key={row.id}
                      row={row}
                      serialNumber={table.page * table.rowsPerPage + index + 1}
                      isSelected={selectedGroup?.id === row.id}
                      onSelectRow={(item) => setSelectedGroup(item)}
                      onManage={handleManage}
                      onInvite={handleInvite}
                      onResend={handleResendInvite}
                      onAddNok={handleAddNok}
                    />
                  ))}

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>

            <TablePaginationCustom
              page={table.page}
              count={filteredRows.length}
              dense={table.dense}
              rowsPerPage={table.rowsPerPage}
              onPageChange={table.onChangePage}
              onRowsPerPageChange={table.onChangeRowsPerPage}
              onChangeDense={table.onChangeDense}
            />
          </TableContainer>
        </Card>
      </DashboardContent>
    </>
  );
}

export default FamilyGroupView;
