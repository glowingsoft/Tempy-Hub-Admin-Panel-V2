import { useCallback, useMemo } from 'react';

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
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useGetShiftsQuery } from 'src/store/Reducer/shifts-api';
import { SHIFT_STATUS_OPTIONS } from '../mocks/data';
import { ShiftTableRow } from '../shift-table-row';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All', color: 'default' }, ...SHIFT_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'branch', label: 'Site', minWidth: 140 },
  { id: 'staff', label: 'Staff', minWidth: 180 },
  { id: 'startsAt', label: 'Start Date/Time', minWidth: 170 },
  { id: 'endsAt', label: 'End Date/Time', minWidth: 170 },
  { id: 'status', label: 'Status', width: 120, align: 'center' },
  { id: 'visibility', label: 'Visibility', width: 120 },
  { id: 'createdAt', label: 'Created', width: 130 },
  { id: 'actions', label: 'Actions', width: 90, align: 'center' },
];

const FILTER_FIELDS = [
  createFilterField.status({ options: STATUS_OPTIONS, showCounts: true }),
  createFilterField.search({ placeholder: 'Search site or staff...' }),
];

// ----------------------------------------------------------------------

export function ShiftListView({ organizationId: propOrgId, pathsConfig } = {}) {
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });

  const { organizationId: resolvedOrgId, organizationName: resolvedOrgName } =
    useCurrentOrganization(propOrgId);
  const organizationId = propOrgId || resolvedOrgId;
  const orgName = resolvedOrgName;

  const filters = useSetState({ search: '', status: 'all' });
  const keyword = useDebounce(filters.state.search, 500);
  const trimmedKeyword = keyword.trim();
  const { status } = filters.state;

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((field) => field.type === 'status'),
    []
  );
  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((field) => field.type !== 'status'),
    []
  );

  const { data, isLoading, isFetching } = useGetShiftsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
      ...(status && status !== 'all' ? { status } : {}),
    },
    { skip: !organizationId }
  );

  const shifts = useMemo(() => data?.data ?? [], [data]);
  const meta = data?.meta ?? {};
  const statusCounts = meta.counts ?? {};
  const totalRecords = meta.totalRecords ?? shifts.length;

  const getStatusCount = useCallback(
    (tabStatus) => {
      if (tabStatus === 'all') {
        const totalFromCounts = Object.values(statusCounts).reduce(
          (sum, count) => sum + (Number(count) || 0),
          0
        );
        return totalFromCounts || totalRecords;
      }

      return statusCounts[tabStatus] ?? 0;
    },
    [statusCounts, totalRecords]
  );

  const notFound = !isLoading && !isFetching && shifts.length === 0;

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

  const newShiftHref =
    pathsConfig?.new ||
    (organizationId ? `${paths.owner.shifts.new}?orgId=${organizationId}` : paths.owner.shifts.new);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Shifts"
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          // { name: 'Rota' },
          { name: 'Shifts' },
          ...(orgName ? [{ name: orgName }] : []),
        ]}
        action={
          <Button
            component={RouterLink}
            href={newShiftHref}
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Shift
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        {statusFilterField && (
          <StatusTabsFilterWrapper
            filterField={statusFilterField}
            value={status}
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
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1200 }}>
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
                    {shifts.map((row, index) => (
                      <ShiftTableRow
                        key={row._id}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                      />
                    ))}

                    <TableNoData notFound={notFound} title="No shifts yet" />
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
