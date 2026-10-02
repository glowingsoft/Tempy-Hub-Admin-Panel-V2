import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { TableHeadCustom, TablePaginationCustom, useTable } from 'src/components/table';

import { staffMember } from 'src/sections/staff/mocks/data';
import { mockAttendanceResponse } from 'src/sections/active-sections/team-attendance/mocks/data';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';

import { StaffAttendanceToolbar } from './staff-attendance-toolbar';
import { StaffAttendanceTableRow } from './staff-attendance-table-row';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'onTime', label: 'On time' },
  { value: 'late', label: 'Late' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'absent', label: 'Absent' },
];

const STATUS_FILTER_FIELD = createFilterField.status({
  options: STATUS_OPTIONS,
  showCount: true,
});

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#' },
  { id: 'name', label: 'Name' },
  { id: 'clockIn', label: 'Clock In', align: 'center', minWidth: 150 },
  { id: 'clockOut', label: 'Clock Out', align: 'center', minWidth: 150 },
  { id: 'breakIn', label: 'Break In', align: 'center', minWidth: 150 },
  { id: 'breakOut', label: 'Break Out', align: 'center', minWidth: 150 },
  { id: 'total', label: 'Total', align: 'center', minWidth: 150 },
  { id: 'status', label: 'Status', align: 'center' },
];

const getCurrentMonthRange = () => ({
  startDate: dayjs().startOf('month'),
  endDate: dayjs().endOf('month'),
});

// ----------------------------------------------------------------------

export function StaffAttendanceListView() {
  const table = useTable();
  const { user } = useSelector((state) => state.user);

  const currentMonth = useMemo(getCurrentMonthRange, []);
  const [dateRange, setDateRange] = useState(currentMonth);
  const [draftDateRange, setDraftDateRange] = useState(currentMonth);
  const [statusFilter, setStatusFilter] = useState('all');

  const currentStaffId = useMemo(() => {
    const userIds = [user?.staffId, user?.basicInfo?._id, user?.id].filter(Boolean);
    return (
      userIds.find((id) => mockAttendanceResponse.data.some((record) => record.staffId === id)) ||
      staffMember._id
    );
  }, [user?.basicInfo?._id, user?.id, user?.staffId]);

  const records = useMemo(
    () => mockAttendanceResponse.data.filter((record) => record.staffId === currentStaffId),
    [currentStaffId]
  );

  const dateFilteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const workDate = dayjs(record.workDate);
        return (
          !workDate.isBefore(dateRange.startDate, 'day') &&
          !workDate.isAfter(dateRange.endDate, 'day')
        );
      }),
    [dateRange.endDate, dateRange.startDate, records]
  );

  const filteredRecords = useMemo(
    () =>
      dateFilteredRecords.filter(
        (record) => statusFilter === 'all' || record.punctualityStatus === statusFilter
      ),
    [dateFilteredRecords, statusFilter]
  );

  const getStatusCount = useCallback(
    (status) =>
      dateFilteredRecords.filter((record) => status === 'all' || record.punctualityStatus === status)
        .length,
    [dateFilteredRecords]
  );

  const counts = useMemo(
    () => ({
      onTime: getStatusCount('onTime'),
      late: getStatusCount('late'),
      sick: getStatusCount('sick'),
      absent: getStatusCount('absent'),
    }),
    [getStatusCount]
  );

  const handleApply = useCallback(() => {
    if (!draftDateRange.startDate || !draftDateRange.endDate) return;
    setDateRange(draftDateRange);
    table.onResetPage();
  }, [draftDateRange, table]);

  const handleDateChange = useCallback(
    (key, value) => setDraftDateRange((current) => ({ ...current, [key]: value })),
    []
  );

  const handleStatusChange = useCallback(
    (key, value) => {
      table.onResetPage();
      setStatusFilter(value);
    },
    [table]
  );

  const iconPath = `${import.meta.env.BASE_URL}assets/icons/navbar/ic-calendar.svg`;

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

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="On Time"
            total={counts.onTime}
            color="success"
            icon={iconPath}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary title="Late" total={counts.late} color="warning" icon={iconPath} />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Sick Leave"
            total={counts.sick}
            color="info"
            icon={iconPath}
          />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <CourseWidgetSummary
            title="Absences"
            total={counts.absent}
            color="error"
            icon={iconPath}
          />
        </Grid>
      </Grid>

      <Card>
        <StatusTabsFilterWrapper
          filterField={STATUS_FILTER_FIELD}
          value={statusFilter}
          onChange={handleStatusChange}
          getCount={getStatusCount}
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
                {filteredRecords.map((row, index) => (
                  <StaffAttendanceTableRow
                    key={row._id}
                    row={row}
                    serialNumber={table.page * table.rowsPerPage + index + 1}
                  />
                ))}

                {!filteredRecords.length && <TableRowEmpty />}
              </TableBody>
            </Table>
          </Scrollbar>

          <TablePaginationCustom
            page={table.page}
            count={filteredRecords.length}
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

// ----------------------------------------------------------------------

function TableRowEmpty() {
  return (
    <TableRow>
      <TableCell colSpan={TABLE_HEAD.length}>
        <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
          No attendance records found
        </Typography>
      </TableCell>
    </TableRow>
  );
}
