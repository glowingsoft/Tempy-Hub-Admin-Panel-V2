import { useCallback, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { toast } from 'src/components/snackbar';
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

import { LEAVE_REQUEST_STATUS_OPTIONS } from 'src/sections/leave-request/mocks/data';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import {
  useCreateStaffLeaveRequestMutation,
  useGetStaffLeaveRequestsQuery,
} from 'src/store/Reducer/leave-requests-api';

import { StaffAddLeaveDialog } from './staff-add-leave-dialog';
import { StaffLeaveRequestTableRow } from './staff-leave-request-table-row';

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
  { id: 'createdAt', label: 'Created', width: 130 },
  { id: 'totalDays', label: 'Days', width: 80, align: 'center' },
  { id: 'reason', label: 'Reason', minWidth: 180 },
  { id: 'status', label: 'Status', width: 120, align: 'center' },
];

const FILTER_FIELDS = [createFilterField.search({ placeholder: 'Search leave type or reason...' })];

// ----------------------------------------------------------------------

export function StaffLeaveRequestListView() {
  const table = useTable({
    defaultDense: true,
    defaultOrderBy: 'createdAt',
    defaultOrder: 'desc',
    defaultRowsPerPage: 10,
  });
  const { organizationId } = useCurrentOrganization();
  const [createStaffLeaveRequest] = useCreateStaffLeaveRequestMutation();

  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const filters = useSetState({ search: '', status: 'all' });
  const keyword = useDebounce(filters.state.search, 400).trim();

  const {
    currentData: leaveRequests,
    isLoading,
    isFetching,
    isError,
  } = useGetStaffLeaveRequestsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      status: filters.state.status,
      keyword,
    },
    { skip: !organizationId }
  );

  const requests = leaveRequests?.requests ?? [];
  const summary = leaveRequests?.summary ?? {};
  const meta = leaveRequests?.meta ?? {};
  const loading = isLoading || isFetching;

  const getStatusCount = (status) =>
    status === 'all' ? Number(meta.totalRecords) || 0 : Number(meta.counts?.[status]) || 0;

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
    async (payload) => {
      if (!organizationId) {
        throw new Error('An organization scope is required to submit a leave request.');
      }

      await createStaffLeaveRequest({
        organizationId,
        ...payload,
      }).unwrap();

      table.onResetPage();
      toast.success('Leave request submitted successfully.');
    },
    [createStaffLeaveRequest, organizationId, table]
  );

  const iconPath = `${import.meta.env.BASE_URL}assets/icons/navbar/ic-calendar.svg`;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Leave Requests"
        links={[{ name: 'Dashboard', href: paths.staff.dashboard }, { name: 'Leave Requests' }]}
        action={
          <Button
            color="primary"
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
        {loading
          ? [0, 1, 2].map((item) => (
              <Grid key={item} xs={12} sm={4}>
                <Skeleton variant="rounded" height={124} sx={{ borderRadius: 2 }} />
              </Grid>
            ))
          : [
              {
                title: 'Remaining Holiday Allowance',
                total: summary.remainingHolidayAllowance,
                color: 'success',
              },
              { title: 'Sick Days Taken', total: summary.sickDaysTaken, color: 'info' },
              { title: 'Time Off (Absent) Days', total: summary.absenceDays, color: 'warning' },
            ].map((item) => (
              <Grid key={item.title} xs={12} sm={4}>
                <CourseWidgetSummary
                  title={item.title}
                  total={Number(item.total) || 0}
                  color={item.color}
                  icon={iconPath}
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

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1000 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {loading ? (
                  <TableBodySkeleton rowCount={table.rowsPerPage} cellCount={TABLE_HEAD.length} />
                ) : isError || !organizationId ? (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length} align="center">
                      <Typography color="error" sx={{ py: 3 }}>
                        {organizationId
                          ? 'Unable to load leave requests.'
                          : 'An organization scope is required to load leave requests.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {requests.map((row, index) => (
                      <StaffLeaveRequestTableRow
                        key={row._id}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                      />
                    ))}
                    <TableNoData notFound={!requests.length} />
                  </>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={Number(meta.totalRecords) || 0}
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
