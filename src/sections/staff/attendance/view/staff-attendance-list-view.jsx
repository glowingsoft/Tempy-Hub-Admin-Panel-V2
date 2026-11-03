import { useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
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

import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { useGetStaffAttendanceQuery } from 'src/store/Reducer/attendance-api';

import { StaffAttendanceToolbar } from './staff-attendance-toolbar';
import { StaffAttendanceTableRow } from './staff-attendance-table-row';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'onTime', label: 'On time', color: 'success' },
  { value: 'late', label: 'Late', color: 'warning' },
  { value: 'unscheduled', label: 'Unscheduled', color: 'info' },
];

const STATUS_FILTER_FIELD = createFilterField.status({
  options: STATUS_OPTIONS,
  showCounts: true,
});

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#' },
  { id: 'name', label: 'Name' },
  { id: 'date', label: 'Date', align: 'center', minWidth: 130 },
  { id: 'site', label: 'Site', align: 'center', minWidth: 130 },
  { id: 'clockIn', label: 'Clock In', align: 'center', minWidth: 150 },
  { id: 'clockOut', label: 'Clock Out', align: 'center', minWidth: 150 },
  { id: 'breakIn', label: 'Break In', align: 'center', minWidth: 150 },
  { id: 'breakOut', label: 'Break Out', align: 'center', minWidth: 150 },
  { id: 'total', label: 'Total', align: 'center', minWidth: 150 },
  { id: 'status', label: 'Status', align: 'center', minWidth: 120 },
];

const FILTER_FIELDS = [createFilterField.search({ placeholder: 'Search attendance...' })];

const SUMMARY_ITEMS = [
  { key: 'onTimeCount', title: 'On Time', color: 'success', icon: 'ic-check' },
  { key: 'lateCount', title: 'Late', color: 'warning', icon: 'ic-clock' },
  { key: 'sickDays', title: 'Sick Leave', color: 'info', icon: 'ic-disabled' },
  { key: 'absenceDays', title: 'Absences', color: 'error', icon: 'ic-reports' },
];

const getCurrentMonthRange = () => ({
  startDate: dayjs().startOf('month'),
  endDate: dayjs().endOf('month'),
});

// ----------------------------------------------------------------------

export function StaffAttendanceListView() {
  const table = useTable({ defaultDense: true, defaultRowsPerPage: 10 });
  const { organizationId } = useCurrentOrganization();

  const currentMonth = useMemo(getCurrentMonthRange, []);
  const [dateRange, setDateRange] = useState(currentMonth);
  const [draftDateRange, setDraftDateRange] = useState(currentMonth);
  const filters = useSetState({ search: '', status: 'all' });
  const keyword = useDebounce(filters.state.search, 400).trim();
  const from = dateRange.startDate ? dayjs(dateRange.startDate).format('YYYY-MM-DD') : undefined;
  const to = dateRange.endDate ? dayjs(dateRange.endDate).format('YYYY-MM-DD') : undefined;

  const {
    data: attendance,
    isLoading,
    isFetching,
    isError,
  } = useGetStaffAttendanceQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      punctualityStatus: filters.state.status,
      keyword,
      from,
      to,
    },
    { skip: !organizationId }
  );

  const records = attendance?.data ?? [];
  const summary = attendance?.summary ?? {};
  const statusCounts = attendance?.meta?.counts ?? {};
  const totalRecords = attendance?.meta?.totalRecords ?? records.length;
  const loading = isLoading || isFetching;

  const handleApply = useCallback(() => {
    if (!draftDateRange.startDate || !draftDateRange.endDate) return;
    setDateRange(draftDateRange);
    table.onResetPage();
  }, [draftDateRange, table]);

  const handleDateChange = useCallback(
    (key, value) => setDraftDateRange((current) => ({ ...current, [key]: value })),
    []
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

  const getStatusCount = useCallback(
    (status) => {
      if (status === 'all') return totalRecords;
      return Number(statusCounts[status]) || 0;
    },
    [statusCounts, totalRecords]
  );

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Attendance"
        links={[{ name: 'Dashboard', href: paths.staff.dashboard }, { name: 'Attendance' }]}
        action={
          <Button
            variant="outlined"
            startIcon={<Iconify icon="solar:download-bold" />}
            onClick={() => {}}
          >
            Download PDF
          </Button>
        }
        sx={{ mb: { xs: 3, md: 4 } }}
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {loading
          ? SUMMARY_ITEMS.map((item) => (
              <Grid key={item.key} xs={12} sm={6} md={3}>
                <Skeleton variant="rounded" height={124} sx={{ borderRadius: 2 }} />
              </Grid>
            ))
          : SUMMARY_ITEMS.map((item) => (
              <Grid key={item.key} xs={12} sm={6} md={3}>
                <CourseWidgetSummary
                  title={item.title}
                  total={Number(summary[item.key]) || 0}
                  color={item.color}
                  icon={`${import.meta.env.BASE_URL}assets/icons/navbar/${item.icon}.svg`}
                />
              </Grid>
            ))}
      </Grid>

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

        <StaffAttendanceToolbar
          startDate={draftDateRange.startDate}
          endDate={draftDateRange.endDate}
          onStartDateChange={(value) => handleDateChange('startDate', value)}
          onEndDateChange={(value) => handleDateChange('endDate', value)}
          onApply={handleApply}
        />

        <TableContainer>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {loading ? (
                  <TableBodySkeleton
                    rowCount={table.rowsPerPage}
                    cellCount={TABLE_HEAD.length}
                    dense={table.dense}
                  />
                ) : (
                  records.map((row, index) => (
                    <StaffAttendanceTableRow
                      key={row._id}
                      row={row}
                      serialNumber={table.page * table.rowsPerPage + index + 1}
                    />
                  ))
                )}

                <TableNoData
                  notFound={!loading && !records.length}
                  title={
                    isError ? 'Unable to load attendance records' : 'No attendance records found'
                  }
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
    </Box>
  );
}
