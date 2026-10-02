import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

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

import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { mockOrganizations } from 'src/sections/organization/mocks/data';
import { BRANCH_STATUS_OPTIONS, mockBranchesResponse } from '../mocks/data';
import { getOwnerOrganizationId } from '../utils';
import { BranchTableRow } from '../branch-table-row';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All', color: 'default' }, ...BRANCH_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'name', label: 'Name', minWidth: 200 },
  { id: 'code', label: 'Code', width: 100 },
  { id: 'timezone', label: 'Timezone', minWidth: 160 },
  { id: 'address', label: 'Address', minWidth: 200 },
  { id: 'status', label: 'Status', width: 140, align: 'center' },
  { id: 'createdAt', label: 'Created At', width: 140 },
  { id: 'actions', label: 'Actions', width: 100, align: 'center' },
];

const FILTER_FIELDS = [
  createFilterField.status({ options: STATUS_OPTIONS, showCounts: true }),
  createFilterField.search({ placeholder: 'Search site...' }),
];

// ----------------------------------------------------------------------

export function BranchListView() {
  const table = useTable({ defaultOrderBy: 'name', defaultOrder: 'asc' });

  const { user } = useSelector((state) => state.user);
  const organizationId = getOwnerOrganizationId(user) ?? mockOrganizations[0]?._id ?? null;

  const filters = useSetState({ search: '', status: 'all' });
  const keyword = useDebounce(filters.state.search, 500);

  const { data, isLoading, isFetching } = useGetBranchesQuery(
    { organizationId, page: table.page + 1, limit: table.rowsPerPage, keyword },
    { skip: !organizationId }
  );

  // Branches are scoped to the owner's organization.
  const allBranches = useMemo(
    () => (data ? (data?.data ?? []) : mockBranchesResponse.data).filter((b) => !organizationId || b.organizationId === organizationId),
    [data, organizationId]
  );

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((field) => field.type === 'status'),
    []
  );
  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((field) => field.type !== 'status'),
    []
  );

  // Client-side filtering (mock only — the API will do this server-side).
  const filteredBranches = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return allBranches
      .filter((branch) => {
        const matchesStatus =
          filters.state.status === 'all' || branch.status === filters.state.status;

        const matchesSearch =
          !search ||
          branch.name?.toLowerCase().includes(search) ||
          branch.code?.toLowerCase().includes(search) ||
          branch.address?.toLowerCase().includes(search);

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [allBranches, filters.state.status, keyword]);

  const totalRecords = filteredBranches.length;

  const paginatedBranches = useMemo(() => {
    const start = table.page * table.rowsPerPage;
    return filteredBranches.slice(start, start + table.rowsPerPage);
  }, [filteredBranches, table.page, table.rowsPerPage]);

  const getStatusCount = useCallback(
    (status) =>
      status === 'all'
        ? allBranches.length
        : allBranches.filter((branch) => branch.status === status).length,
    [allBranches]
  );

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

  const orgName = user?.organization?.name;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Sites"
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Sites' },
          ...(orgName ? [{ name: orgName }] : []),
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.owner.sites.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Site
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <StatusTabsFilterWrapper
          filterField={statusFilterField}
          value={filters.state.status}
          onChange={handleFilterChange}
          getCount={getStatusCount}
        />

        <FlexibleTableToolbar
          filterFields={toolbarFilterFields}
          filterValues={filters.state}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1000 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
              />

              <TableBody>
                {isLoading || isFetching ? (
                  [...Array(table.rowsPerPage)].map((_, index) => (
                    <TableSkeleton key={index} />
                  ))
                ) : (
                  <>
                    {paginatedBranches.map((row, index) => (
                      <BranchTableRow
                        key={row._id}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                      />
                    ))}

                    <TableNoData notFound={notFound} />
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
    </DashboardContent>
  );
}
