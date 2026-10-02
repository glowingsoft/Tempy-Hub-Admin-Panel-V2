import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';

import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Scrollbar } from 'src/components/scrollbar';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSkeleton,
  useTable,
} from 'src/components/table';

// import { useGetMembersQuery } from 'src/store/Reducer/members-api';
import { mockMembersResponse } from '../mocks/data';
import { getOwnerOrganizationId, getOwnerOrganizationName } from '../utils';
import { useMemberActions } from '../use-member-actions';
import { MemberActionDialog } from '../member-action-dialog';
import { MemberTableRow } from '../member-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'name', label: 'Name', minWidth: 200 },
  { id: 'role', label: 'Role', minWidth: 120 },
  { id: 'branch', label: 'Site', minWidth: 140 },
  { id: 'jobTitle', label: 'Job Title', minWidth: 140 },
  { id: 'departments', label: 'Departments', minWidth: 160 },
  { id: 'startDate', label: 'Start Date', width: 130 },
  { id: 'status', label: 'Status', width: 120, align: 'center' },
  { id: 'createdAt', label: 'Created', width: 130 },
  { id: 'actions', label: 'Actions', width: 120, align: 'center' },
];

const FILTER_FIELDS = [createFilterField.search({ placeholder: 'Search name or email...' })];

// ----------------------------------------------------------------------

export function MemberListView() {
  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });

  const { user } = useSelector((state) => state.user);
  const organizationId = getOwnerOrganizationId(user);
  const orgName = getOwnerOrganizationName(user);

  const filters = useSetState({ search: '' });
  const keyword = useDebounce(filters.state.search, 500);

  const [reloadKey, setReloadKey] = useState(0);
  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  const { askDeactivate, confirmProps } = useMemberActions({ organizationId, onChanged: refresh });

  // --- Data source ---------------------------------------------------------
  // TODO: swap for the real query once the endpoint is wired up:
  // const { data, isLoading, isFetching } = useGetMembersQuery(
  //   { organizationId, page: table.page + 1, limit: table.rowsPerPage, keyword },
  //   { skip: !organizationId }
  // );
  const isLoading = false;
  const isFetching = false;
  const data = mockMembersResponse;

  const allMembers = useMemo(
    () =>
      (data?.data ?? []).filter((member) => !organizationId || member.organizationId === organizationId),
    [data, organizationId, reloadKey]
  );

  // Client-side filtering (mock only — the API filters server-side).
  const filteredMembers = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return allMembers.filter(
      (member) =>
        !search ||
        member.name?.toLowerCase().includes(search) ||
        member.email?.toLowerCase().includes(search)
    );
  }, [allMembers, keyword]);

  // Pagination metadata (mirrors the API `meta`).
  const totalRecords = filteredMembers.length;
  const paginatedMembers = useMemo(() => {
    const start = table.page * table.rowsPerPage;
    return filteredMembers.slice(start, start + table.rowsPerPage);
  }, [filteredMembers, table.page, table.rowsPerPage]);

  const notFound = !isLoading && !isFetching && totalRecords === 0;

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

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Members"
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Memberships' },
          { name: 'Members' },
          ...(orgName ? [{ name: orgName }] : []),
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <FlexibleTableToolbar
          filterFields={FILTER_FIELDS}
          filterValues={filters.state}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1080 }}>
              <TableHeadCustom order={table.order} orderBy={table.orderBy} headLabel={TABLE_HEAD} />

              <TableBody>
                {isLoading || isFetching ? (
                  [...Array(table.rowsPerPage)].map((_, index) => <TableSkeleton key={index} />)
                ) : (
                  <>
                    {paginatedMembers.map((row, index) => (
                      <MemberTableRow
                        key={row._id}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                        onDeactivate={askDeactivate}
                      />
                    ))}

                    <TableNoData notFound={notFound} title="No members yet" />
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

      <MemberActionDialog {...confirmProps} />
    </DashboardContent>
  );
}
