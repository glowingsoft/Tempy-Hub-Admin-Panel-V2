import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';

import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';

import { DashboardContent } from 'src/layouts/dashboard';

import { useGetMembersQuery } from 'src/store/Reducer/members-api';
import { getOwnerOrganizationId, getOwnerOrganizationName } from 'src/sections/branch/utils';
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

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetMembersQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      keyword,
    },
    { skip: !organizationId }
  );
  const paginatedMembers = data?.data ?? [];
  const totalRecords = data?.meta?.totalRecords ?? paginatedMembers.length;

  const { askDeactivate, confirmProps } = useMemberActions({ organizationId });

  const notFound = Boolean(organizationId) && !isLoading && !isFetching && totalRecords === 0;

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

        {!organizationId && (
          <Alert severity="warning" sx={{ m: 2 }}>
            Unable to determine the organization. Please sign in again or contact your administrator.
          </Alert>
        )}

        {isError && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error?.data?.message || 'Unable to load members. Please try again.'}
          </Alert>
        )}

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
