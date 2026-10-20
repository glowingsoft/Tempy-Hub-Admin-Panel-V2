import { useMemo, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { Scrollbar } from 'src/components/scrollbar';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import {
  useTable,
  TableNoData,
  TableBodySkeleton,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { FlexibleTableFiltersResult } from 'src/components/generic-table/table-filters-result';

import {
  useGetAttendanceChangeRequestsQuery,
  extractRecordsArray,
} from 'src/store/Reducer/attendance-api';
import { ChangeRequestsRow } from './change-requests-row';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'staff', label: 'Staff', minWidth: 200 },
  { id: 'date', label: 'Work Date', minWidth: 120, align: 'center' },
  { id: 'original', label: 'Original Timing', minWidth: 160, align: 'center' },
  { id: 'requested', label: 'Requested Timing', minWidth: 160, align: 'center' },
  { id: 'reason', label: 'Reason', minWidth: 200 },
  { id: 'status', label: 'Status', minWidth: 110, align: 'center' },
  { id: 'submitted', label: 'Submitted', minWidth: 130, align: 'center' },
];

const FILTER_FIELDS = [
  createFilterField.status({
    options: STATUS_OPTIONS,
    showCount: true,
  }),
  createFilterField.search({
    placeholder: 'Search staff or reason...',
  }),
];

// ----------------------------------------------------------------------

export function AttendanceChangeRequestsTable({ organizationId }) {
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });

  const filters = useSetState({
    search: '',
    status: 'all',
  });
  const trimmedKeyword = useDebounce(filters.state.search, 400).trim();

  const {
    data: apiResponse,
    isLoading,
    isFetching,
  } = useGetAttendanceChangeRequestsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(filters.state.status && filters.state.status !== 'all'
        ? { status: filters.state.status }
        : {}),
      ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
    },
    { skip: !organizationId }
  );

  const rawData = useMemo(() => {
    const list = extractRecordsArray(apiResponse?.data ?? apiResponse);
    return Array.isArray(list) ? list : [];
  }, [apiResponse]);

  const totalRecords =
    apiResponse?.meta?.totalRecords ?? (Array.isArray(rawData) ? rawData.length : 0);

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

  const statusCounts = apiResponse?.meta?.counts ?? {};

  const getStatusCount = useCallback(
    (status) => {
      if (status === 'all') {
        const totalFromCounts = Object.values(statusCounts).reduce(
          (sum, count) => sum + (Number(count) || 0),
          0
        );
        return totalFromCounts || totalRecords;
      }
      return statusCounts[status] ?? 0;
    },
    [statusCounts, totalRecords]
  );

  const statusFilterField = useMemo(() => FILTER_FIELDS.find((f) => f.type === 'status'), []);
  const toolbarFilterFields = useMemo(() => FILTER_FIELDS.filter((f) => f.type !== 'status'), []);

  const activeFilters = useMemo(() => {
    const list = [];
    if (filters.state.search) {
      list.push({ key: 'search', label: 'Search', value: filters.state.search });
    }
    if (filters.state.status !== 'all') {
      list.push({
        key: 'status',
        type: 'status',
        label: 'Status',
        value: filters.state.status,
        options: STATUS_OPTIONS,
      });
    }
    return list;
  }, [filters.state]);

  const handleResetFilters = useCallback(() => {
    table.onResetPage();
    filters.setState({ search: '', status: 'all' });
  }, [filters, table]);

  const handleRemoveFilter = useCallback(
    (key) => {
      table.onResetPage();
      if (key === 'status') {
        filters.setState({ status: 'all' });
      } else if (key === 'search') {
        filters.setState({ search: '' });
      }
    },
    [filters, table]
  );

  const notFound = !isLoading && !isFetching && !rawData.length;

  return (
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

      {!!activeFilters.length && (
        <FlexibleTableFiltersResult
          activeFilters={activeFilters}
          totalResults={rawData.length}
          onResetFilters={handleResetFilters}
          onRemoveFilter={handleRemoveFilter}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}

      <TableContainer sx={{ position: 'relative' }}>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 900 }}>
            <TableHeadCustom headLabel={TABLE_HEAD} />

            <TableBody>
              {isLoading || isFetching ? (
                <TableBodySkeleton
                  rowCount={table.rowsPerPage}
                  cellCount={TABLE_HEAD.length}
                />
              ) : (
                rawData.map((row, index) => (
                  <ChangeRequestsRow
                    key={row._id || index}
                    row={row}
                    serialNumber={table.page * table.rowsPerPage + index + 1}
                  />
                ))
              )}

              <TableNoData notFound={notFound} />
            </TableBody>
          </Table>
        </Scrollbar>

        <TablePaginationCustom
          page={table.page}
          count={totalRecords}
          dense={table.dense}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          onChangeDense={table.onChangeDense}
        />
      </TableContainer>
    </Card>
  );
}
