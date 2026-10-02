import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';
import { SHIFT_STATUS_OPTIONS, mockShiftsResponse } from 'src/sections/shift/mocks/data';

import { StaffShiftTableRow } from './staff-shift-table-row';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All', color: 'default' }, ...SHIFT_STATUS_OPTIONS];

const STATUS_FILTER_FIELD = createFilterField.status({
  options: STATUS_OPTIONS,
  showCounts: true,
});

const FILTER_FIELDS = [createFilterField.search({ placeholder: 'Search site...' })];

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'branch', label: 'Site', minWidth: 140 },
  { id: 'startsAt', label: 'Start Date/Time', minWidth: 170 },
  { id: 'endsAt', label: 'End Date/Time', minWidth: 170 },
  { id: 'status', label: 'Status', width: 130, align: 'center' },
  { id: 'urgentCover', label: 'Urgent Cover', width: 120, align: 'center' },
  { id: 'actions', label: 'Action', width: 140, align: 'center' },
];

// ----------------------------------------------------------------------

export function StaffShiftListView() {
  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });
  const [claimedShiftIds, setClaimedShiftIds] = useState([]);

  const filters = useSetState({ search: '', status: 'all' });
  const keyword = useDebounce(filters.state.search, 500);

  const allShifts = mockShiftsResponse.data;

  const filteredShifts = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    return allShifts.filter((shift) => {
      const matchesStatus =
        filters.state.status === 'all' || shift.status === filters.state.status;
      const matchesSearch = !search || shift.branch?.name?.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [allShifts, filters.state.status, keyword]);

  const paginatedShifts = useMemo(() => {
    const start = table.page * table.rowsPerPage;
    return filteredShifts.slice(start, start + table.rowsPerPage);
  }, [filteredShifts, table.page, table.rowsPerPage]);

  const getStatusCount = useCallback(
    (status) =>
      status === 'all'
        ? allShifts.length
        : allShifts.filter((shift) => shift.status === status).length,
    [allShifts]
  );

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

  const handleClaim = useCallback((shift) => {
    setClaimedShiftIds((current) => [...current, shift._id]);
  }, []);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Available Shifts"
        links={[{ name: 'Dashboard', href: paths.staff.dashboard }, { name: 'Available Shifts' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <StatusTabsFilterWrapper
          filterField={STATUS_FILTER_FIELD}
          value={filters.state.status}
          onChange={handleFilterChange}
          getCount={getStatusCount}
        />

        <FlexibleTableToolbar
          filterFields={FILTER_FIELDS}
          filterValues={filters.state}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 880 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
              />

              <TableBody>
                {paginatedShifts.map((row, index) => (
                  <StaffShiftTableRow
                    key={row._id}
                    row={row}
                    serialNumber={table.page * table.rowsPerPage + index + 1}
                    claimed={claimedShiftIds.includes(row._id)}
                    onClaim={handleClaim}
                  />
                ))}

                <TableNoData notFound={!paginatedShifts.length} title="No available shifts" />
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={filteredShifts.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>
    </DashboardContent>
  );
}
