import { useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';

import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';

import { DashboardContent } from 'src/layouts/dashboard';

import { getListStatusTabCount } from 'src/utils/table-utils';
import { useGetMembersQuery } from 'src/store/Reducer/members-api';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Scrollbar } from 'src/components/scrollbar';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';

import { MEMBER_STATUS_OPTIONS } from '../mocks/data';
import { useMemberActions } from '../use-member-actions';
import { MemberActionDialog } from '../member-action-dialog';
import { MemberTableRow } from '../member-table-row';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  ...MEMBER_STATUS_OPTIONS,
];

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

const FILTER_FIELDS = [
  createFilterField.status({ options: STATUS_OPTIONS, showCounts: true }),
  createFilterField.search({ placeholder: 'Search name or email...' }),
];

// ----------------------------------------------------------------------

export function MemberListView() {
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });

  const { organizationId, organizationName: orgName } = useCurrentOrganization();

  const filters = useSetState({ search: '', status: 'all' });
  const keyword = useDebounce(filters.state.search, 500);
  const trimmedKeyword = keyword.trim();
  const { status } = filters.state;

  const { data, isLoading, isFetching } = useGetMembersQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(status && status !== 'all' ? { status } : {}),
      ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
    },
    { skip: !organizationId }
  );

  const members = useMemo(() => data?.data ?? [], [data]);
  const meta = data?.meta ?? {};
  const statusCounts = meta.counts ?? {};
  const totalRecords = meta.totalRecords ?? members.length;

  const { askDeactivate, confirmProps } = useMemberActions({ organizationId });

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((field) => field.type === 'status'),
    []
  );
  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((field) => field.type !== 'status'),
    []
  );

  const getStatusCount = useCallback(
    (tabStatus) => getListStatusTabCount(statusCounts, tabStatus, totalRecords),
    [statusCounts, totalRecords]
  );

  const notFound = !isLoading && !isFetching && members.length === 0;

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
        {statusFilterField && (
          <StatusTabsFilterWrapper
            filterField={statusFilterField}
            value={filters.state.status}
            onChange={handleFilterChange}
            getCount={getStatusCount}
          />
        )}

        <FlexibleTableToolbar
          filterFields={toolbarFilterFields}
          filterValues={filters.state}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1080 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {isLoading || isFetching ? (
                  <TableBodySkeleton
                    rowCount={table.rowsPerPage}
                    cellCount={TABLE_HEAD.length}
                  />
                ) : (
                  <>
                    {members.map((row, index) => (
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
