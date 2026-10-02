import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';

import { LEAVE_REQUEST_STATUS_OPTIONS } from 'src/sections/leave-request/mocks/data';
import { staffLeaveRequests, staffMember } from 'src/sections/staff/mocks/data';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';

import { StaffAddLeaveDialog } from './staff-add-leave-dialog';
import { StaffLeaveRequestTableRow } from './staff-leave-request-table-row';

// ----------------------------------------------------------------------

const TOTAL_ANNUAL_ENTITLEMENT = 28; // Total Annual Holiday Entitlement for the year

// Placeholder formula functions for Sickness and Absent Scores — to be connected to backend formulas
export const calculateSicknessScore = (sickDays, instances = 1) => {
  if (!sickDays) return 0;
  // Formula structure ready (e.g., Bradford Factor: S² × D)
  return instances * instances * sickDays;
};

export const calculateAbsentScore = (absentDays, instances = 1) => {
  if (!absentDays) return 0;
  return instances * instances * absentDays;
};

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  ...LEAVE_REQUEST_STATUS_OPTIONS,
];

const STATUS_FILTER_FIELD = createFilterField.status({
  options: STATUS_OPTIONS,
  showCounts: true,
});

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'leaveType', label: 'Leave Type', minWidth: 160 },
  { id: 'startDate', label: 'Start Date', width: 130 },
  { id: 'endDate', label: 'End Date', width: 130 },
  { id: 'totalDays', label: 'Days', width: 80, align: 'center' },
  { id: 'reason', label: 'Reason', minWidth: 180 },
  { id: 'status', label: 'Status', width: 120, align: 'center' },
  { id: 'createdAt', label: 'Created', width: 130 },
];

const FILTER_FIELDS = [
  createFilterField.search({ placeholder: 'Search leave type or reason...' }),
  createFilterField.select({ key: 'year', label: 'Year', defaultValue: 'all' }),
];

const getStatusCount = (requests, status) =>
  status === 'all'
    ? requests.length
    : requests.filter((request) => request.status === status).length;

// ----------------------------------------------------------------------

export function StaffLeaveRequestListView() {
  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });
  const { user } = useSelector((state) => state.user);

  const [requests, setRequests] = useState(staffLeaveRequests);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const filters = useSetState({ search: '', status: 'all', year: 'all' });
  const keyword = useDebounce(filters.state.search, 400);

  const currentStaffId = useMemo(() => {
    const userIds = [user?.staffId, user?.basicInfo?._id, user?.id].filter(Boolean);
    return (
      userIds.find((id) => requests.some((request) => request.staffId === id)) ||
      staffMember._id
    );
  }, [requests, user?.basicInfo?._id, user?.id, user?.staffId]);

  const years = useMemo(
    () => [
      { value: 'all', label: 'All years' },
      ...Array.from(new Set(requests.map((request) => dayjs(request.startDate).format('YYYY')))).map(
        (value) => ({ value, label: value })
      ),
    ],
    [requests]
  );

  const filterFields = useMemo(
    () =>
      FILTER_FIELDS.map((field) => {
        if (field.key === 'year') return { ...field, options: years };
        return field;
      }),
    [years]
  );

  const scopedRequests = useMemo(
    () => requests.filter((request) => !request.staffId || request.staffId === currentStaffId),
    [currentStaffId, requests]
  );

  const filteredRequests = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    return scopedRequests.filter(
      (request) =>
        (filters.state.status === 'all' || request.status === filters.state.status) &&
        (filters.state.year === 'all' ||
          dayjs(request.startDate).format('YYYY') === filters.state.year) &&
        (!search ||
          request.reason?.toLowerCase().includes(search) ||
          request.leaveType?.toLowerCase().includes(search))
    );
  }, [filters.state.status, filters.state.year, keyword, scopedRequests]);

  const paginatedRequests = useMemo(() => {
    const start = table.page * table.rowsPerPage;
    return filteredRequests.slice(start, start + table.rowsPerPage);
  }, [filteredRequests, table.page, table.rowsPerPage]);

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

  const handleAddLeave = useCallback(
    (payload) => {
      setRequests((current) => [
        {
          ...payload,
          _id: `staff-leave-${Date.now()}`,
          staffId: currentStaffId,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        ...current,
      ]);
      table.onResetPage();
    },
    [currentStaffId, table]
  );

  const currentMonth = dayjs();
  const approvedRequests = scopedRequests.filter((request) => request.status === 'approved');

  const annualHolidayTaken = approvedRequests
    .filter(
      (request) =>
        request.leaveType === 'annual' && dayjs(request.startDate).isSame(currentMonth, 'year')
    )
    .reduce((total, request) => total + (request.totalDays || 0), 0);

  const remainingHoliday = Math.max(0, TOTAL_ANNUAL_ENTITLEMENT - annualHolidayTaken);

  const sickDaysTaken = scopedRequests
    .filter((request) => request.leaveType === 'sick')
    .reduce((total, request) => total + (request.totalDays || 0), 0);
  const sickInstances = scopedRequests.filter((request) => request.leaveType === 'sick').length;
  const sicknessScore = calculateSicknessScore(sickDaysTaken, sickInstances);

  const timeOffAbsentDays = scopedRequests
    .filter(
      (request) =>
        request.leaveType === 'timeoff' ||
        request.leaveType === 'unpaid' ||
        request.leaveType === 'absent'
    )
    .reduce((total, request) => total + (request.totalDays || 0), 0);
  const absentInstances = scopedRequests.filter(
    (request) =>
      request.leaveType === 'timeoff' ||
      request.leaveType === 'unpaid' ||
      request.leaveType === 'absent'
  ).length;
  const absentScore = calculateAbsentScore(timeOffAbsentDays, absentInstances);

  const iconPath = `${import.meta.env.BASE_URL}assets/icons/navbar/ic-calendar.svg`;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Leave Requests"
        links={[{ name: 'Dashboard', href: paths.staff.dashboard }, { name: 'Leave Requests' }]}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={() => setAddDialogOpen(true)}
          >
            Add Leave
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} sm={4}>
          <CourseWidgetSummary
            title="Remaining Holiday Allowance"
            total={remainingHoliday}
            color="success"
            icon={iconPath}
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <CourseWidgetSummary
            title="Sick Days Taken"
            total={sickDaysTaken}
            color="info"
            icon={iconPath}
          />
        </Grid>
        <Grid xs={12} sm={4}>
          <CourseWidgetSummary
            title="Time Off (Absent) Days"
            total={timeOffAbsentDays}
            color="warning"
            icon={iconPath}
          />
        </Grid>
      </Grid>

      <Card>
        <StatusTabsFilterWrapper
          filterField={STATUS_FILTER_FIELD}
          value={filters.state.status}
          onChange={handleFilterChange}
          getCount={(status) => getStatusCount(scopedRequests, status)}
        />

        <FlexibleTableToolbar
          filterFields={filterFields}
          filterValues={filters.state}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1000 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {paginatedRequests.map((row, index) => (
                  <StaffLeaveRequestTableRow
                    key={row._id}
                    row={row}
                    serialNumber={table.page * table.rowsPerPage + index + 1}
                  />
                ))}

                <TableNoData notFound={!paginatedRequests.length} title="No leave requests yet" />
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={filteredRequests.length}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <StaffAddLeaveDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddLeave}
      />
    </DashboardContent>
  );
}
