import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableBodySkeleton, TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';
import { TeamDevelopmentTabs } from 'src/components/team-development-tabs';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';
import { exportToCSV, exportToPDF } from 'src/utils/export-helper';
import { fDateTime } from 'src/utils/format-time';
import { DataUsageSummaryCard } from 'src/sections/data-usage/data-usage-summary-card';
import {
  useGetAppSupervisionsQuery,
  useGetSupervisionsQuery,
} from 'src/store/Reducer/supervision-api';

import LogSessionDialog from '../log-session-dialog';
import { CompleteSupervisionDialog } from '../complete-supervision-dialog';
import { SessionSignOffDialog } from '../../common/session-sign-off-dialog';
import SupervisionTableRow, { getRowStatus } from '../supervision-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 50 },
  { id: 'staff', label: 'Staff member' },
  { id: 'createdAt', label: 'Created at' },
  { id: 'last', label: 'Last session' },
  { id: 'scheduledAt', label: 'Scheduled at' },
  { id: 'status', label: 'Status', align: 'center' },
  { id: 'actions', label: 'Actions', align: 'center' },
];

const SUPERVISION_STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled', color: 'info' },
  { value: 'completed', label: 'Completed', color: 'success' },
];

const STAFF_SUPERVISION_STATUS_OPTIONS = [
  ...SUPERVISION_STATUS_OPTIONS,
  { value: 'cancelled', label: 'Cancelled', color: 'default' },
];

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...SUPERVISION_STATUS_OPTIONS];

const FILTER_FIELDS = [
  createFilterField.status({
    options: STATUS_OPTIONS,
    showCounts: true,
  }),
  createFilterField.search({
    placeholder: 'Search staff member...',
  }),
];

// ----------------------------------------------------------------------

function SupervisionListView({
  dashboardHref: dashboardHrefProp,
  heading = 'Supervision',
  showTabs = true,
  branchId: branchIdProp,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { organizationId, user } = useCurrentOrganization();
  const isStaffRoute = pathname.startsWith(`${paths.staff.root}/`);
  const isStaffRole = user?.access?.memberships?.[0]?.role?.toLowerCase() === 'staff';
  const isStaffView = isStaffRoute;
  const currentStaffId = [
    typeof user?.staffId === 'object' ? user.staffId?._id || user.staffId?.id : user?.staffId,
    user?.basicInfo?._id,
    user?.id,
  ].find(Boolean);
  const dashboardHref =
    dashboardHrefProp ||
    (isStaffRoute
      ? paths.staff.dashboard
      : paths.lineManager.root);
  const userBranchId = branchIdProp || user?.branchId?._id || user?.branchId;

  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });

  const logModal = useBoolean();
  const completeModal = useBoolean();
  const signOffModal = useBoolean();
  const filters = useSetState({ name: '', status: 'all' });
  const [selectedRow, setSelectedRow] = useState(null);

  const keyword = useDebounce(filters.state.name, 500);
  const trimmedKeyword = keyword.trim();

  const staffSupervisionsQuery = useGetAppSupervisionsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      search: trimmedKeyword || undefined,
      status: filters.state.status !== 'all' ? filters.state.status : undefined,
      cacheUserId: currentStaffId,
    },
    { skip: !isStaffView || !isStaffRole || !currentStaffId || !organizationId }
  );

  const organizationSupervisionsQuery = useGetSupervisionsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(isStaffView && currentStaffId ? { staffId: currentStaffId } : {}),
      ...(userBranchId ? { branchId: userBranchId } : {}),
      ...(trimmedKeyword ? { search: trimmedKeyword, keyword: trimmedKeyword } : {}),
      ...(filters.state.status !== 'all' ? { status: filters.state.status } : {}),
    },
    { skip: isStaffView || !organizationId }
  );

  const liveData = isStaffView
    ? staffSupervisionsQuery.currentData
    : organizationSupervisionsQuery.data;
  const isLoading = isStaffView
    ? staffSupervisionsQuery.isLoading
    : organizationSupervisionsQuery.isLoading;
  const isFetching = isStaffView
    ? staffSupervisionsQuery.isFetching
    : organizationSupervisionsQuery.isFetching;
  const isError = isStaffView ? staffSupervisionsQuery.isError : organizationSupervisionsQuery.isError;
  const error = isStaffView ? staffSupervisionsQuery.error : organizationSupervisionsQuery.error;
  const refetch = isStaffView ? staffSupervisionsQuery.refetch : organizationSupervisionsQuery.refetch;

  const rawList = useMemo(() => {
    if (Array.isArray(liveData)) return liveData;
    if (Array.isArray(liveData?.data)) return liveData.data;
    return [];
  }, [liveData]);

  const counts = liveData?.meta?.counts ?? {};
  const compliance = liveData?.meta?.compliance;
  const totalRecords = liveData?.meta?.totalRecords ?? liveData?.total ?? rawList.length;

  const handleOpenLog = (row) => {
    setSelectedRow(row);
    logModal.onTrue();
  };

  const handleOpenComplete = (row) => {
    setSelectedRow(row);
    completeModal.onTrue();
  };

  const handleOpenSignOff = (row) => {
    const rowId = row?._id || row?.id || row?.staffId;
    let signOffPath = paths.lineManager.supervisionSignOff(rowId);
    if (pathname.startsWith('/site-manager')) {
      signOffPath = paths.siteManager.supervisionSignOff(rowId);
    } else if (pathname.startsWith('/owner-dashboard')) {
      signOffPath = paths.owner.supervisionSignOff(rowId);
    }
    router.push(signOffPath);
  };

  const handleSaveSession = () => {
    refetch();
    logModal.onFalse();
    setSelectedRow(null);
  };

  const handleSaveComplete = () => {
    refetch();
    completeModal.onFalse();
    setSelectedRow(null);
  };

  const statusFilterField = useMemo(
    () =>
      createFilterField.status({
        options: isStaffView
          ? [{ value: 'all', label: 'All' }, ...STAFF_SUPERVISION_STATUS_OPTIONS]
          : STATUS_OPTIONS,
        showCounts: true,
      }),
    [isStaffView]
  );
  const toolbarFilterFields = useMemo(() => {
    const fields = FILTER_FIELDS.filter((field) => field.type !== 'status');
    return isStaffView
      ? fields.map((field) =>
          field.type === 'search' ? { ...field, placeholder: 'Search supervisions...' } : field
        )
      : fields;
  }, [isStaffView]);

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

  const countableStatusOptions = isStaffView
    ? STAFF_SUPERVISION_STATUS_OPTIONS
    : SUPERVISION_STATUS_OPTIONS;

  const filteredRows = useMemo(() => {
    if (isStaffView) return rawList;

    return rawList.filter((row) => {
      const matchesStatus =
        filters.state.status === 'all' || getRowStatus(row) === filters.state.status;
      const searchText = [
        row.name,
        row.staff?.name,
        row.staff?.email,
        row.staff?.employeeCode,
        row.conductedBy,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      const matchesSearch =
        !trimmedKeyword || searchText.includes(trimmedKeyword.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [rawList, filters.state.status, trimmedKeyword, isStaffView]);

  const effectiveTotal = useMemo(() => {
    if (isStaffView) return Number(totalRecords) || filteredRows.length;

    if (filters.state.status === 'all') {
      const sumFromCounts = countableStatusOptions.reduce(
        (sum, opt) => sum + (Number(counts[opt.value]) || 0),
        0
      );
      return sumFromCounts || totalRecords;
    }
    return typeof counts[filters.state.status] === 'number'
      ? counts[filters.state.status]
      : filteredRows.length;
  }, [
    isStaffView,
    filters.state.status,
    counts,
    totalRecords,
    filteredRows.length,
    countableStatusOptions,
  ]);

  const getStatusCount = useCallback(
    (statusValue) => {
      if (statusValue === 'all') {
        const sumFromCounts = countableStatusOptions.reduce(
          (sum, opt) => sum + (Number(counts[opt.value]) || 0),
          0
        );
        return sumFromCounts || totalRecords;
      }
      return counts[statusValue] ?? 0;
    },
    [counts, totalRecords, countableStatusOptions]
  );

  const canReset = !!filters.state.name || filters.state.status !== 'all';

  const handleExportCSV = useCallback(() => {
    const exportData = filteredRows.map((row) => ({
      Name: row.name || row.staff?.name,
      'Employee Code': row.employeeCode || row.staff?.employeeCode,
      Email: row.email || row.staff?.email,
      'Created At': row.createdAt ? fDateTime(row.createdAt) : '—',
      'Last Session': row.completedAt || row.lastCompletedAt || row.lastSession || '—',
      'Scheduled At': row.scheduledAt ? fDateTime(row.scheduledAt) : (row.nextDueAt || row.upcoming?.scheduledAt || row.nextDue || '—'),
      Status: getRowStatus(row),
    }));
    exportToCSV(exportData, 'supervision-sessions-report.csv');
  }, [filteredRows]);

  const handleExportPDF = useCallback(() => {
    const columns = [
      { id: 'name', label: 'Staff Member' },
      { id: 'createdAt', label: 'Created At' },
      { id: 'lastSession', label: 'Last Session' },
      { id: 'scheduledAt', label: 'Scheduled At' },
      { id: 'status', label: 'Status' },
    ];
    const mapped = filteredRows.map((r) => ({
      ...r,
      name: r.name || r.staff?.name || '—',
      createdAt: r.createdAt ? fDateTime(r.createdAt) : '—',
      lastSession: r.completedAt || r.lastCompletedAt || r.lastSession || '—',
      scheduledAt: r.scheduledAt ? fDateTime(r.scheduledAt) : (r.nextDueAt || r.upcoming?.scheduledAt || r.nextDue || '—'),
      status: getRowStatus(r),
    }));
    exportToPDF('Supervision Sessions Report', columns, mapped);
  }, [filteredRows]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={heading}
        links={[
          { name: 'Dashboard', href: dashboardHref },
          { name: 'Supervision' },
        ]}
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
            {!isStaffView && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="solar:calendar-add-bold" />}
                onClick={() => handleOpenLog(null)}
              >
                Book supervision
              </Button>
            )}
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="solar:export-bold" />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="solar:printer-bold" />}
              onClick={handleExportPDF}
            >
              Export PDF
            </Button>
          </Stack>
        }
        sx={{ mb: 3 }}
      />

      {isStaffView && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <DataUsageSummaryCard
              title="Score"
              total={compliance?.score != null ? `${compliance.score}%` : '—'}
              color="success"
              icon="solar:shield-check-bold-duotone"
              loading={isStaffView && (isLoading || isFetching)}
              sx={{ minHeight: 124 }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <DataUsageSummaryCard
              title="Completed"
              total={compliance?.completed ?? '—'}
              color="info"
              icon="solar:check-circle-bold-duotone"
              loading={isStaffView && (isLoading || isFetching)}
              sx={{ minHeight: 124 }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <DataUsageSummaryCard
              title="Expected"
              total={compliance?.expected ?? '—'}
              color="warning"
              icon="solar:target-bold-duotone"
              loading={isStaffView && (isLoading || isFetching)}
              sx={{ minHeight: 124 }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <DataUsageSummaryCard
              title="Months employed"
              total={compliance?.monthsEmployed ?? '—'}
              color="primary"
              icon="solar:calendar-bold-duotone"
              loading={isStaffView && (isLoading || isFetching)}
              sx={{ minHeight: 124 }}
            />
          </Grid>
        </Grid>
      )}

      <Card>
        {isStaffView && (!isStaffRole || !currentStaffId) && (
          <Alert severity="error" sx={{ m: 2 }}>
            {!isStaffRole
              ? 'Your account is not associated with a staff membership.'
              : 'Could not determine your staff profile. Contact your administrator.'}
          </Alert>
        )}
        {isError && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error?.data?.message || error?.error || 'Failed to load supervision sessions.'}
          </Alert>
        )}

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

        <Box sx={{ position: 'relative' }}>
          <TableContainer>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  headLabel={isStaffView ? TABLE_HEAD.filter((column) => column.id !== 'actions') : TABLE_HEAD}
                />

                <TableBody>
                  {isLoading || isFetching ? (
                    [...Array(table.rowsPerPage)].map((_, rowIndex) => (
                      <TableRow key={`supervision-skeleton-${rowIndex}`}>
                        {/* Sr# */}
                        <TableCell sx={{ py: table.dense ? 0.8 : 1.5 }}>
                          <Skeleton variant="rounded" height={table.dense ? 16 : 18} width={24} />
                        </TableCell>
                        {/* Staff member */}
                        <TableCell sx={{ py: table.dense ? 0.8 : 1.5 }}>
                          <Stack spacing={0.5}>
                            <Skeleton variant="rounded" height={table.dense ? 16 : 18} width={140} />
                            <Skeleton variant="rounded" height={12} width={180} />
                          </Stack>
                        </TableCell>
                        {/* Created at */}
                        <TableCell sx={{ py: table.dense ? 0.8 : 1.5 }}>
                          <Skeleton variant="rounded" height={table.dense ? 16 : 18} width={110} />
                        </TableCell>
                        {/* Last session */}
                        <TableCell sx={{ py: table.dense ? 0.8 : 1.5 }}>
                          <Skeleton variant="rounded" height={table.dense ? 16 : 18} width={100} />
                        </TableCell>
                        {/* Scheduled at */}
                        <TableCell sx={{ py: table.dense ? 0.8 : 1.5 }}>
                          <Skeleton variant="rounded" height={table.dense ? 16 : 18} width={110} />
                        </TableCell>
                        {/* Status */}
                        <TableCell align="center" sx={{ py: table.dense ? 0.8 : 1.5 }}>
                          <Skeleton
                            variant="rounded"
                            height={24}
                            width={80}
                            sx={{ borderRadius: 1, mx: 'auto' }}
                          />
                        </TableCell>
                        {!isStaffView && (
                          <TableCell align="center" sx={{ py: table.dense ? 0.8 : 1.5 }}>
                            <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                              <Skeleton variant="circular" width={28} height={28} />
                              <Skeleton variant="circular" width={28} height={28} />
                            </Stack>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <>
                      {filteredRows.map((row, index) => (
                        <SupervisionTableRow
                          key={row._id || row.id || row.staffId || index}
                          serialNumber={table.page * table.rowsPerPage + index + 1}
                          row={row}
                          onLog={() => handleOpenLog(row)}
                          onComplete={() => handleOpenComplete(row)}
                          onSignOff={() => handleOpenSignOff(row)}
                          readOnly={isStaffView}
                        />
                      ))}

                      <TableNoData notFound={!filteredRows.length} title="No supervision sessions found" />
                    </>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
        </Box>

        <TablePaginationCustom
          page={table.page}
          count={effectiveTotal}
          dense={table.dense}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          onChangeDense={table.onChangeDense}
        />
      </Card>

      {!isStaffView && (
        <>
          <LogSessionDialog
            open={logModal.value}
            row={selectedRow}
            organizationId={organizationId}
            onClose={() => {
              logModal.onFalse();
              setSelectedRow(null);
            }}
            onSave={handleSaveSession}
          />

          <CompleteSupervisionDialog
            open={completeModal.value}
            row={selectedRow}
            organizationId={organizationId}
            onClose={() => {
              completeModal.onFalse();
              setSelectedRow(null);
            }}
            onSave={handleSaveComplete}
          />

          <SessionSignOffDialog
            open={signOffModal.value}
            session={selectedRow}
            organizationId={organizationId}
            type="supervision"
            onClose={() => {
              signOffModal.onFalse();
              setSelectedRow(null);
            }}
            onSave={() => {
              refetch();
              signOffModal.onFalse();
              setSelectedRow(null);
            }}
            readOnly={Boolean(selectedRow?.signedOff || selectedRow?.signature)}
          />
        </>
      )}
    </DashboardContent>
  );
}

SupervisionListView.propTypes = {
  dashboardHref: PropTypes.string,
  heading: PropTypes.string,
  showTabs: PropTypes.bool,
  branchId: PropTypes.string,
};

export { SupervisionListView };
export default SupervisionListView;