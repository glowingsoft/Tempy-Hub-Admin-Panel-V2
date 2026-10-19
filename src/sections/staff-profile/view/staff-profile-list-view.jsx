import { useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Scrollbar } from 'src/components/scrollbar';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';

import { MEMBERSHIP_ROLE_OPTIONS } from 'src/sections/membership/mocks/data';
import { useGetStaffProfilesQuery } from 'src/store/Reducer/staff-profiles-api';
import { StaffProfileTableRow } from '../staff-profile-table-row';

// ----------------------------------------------------------------------

const ROLE_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  ...MEMBERSHIP_ROLE_OPTIONS.map((option) => ({
    ...option,
    color:
      (option.value === 'siteManager' && 'info') ||
      (option.value === 'lineManager' && 'warning') ||
      (option.value === 'staff' && 'success') ||
      'default',
  })),
];

const ROLE_FILTER_FIELD = createFilterField.status({
  key: 'role',
  label: 'Role',
  options: ROLE_OPTIONS,
  showCounts: true,
});

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 56 },
  { id: 'user', label: 'Staff', minWidth: 220 },
  { id: 'role', label: 'Role', minWidth: 120 },
  { id: 'branch', label: 'Site', minWidth: 140 },
  { id: 'jobTitle', label: 'Job Title', minWidth: 140 },
  { id: 'departments', label: 'Departments', minWidth: 160 },
  { id: 'startDate', label: 'Start Date', width: 130 },
  { id: 'createdAt', label: 'Created', width: 130 },
  { id: 'actions', label: 'Actions', width: 100, align: 'center' },
];

const FILTER_FIELDS = [createFilterField.search({ placeholder: 'Search staff or email...' })];

// ----------------------------------------------------------------------

export function StaffProfileListView({
  organizationId: propOrgId,
  organizationName: propOrgName,
  pathsConfig,
  embedded = false,
  hideViewAction = false,
} = {}) {
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });

  const { organizationId, organizationName: defaultOrgName, isOwner } = useCurrentOrganization(propOrgId);
  const orgName = propOrgName !== undefined ? propOrgName : defaultOrgName;

  const resolvedPaths = useMemo(
    () => ({
      dashboardRoot: isOwner ? paths.owner.root : paths.dashboard.root,
      root: isOwner ? paths.owner.staffProfiles.root : paths.dashboard.staffProfiles.root,
      new: isOwner ? paths.owner.staffProfiles.new : paths.dashboard.staffProfiles.new,
      detail: (id) =>
        isOwner ? paths.owner.staffProfiles.detail(id) : paths.dashboard.staffProfiles.detail(id),
      edit: (id) =>
        isOwner ? paths.owner.staffProfiles.edit(id) : paths.dashboard.staffProfiles.edit(id),
      ...pathsConfig,
    }),
    [isOwner, pathsConfig]
  );

  const filters = useSetState({ search: '', role: 'all' });
  const keyword = useDebounce(filters.state.search, 500);
  const trimmedKeyword = keyword.trim();

  const { data, isLoading, isFetching } = useGetStaffProfilesQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
      ...(filters.state.role !== 'all' ? { role: filters.state.role } : {}),
    },
    { skip: !organizationId }
  );

  const profiles = useMemo(() => data?.data ?? [], [data]);
  const totalRecords = data?.meta?.totalRecords ?? profiles.length;
  const roleCounts = data?.meta?.counts ?? {};

  const getRoleCount = useCallback(
    (role) => {
      if (role === 'all') {
        const totalFromCounts = Object.values(roleCounts).reduce(
          (sum, count) => sum + (Number(count) || 0),
          0
        );
        return totalFromCounts || totalRecords;
      }

      return roleCounts[role] ?? 0;
    },
    [roleCounts, totalRecords]
  );

  const notFound = !isLoading && !isFetching && profiles.length === 0;

  const handleFilterChange = useCallback(
    (key, value) => {
      table.onResetPage();
      filters.setState({ [key]: value });
    },
    [filters, table]
  );

  const handleSearchChange = useCallback(
    (event) => {
      table.onResetPage();
      filters.setState({ search: event.target.value });
    },
    [filters, table]
  );

  const content = (
    <>
      {!embedded && (
        <CustomBreadcrumbs
          heading="Staff Profiles"
          links={[
            { name: 'Dashboard', href: resolvedPaths.dashboardRoot },
            { name: 'Staff Profiles' },
            ...(orgName ? [{ name: orgName }] : []),
          ]}
          sx={{ mb: { xs: 3, md: 5 } }}
        />
      )}

      <Card>
        <StatusTabsFilterWrapper
          filterField={ROLE_FILTER_FIELD}
          value={filters.state.role}
          onChange={handleFilterChange}
          getCount={getRoleCount}
        />

        <FlexibleTableToolbar
          filterFields={FILTER_FIELDS}
          filterValues={filters.state}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {isLoading || isFetching ? (
                  <TableBodySkeleton
                    rowCount={table.rowsPerPage}
                    cellCount={TABLE_HEAD.length}
                    dense={table.dense}
                  />
                ) : (
                  <>
                    {profiles.map((row, index) => (
                      <StaffProfileTableRow
                        key={row._id}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                        detailPath={resolvedPaths.detail(row._id)}
                        editPath={resolvedPaths.edit(row._id)}
                        hideViewAction={hideViewAction}
                      />
                    ))}

                    <TableNoData notFound={notFound} title="No staff profiles yet" />
                  </>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={totalRecords}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </>
  );

  if (embedded) {
    return <Box>{content}</Box>;
  }

  return <DashboardContent>{content}</DashboardContent>;
}
