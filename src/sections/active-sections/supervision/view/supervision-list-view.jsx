import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';

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
import { exportToCSV, exportToPDF } from 'src/utils/export-helper';
import { useGetSupervisionsQuery } from 'src/store/Reducer/supervision-api';

import LogSessionDialog from '../log-session-dialog';
import { CompleteSupervisionDialog } from '../complete-supervision-dialog';
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
  dashboardHref = paths.lineManager.root,
  heading = 'Supervision',
  showTabs = true,
  branchId: branchIdProp,
}) {
  const { organizationId, user } = useCurrentOrganization();
  const userBranchId = branchIdProp || user?.branchId?._id || user?.branchId;

  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });

  const logModal = useBoolean();
  const completeModal = useBoolean();
  const filters = useSetState({ name: '', status: 'all' });
  const [selectedRow, setSelectedRow] = useState(null);

  const keyword = useDebounce(filters.state.name, 500);
  const trimmedKeyword = keyword.trim();

  const {
    data: liveData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetSupervisionsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(userBranchId ? { branchId: userBranchId } : {}),
      ...(trimmedKeyword ? { search: trimmedKeyword, keyword: trimmedKeyword } : {}),
      ...(filters.state.status !== 'all' ? { status: filters.state.status } : {}),
    },
    { skip: !organizationId }
  );

  const rawList = useMemo(() => {
    if (Array.isArray(liveData)) return liveData;
    if (Array.isArray(liveData?.data)) return liveData.data;
    return [];
  }, [liveData]);

  const counts = liveData?.meta?.counts ?? {};
  const totalRecords = liveData?.meta?.totalRecords ?? liveData?.total ?? rawList.length;

  const handleOpenLog = (row) => {
    setSelectedRow(row);
    logModal.onTrue();
  };

  const handleOpenComplete = (row) => {
    setSelectedRow(row);
    completeModal.onTrue();
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

  // Server already filters by status when status !== 'all', but fallback client-side if status is missing in server response
  const filteredRows = useMemo(() => {
    if (filters.state.status === 'all') return rawList;
    return rawList.filter((row) => {
      const rowStatus = getRowStatus(row);
      // If server already filtered it, or status matches
      return rowStatus === filters.state.status;
    });
  }, [rawList, filters.state.status]);

  const effectiveTotal = useMemo(() => {
    if (filters.state.status === 'all') {
      const sumFromCounts = Object.values(counts).reduce(
        (sum, val) => sum + (Number(val) || 0),
        0
      );
      return sumFromCounts || totalRecords;
    }
    return typeof counts[filters.state.status] === 'number'
      ? counts[filters.state.status]
      : filteredRows.length;
  }, [filters.state.status, counts, totalRecords, filteredRows.length]);

  const getStatusCount = useCallback(
    (statusValue) => {
      if (statusValue === 'all') {
        const sumFromCounts = Object.values(counts).reduce(
          (sum, val) => sum + (Number(val) || 0),
          0
        );
        return sumFromCounts || totalRecords;
      }
      return counts[statusValue] ?? 0;
    },
    [counts, totalRecords]
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
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:calendar-add-bold" />}
              onClick={() => handleOpenLog(null)}
            >
              Book supervision
            </Button>
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

      {showTabs && <TeamDevelopmentTabs />}

      <Card>
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
                <TableHeadCustom headLabel={TABLE_HEAD} />

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
                        {/* Actions */}
                        <TableCell align="center" sx={{ py: table.dense ? 0.8 : 1.5 }}>
                          <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                            <Skeleton variant="circular" width={28} height={28} />
                            <Skeleton variant="circular" width={28} height={28} />
                          </Stack>
                        </TableCell>
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