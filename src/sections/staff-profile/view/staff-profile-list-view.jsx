import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSkeleton,
  useTable,
} from 'src/components/table';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useOrganizationLookups, resolveMemberRole } from 'src/hooks/use-organization-lookups';
import { useGetStaffProfilesQuery } from 'src/store/Reducer/staff-profiles-api';
import { MEMBERSHIP_ROLE_OPTIONS } from 'src/sections/membership/mocks/data';
import { mockStaffProfilesResponse } from '../mocks/data';
import { StaffProfileTableRow } from '../staff-profile-table-row';

// ----------------------------------------------------------------------

const ROLE_OPTIONS = [{ value: 'all', label: 'All', color: 'default' }, ...MEMBERSHIP_ROLE_OPTIONS];

// Role tabs filter the loaded rows only (UI-side) — no role param is sent to the API.
const ROLE_FILTER_FIELD = createFilterField.status({
  key: 'role',
  label: 'Role',
  options: ROLE_OPTIONS,
  showCounts: true,
});

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'user', label: 'Staff', minWidth: 220 },
  { id: 'role', label: 'Role', minWidth: 120 },
  { id: 'branch', label: 'Site', minWidth: 140 },
  { id: 'jobTitle', label: 'Job Title', minWidth: 140 },
  { id: 'departments', label: 'Departments', minWidth: 160 },
  { id: 'startDate', label: 'Start Date', width: 130 },
  { id: 'createdAt', label: 'Created', width: 130 },
  { id: 'actions', label: 'Actions', width: 100, align: 'center' },
];

// TODO: confirm whether the list endpoint supports a keyword/search param — the
// search below is client-side only against the current page of mock data.
const FILTER_FIELDS = [createFilterField.search({ placeholder: 'Search staff or email...' })];

// ----------------------------------------------------------------------

export function StaffProfileListView({
  organizationId: propOrgId,
  organizationName: propOrgName,
  pathsConfig,
  embedded = false,
  hideViewAction = false,
} = {}) {
  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });

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

  const {
    branchesMap,
    jobTitlesMap,
    departmentsMap,
    membersMap,
    isLoading: isLookupsLoading,
  } = useOrganizationLookups({
    organizationId,
    limit: 100,
    members: true,
  });

  const filters = useSetState({ search: '', role: 'all' });
  const keyword = useDebounce(filters.state.search, 500);

  const [reloadKey] = useState(0);

  // --- Data source ---------------------------------------------------------
  const {
    data: apiData,
    isLoading,
    isFetching,
    isError,
    error: apiError,
  } = useGetStaffProfilesQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      keyword,
    },
    { skip: !organizationId }
  );

  const usesApi = Boolean(organizationId);
  const data = usesApi ? apiData : mockStaffProfilesResponse;

  const allProfiles = useMemo(
    () =>
      (data?.data ?? []).filter(
        (profile) => !organizationId || profile.organizationId === organizationId
      ),
    [data, organizationId, reloadKey]
  );

  const matchesRole = useCallback(
    (profile) =>
      filters.state.role === 'all' || resolveMemberRole(profile, membersMap) === filters.state.role,
    [filters.state.role, membersMap]
  );

  const mockFilteredProfiles = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return allProfiles.filter(
      (profile) =>
        matchesRole(profile) &&
        (!search ||
          profile.user?.name?.toLowerCase().includes(search) ||
          profile.user?.email?.toLowerCase().includes(search))
    );
  }, [allProfiles, keyword, matchesRole]);

  const mockPaginatedProfiles = useMemo(() => {
    const start = table.page * table.rowsPerPage;
    return mockFilteredProfiles.slice(start, start + table.rowsPerPage);
  }, [mockFilteredProfiles, table.page, table.rowsPerPage]);

  const paginatedProfiles = usesApi
    ? (data?.data ?? []).filter(matchesRole)
    : mockPaginatedProfiles;
  const totalRecords = usesApi
    ? apiData?.meta?.totalRecords ?? apiData?.data?.length ?? 0
    : mockFilteredProfiles.length;

  const getRoleCount = useCallback(
    (role) =>
      role === 'all'
        ? allProfiles.length
        : allProfiles.filter((profile) => resolveMemberRole(profile, membersMap) === role).length,
    [allProfiles, membersMap]
  );

  // Rows resolve Site / Job Title / Department names from the lookups, so wait for those too.
  const isTableLoading = isLoading || isFetching || isLookupsLoading;
  const notFound = !isTableLoading && (totalRecords === 0 || paginatedProfiles.length === 0);

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

  const newButtonDisabled = isOwner && !organizationId;

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
          /* action={
            <Button
              component={RouterLink}
              href={resolvedPaths.new}
              variant="contained"
              disabled={newButtonDisabled}
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Staff Profile
            </Button>
          } */
          sx={{ mb: { xs: 3, md: 5 } }}
        />
      )}

      {/* {embedded && (
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            component={RouterLink}
            href={resolvedPaths.new}
            variant="contained"
            disabled={newButtonDisabled}
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Staff Profile
          </Button>
        </Box>
      )} */}

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
              <TableHeadCustom order={table.order} orderBy={table.orderBy} headLabel={TABLE_HEAD} />

              <TableBody>
                {isTableLoading ? (
                  [...Array(table.rowsPerPage)].map((_, index) => <TableSkeleton key={index} />)
                ) : (
                  <>
                    {paginatedProfiles.map((row, index) => (
                      <StaffProfileTableRow
                        key={row._id}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                        detailPath={resolvedPaths.detail(row._id)}
                        editPath={resolvedPaths.edit(row._id)}
                        hideViewAction={hideViewAction}
                        branchesMap={branchesMap}
                        jobTitlesMap={jobTitlesMap}
                        departmentsMap={departmentsMap}
                        membersMap={membersMap}
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
