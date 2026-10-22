import { useMemo } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { Scrollbar } from 'src/components/scrollbar';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { FlexibleTableFiltersResult } from 'src/components/generic-table/table-filters-result';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
} from 'src/components/table';

import { PUNCTUALITY_STATUS_OPTIONS, TABLE_FILTER_FIELDS, TABLE_HEAD } from '../constants';
import { AttendanceTableRow } from './table-row';

// ----------------------------------------------------------------------

export function AttendanceTableView({
  table,
  filters,
  records,
  totalRecords,
  loading,
  isError,
  getStatusCount,
  onFilterChange,
  onSearchChange,
  onRemoveFilter,
  onResetFilters,
  onViewRecord,
}) {
  const statusFilterField = useMemo(
    () => TABLE_FILTER_FIELDS.find((field) => field.type === 'status'),
    []
  );
  const toolbarFilterFields = useMemo(
    () => TABLE_FILTER_FIELDS.filter((field) => field.type !== 'status'),
    []
  );

  const activeFilters = useMemo(() => {
    const list = [];
    if (filters.state.name) {
      list.push({ key: 'name', label: 'Search', value: filters.state.name });
    }
    if (filters.state.status !== 'all') {
      list.push({
        key: 'status',
        type: 'status',
        label: 'Status',
        value: filters.state.status,
        options: PUNCTUALITY_STATUS_OPTIONS,
      });
    }
    if (filters.state.dateRange.startDate || filters.state.dateRange.endDate) {
      const dateRangeField = TABLE_FILTER_FIELDS.find((field) => field.type === 'dateRange');
      list.push({
        key: 'dateRange',
        type: 'dateRange',
        label: 'Dates',
        value: filters.state.dateRange,
        displayFormat: dateRangeField?.displayFormat,
      });
    }
    return list;
  }, [filters.state]);

  const notFound = !loading && !records.length;

  return (
    <Card>
      <StatusTabsFilterWrapper
        filterField={statusFilterField}
        value={filters.state.status}
        onChange={onFilterChange}
        getCount={getStatusCount}
      />

      <FlexibleTableToolbar
        filterFields={toolbarFilterFields}
        filterValues={filters.state}
        onFilterChange={onFilterChange}
        onSearchChange={onSearchChange}
      />

      {!!activeFilters.length && (
        <FlexibleTableFiltersResult
          activeFilters={activeFilters}
          totalResults={records.length}
          onResetFilters={onResetFilters}
          onRemoveFilter={onRemoveFilter}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}

      <TableContainer>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'}>
            <TableHeadCustom headLabel={TABLE_HEAD} />

            <TableBody>
              {loading ? (
                <TableBodySkeleton
                  rowCount={table.rowsPerPage}
                  cellCount={TABLE_HEAD.length}
                />
              ) : (
                records.map((row, index) => (
                  <AttendanceTableRow
                    key={row._id || row.id || index}
                    row={row}
                    serialNumber={table.page * table.rowsPerPage + index + 1}
                    onViewRow={onViewRecord}
                  />
                ))
              )}

              <TableNoData
                notFound={notFound}
                title={isError ? 'Unable to load attendance records' : 'No attendance records found'}
              />
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
