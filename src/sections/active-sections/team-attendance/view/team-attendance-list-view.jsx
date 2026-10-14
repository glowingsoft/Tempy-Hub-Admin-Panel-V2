import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/config-global';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useTable,
  TableNoData,
  TableSkeleton,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { FlexibleTableFiltersResult } from 'src/components/generic-table/table-filters-result';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { OwnerBranchFilterActions, useOwnerBranchFilter } from 'src/sections/branch/owner-branch-select';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { useTabs } from 'src/hooks/use-tabs';
import { useDebounce } from 'src/hooks/use-debounce';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';

import {
  useGetOrganizationAttendanceQuery,
  extractRecordsArray,
} from 'src/store/Reducer/attendance-api';

import TeamAttendanceTableRow from '../team-attendance-table-row';
import { TeamAttendanceShiftGrid } from '../team-attendance-shift-grid';
import { AttendanceDetailDrawer } from '../attendance-detail-drawer';
import { AttendanceChangeRequestsTable } from '../attendance-change-requests-table';
import { mockAttendanceResponse } from '../mocks/data';
import { getAttendanceSummary } from '../utils';

// ----------------------------------------------------------------------

const icon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

const VIEW_TABS_OPTIONS = [
  { value: 'shift', label: 'Shift view', icon: 'solar:calendar-bold' },
  { value: 'table', label: 'Table', icon: 'solar:list-bold' },
  { value: 'requests', label: 'Change requests', icon: 'solar:clipboard-check-bold' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'onTime', label: 'On time' },
  { value: 'late', label: 'Late' },
];

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'name', label: 'Name', minWidth: 200 },
  { id: 'date', label: 'Date', align: 'center', minWidth: 120 },
  { id: 'clockIn', label: 'Clock In', align: 'center', minWidth: 140 },
  { id: 'clockOut', label: 'Clock Out', align: 'center', minWidth: 140 },
  { id: 'breakIn', label: 'Break In', align: 'center', minWidth: 130 },
  { id: 'breakOut', label: 'Break Out', align: 'center', minWidth: 130 },
  { id: 'total', label: 'Total', align: 'center', minWidth: 120 },
  { id: 'status', label: 'Status', align: 'center', minWidth: 110 },
  { id: 'actions', label: '', width: 60, align: 'right' },
];

const FILTER_FIELDS = [
  createFilterField.status({
    options: STATUS_OPTIONS,
    showCount: true,
  }),
  createFilterField.search({
    placeholder: 'Search staff name or email...',
  }),
  createFilterField.dateRange({ key: 'dateRange' }),
];

const WEEK_RANGE_FILTER_FIELDS = [createFilterField.dateRange({ key: 'dateRange' })];

const isWithinRange = (workDate, startDate, endDate) => {
  if (!workDate) return false;
  const date = dayjs(workDate);
  if (startDate && date.isBefore(startDate, 'day')) return false;
  if (endDate && date.isAfter(endDate, 'day')) return false;
  return true;
};

// ----------------------------------------------------------------------

export function TeamAttendanceListView({ ownerDashboard = false }) {
  const table = useTable();
  const tabs = useTabs('shift');

  const { organizationId } = useCurrentOrganization();
  const { branchId, onBranchChange } = useOwnerBranchFilter();

  const detailDrawer = useBoolean();
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [fallbackRecord, setFallbackRecord] = useState(null);

  const filters = useSetState({
    name: '',
    status: 'all',
    dateRange: { startDate: null, endDate: null },
  });

  const debouncedSearch = useDebounce(filters.state.name, 400);

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
  } = useGetOrganizationAttendanceQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      status: filters.state.status,
      search: debouncedSearch || undefined,
      branchId: branchId !== 'all' ? branchId : undefined,
      startDate: filters.state.dateRange?.startDate
        ? dayjs(filters.state.dateRange.startDate).format('YYYY-MM-DD')
        : undefined,
      endDate: filters.state.dateRange?.endDate
        ? dayjs(filters.state.dateRange.endDate).format('YYYY-MM-DD')
        : undefined,
    },
    { skip: !organizationId }
  );

  const rawRecords = useMemo(() => {
    const list = extractRecordsArray(apiResponse?.data ?? apiResponse);
    if (Array.isArray(list) && list.length > 0) return list;
    if (!organizationId || (!apiResponse && !isError)) {
      return Array.isArray(mockAttendanceResponse?.data) ? mockAttendanceResponse.data : [];
    }
    return Array.isArray(list) ? list : [];
  }, [apiResponse, isError, organizationId]);

  const totalRecords =
    apiResponse?.meta?.totalRecords ?? (Array.isArray(rawRecords) ? rawRecords.length : 0);

  const earliestWorkDate = useMemo(() => {
    if (!Array.isArray(rawRecords) || !rawRecords.length) return dayjs();
    const dates = rawRecords
      .map((record) => dayjs(record?.workDate))
      .filter((d) => d.isValid())
      .sort((a, b) => a.valueOf() - b.valueOf());
    return dates[0] || dayjs();
  }, [rawRecords]);

  const [weekRange, setWeekRange] = useState(() => ({
    startDate: dayjs().startOf('week'),
    endDate: dayjs().startOf('week').add(6, 'day'),
  }));

  const scopedRecords = useMemo(() => {
    if (!Array.isArray(rawRecords)) return [];
    return rawRecords.filter(
      (record) => !ownerDashboard || branchId === 'all' || record?.branchId === branchId
    );
  }, [branchId, ownerDashboard, rawRecords]);

  const summary = useMemo(() => getAttendanceSummary(scopedRecords), [scopedRecords]);

  const shiftRecords = useMemo(
    () =>
      scopedRecords.filter((record) =>
        isWithinRange(record?.workDate, weekRange.startDate, weekRange.endDate)
      ),
    [scopedRecords, weekRange]
  );

  const handleWeekRangeChange = useCallback(
    (key, value) => {
      const startChanged =
        value.startDate && !dayjs(value.startDate).isSame(weekRange.startDate, 'day');

      setWeekRange(
        startChanged
          ? { startDate: value.startDate, endDate: dayjs(value.startDate).add(6, 'day') }
          : { startDate: dayjs(value.endDate).subtract(6, 'day'), endDate: value.endDate }
      );
    },
    [weekRange.startDate]
  );

  const getStatusCount = useCallback(
    (status) => {
      if (!Array.isArray(scopedRecords)) return 0;
      return scopedRecords.filter(
        (record) => status === 'all' || record?.punctualityStatus === status
      ).length;
    },
    [scopedRecords]
  );

  const statusFilterField = useMemo(() => FILTER_FIELDS.find((f) => f.type === 'status'), []);
  const toolbarFilterFields = useMemo(() => FILTER_FIELDS.filter((f) => f.type !== 'status'), []);

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
      filters.setState({ name: event.target.value });
    },
    [filters, table]
  );

  const filteredRecords = useMemo(() => {
    const search = filters.state.name?.trim().toLowerCase() || '';
    const { startDate, endDate } = filters.state.dateRange;
    if (!Array.isArray(scopedRecords)) return [];

    return scopedRecords.filter((record) => {
      const matchesStatus =
        filters.state.status === 'all' || record?.punctualityStatus === filters.state.status;
      const matchesName =
        !search ||
        record?.staff?.name?.toLowerCase().includes(search) ||
        record?.staff?.email?.toLowerCase().includes(search);
      const matchesDate = isWithinRange(record?.workDate, startDate, endDate);
      return matchesStatus && matchesName && matchesDate;
    });
  }, [filters.state.name, filters.state.status, filters.state.dateRange, scopedRecords]);

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
        options: STATUS_OPTIONS,
      });
    }
    if (filters.state.dateRange.startDate || filters.state.dateRange.endDate) {
      const dateRangeField = FILTER_FIELDS.find((f) => f.type === 'dateRange');
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

  const canReset = activeFilters.length > 0;

  const handleRemoveFilter = useCallback(
    (key) => {
      table.onResetPage();
      if (key === 'dateRange') {
        filters.setState({ dateRange: { startDate: null, endDate: null } });
      } else if (key === 'status') {
        filters.setState({ status: 'all' });
      } else if (key === 'name') {
        filters.setState({ name: '' });
      }
    },
    [filters, table]
  );

  const handleResetAllFilters = useCallback(() => {
    table.onResetPage();
    filters.setState({ name: '', status: 'all', dateRange: { startDate: null, endDate: null } });
  }, [filters, table]);

  const shiftActiveFilters = useMemo(() => {
    const isDefaultWeek = weekRange.startDate.isSame(earliestWorkDate, 'day');
    if (isDefaultWeek) return [];
    return [
      {
        key: 'dateRange',
        type: 'dateRange',
        label: 'Week',
        value: weekRange,
        displayFormat: WEEK_RANGE_FILTER_FIELDS[0]?.displayFormat,
      },
    ];
  }, [weekRange, earliestWorkDate]);

  const handleResetWeekRange = useCallback(() => {
    setWeekRange({ startDate: earliestWorkDate, endDate: earliestWorkDate.add(6, 'day') });
  }, [earliestWorkDate]);

  const handleViewRecord = useCallback(
    (dayId, record) => {
      setSelectedDayId(dayId);
      setFallbackRecord(record);
      detailDrawer.onTrue();
    },
    [detailDrawer]
  );

  const notFound = !isLoading && !isFetching && !filteredRecords.length;

  return (
    <Box sx={{ px: { xs: 2, md: 6 }, pb: 5, pt: 3, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Attendance"
        links={[
          {
            name: 'Dashboard',
            href: ownerDashboard ? paths.owner.root : paths.lineManager.root,
          },
          { name: 'Attendance' },
        ]}
        action={
          ownerDashboard ? (
            <OwnerBranchFilterActions value={branchId} onChange={onBranchChange}>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="solar:export-bold" />}
                onClick={() => {}}
              >
                Export to CSV
              </Button>
            </OwnerBranchFilterActions>
          ) : (
            <Button
              variant="outlined"
              startIcon={<Iconify icon="solar:export-bold" />}
              onClick={() => {}}
            >
              Export to CSV
            </Button>
          )
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid xs={12} sm={4}>
          <CourseWidgetSummary
            title="On time"
            total={summary.onTime}
            color="success"
            icon={icon('ic-check')}
          />
        </Grid>

        <Grid xs={12} sm={4}>
          <CourseWidgetSummary
            title="Late"
            total={summary.late}
            color="warning"
            icon={icon('ic-clock')}
          />
        </Grid>

        <Grid xs={12} sm={4}>
          <CourseWidgetSummary
            title="Attendance rate"
            total={summary.attendanceRate === null ? '—' : `${summary.attendanceRate}%`}
            color="info"
            icon={icon('ic-analytics')}
          />
        </Grid>
      </Grid>

      <CustomTabs
        value={tabs.value}
        onChange={tabs.onChange}
        sx={{ mb: 2, borderRadius: 1, maxWidth: 460 }}
      >
        {VIEW_TABS_OPTIONS.map((tab) => (
          <Tab
            key={tab.value}
            value={tab.value}
            label={tab.label}
            icon={<Iconify icon={tab.icon} width={18} />}
            iconPosition="start"
          />
        ))}
      </CustomTabs>

      {tabs.value === 'shift' && (
        <Card>
          <FlexibleTableToolbar
            filterFields={WEEK_RANGE_FILTER_FIELDS}
            filterValues={{ dateRange: weekRange }}
            onFilterChange={handleWeekRangeChange}
          />

          {!!shiftActiveFilters.length && (
            <FlexibleTableFiltersResult
              activeFilters={shiftActiveFilters}
              totalResults={shiftRecords.length}
              onResetFilters={handleResetWeekRange}
              onRemoveFilter={handleResetWeekRange}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TeamAttendanceShiftGrid
            records={shiftRecords}
            onViewRecord={handleViewRecord}
          />
        </Card>
      )}

      {tabs.value === 'table' && (
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

          {canReset && (
            <FlexibleTableFiltersResult
              activeFilters={activeFilters}
              totalResults={filteredRecords.length}
              onResetFilters={handleResetAllFilters}
              onRemoveFilter={handleRemoveFilter}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'}>
                <TableHeadCustom headLabel={TABLE_HEAD} />

                <TableBody>
                  {isLoading || isFetching ? (
                    [...Array(table.rowsPerPage || 5)].map((_, i) => (
                      <TableSkeleton key={i} />
                    ))
                  ) : (
                    filteredRecords.map((row, index) => (
                      <TeamAttendanceTableRow
                        key={row._id || row.id || index}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                        onViewRow={handleViewRecord}
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
      )}

      {tabs.value === 'requests' && (
        <AttendanceChangeRequestsTable organizationId={organizationId} />
      )}

      <AttendanceDetailDrawer
        open={detailDrawer.value}
        onClose={detailDrawer.onFalse}
        attendanceDayId={selectedDayId}
        fallbackRecord={fallbackRecord}
      />
    </Box>
  );
}

export const TableInfo = ({ icon: iconName, color, value }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
      minWidth: 90,
    }}
  >
    <Label color={color} sx={{ borderRadius: 1 }}>
      <Iconify icon={iconName} width={16} />
    </Label>

    <Typography variant="body2">{value}</Typography>
  </Box>
);