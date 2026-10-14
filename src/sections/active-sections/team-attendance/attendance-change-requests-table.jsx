import dayjs from 'dayjs';
import { useMemo, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { fDate, fDateTime } from 'src/utils/format-time';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { useSetState } from 'src/hooks/use-set-state';
import {
  useTable,
  TableNoData,
  TableSkeleton,
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
import { mockAttendanceChangeRequestsResponse } from './mocks/data';

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

const formatTime = (value) => (value ? dayjs(value).format('hh:mm A') : '—');

// ----------------------------------------------------------------------

export function AttendanceChangeRequestsTable({ organizationId }) {
  const table = useTable();

  const filters = useSetState({
    search: '',
    status: 'all',
  });

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
  } = useGetAttendanceChangeRequestsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      status: filters.state.status,
    },
    { skip: !organizationId }
  );

  const rawData = useMemo(() => {
    const list = extractRecordsArray(apiResponse?.data ?? apiResponse);
    if (Array.isArray(list) && list.length) return list;
    if (!organizationId || (!apiResponse && !isError)) {
      return Array.isArray(mockAttendanceChangeRequestsResponse?.data)
        ? mockAttendanceChangeRequestsResponse.data
        : [];
    }
    return Array.isArray(list) ? list : [];
  }, [apiResponse, isError, organizationId]);

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

  const filteredRecords = useMemo(() => {
    if (!Array.isArray(rawData)) return [];
    const search = filters.state.search?.trim().toLowerCase() || '';
    return rawData.filter((row) => {
      const matchesStatus =
        filters.state.status === 'all' || row?.status?.toLowerCase() === filters.state.status;
      const matchesSearch =
        !search ||
        row?.staff?.name?.toLowerCase().includes(search) ||
        row?.staff?.email?.toLowerCase().includes(search) ||
        row?.reason?.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [rawData, filters.state.search, filters.state.status]);

  const getStatusCount = useCallback(
    (status) => {
      if (!Array.isArray(rawData)) return 0;
      if (status === 'all') return rawData.length;
      return rawData.filter((row) => row?.status?.toLowerCase() === status).length;
    },
    [rawData]
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

  const notFound = !isLoading && !isFetching && !filteredRecords.length;

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
          totalResults={filteredRecords.length}
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
                [...Array(table.rowsPerPage || 5)].map((_, i) => (
                  <TableSkeleton key={i} />
                ))
              ) : (
                filteredRecords
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row, index) => (
                    <TableRow key={row._id || index} hover>
                      <TableCell>{table.page * table.rowsPerPage + index + 1}</TableCell>

                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 36, height: 36 }}>
                            {row.staff?.name?.charAt(0) || 'U'}
                          </Avatar>
                          <Stack>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {row.staff?.name || 'Unknown'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                              {row.staff?.email || '—'}
                            </Typography>
                          </Stack>
                        </Stack>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2">{fDate(row.workDate)}</Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2">
                          {formatTime(row.originalClockIn)} – {formatTime(row.originalClockOut)}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          {formatTime(row.requestedClockIn)} – {formatTime(row.requestedClockOut)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 260 }} noWrap>
                          {row.reason || '—'}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Label
                          variant="soft"
                          color={
                            (row.status === 'approved' && 'success') ||
                            (row.status === 'rejected' && 'error') ||
                            'warning'
                          }
                          sx={{ textTransform: 'capitalize' }}
                        >
                          {row.status || 'Pending'}
                        </Label>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {row.createdAt ? fDateTime(row.createdAt) : '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
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