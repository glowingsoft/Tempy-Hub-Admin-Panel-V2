import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

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
import { UserTableFiltersResult } from 'src/sections/user/user-table-filters-result';
import { useGetSupervisionsQuery } from 'src/store/Reducer/supervision-api';

import LogSessionDialog from '../log-session-dialog';
import SupervisionTableRow, { getRowStatus } from '../supervision-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 50 },
  { id: 'staff', label: 'Staff member' },
  { id: 'last', label: 'Last session' },
  { id: 'next', label: 'Next due' },
  { id: 'status', label: 'Status', align: 'center' },
  { id: 'actions', label: 'Actions', align: 'center' },
];

const SUPERVISION_STATUS_OPTIONS = [
  { value: 'notYetDue', label: 'Not yet due', color: 'success' },
  { value: 'scheduled', label: 'Scheduled', color: 'info' },
  { value: 'due_soon', label: 'Due soon', color: 'warning' },
  { value: 'overdue', label: 'Overdue', color: 'error' },
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

function SupervisionListView() {
  const { organizationId, user } = useCurrentOrganization();
  const userBranchId = user?.branchId?._id || user?.branchId;

  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });

  const logModal = useBoolean();
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
    },
    { skip: !organizationId }
  );

  const rawList = useMemo(() => {
    if (Array.isArray(liveData)) return liveData;
    if (Array.isArray(liveData?.data)) return liveData.data;
    return [];
  }, [liveData]);

  const totalRecords = liveData?.meta?.totalRecords ?? liveData?.total ?? rawList.length;

  const handleOpenLog = (row) => {
    setSelectedRow(row);
    logModal.onTrue();
  };

  const handleSaveSession = () => {
    refetch();
    logModal.onFalse();
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

  const filteredRows = useMemo(() => {
    if (filters.state.status === 'all') return rawList;
    return rawList.filter((row) => {
      const rowStatus = getRowStatus(row);
      return rowStatus === filters.state.status;
    });
  }, [rawList, filters.state.status]);

  const getStatusCount = useCallback(
    (statusValue) => {
      if (statusValue === 'all') return rawList.length;
      return rawList.filter((row) => getRowStatus(row) === statusValue).length;
    },
    [rawList]
  );

  const canReset = !!filters.state.name || filters.state.status !== 'all';

  const handleExportCSV = useCallback(() => {
    const exportData = filteredRows.map((row) => ({
      Name: row.name,
      'Employee Code': row.employeeCode,
      Email: row.email,
      'Last Session': row.lastCompletedAt || row.lastSession || '—',
      'Next Due': row.nextDueAt || row.upcoming?.scheduledAt || row.nextDue || '—',
      Status: getRowStatus(row),
    }));
    exportToCSV(exportData, 'supervision-sessions-report.csv');
  }, [filteredRows]);

  const handleExportPDF = useCallback(() => {
    const columns = [
      { id: 'name', label: 'Staff Member' },
      { id: 'employeeCode', label: 'Employee Code' },
      { id: 'lastSession', label: 'Last Session' },
      { id: 'nextDue', label: 'Next Due' },
      { id: 'status', label: 'Status' },
    ];
    const mapped = filteredRows.map((r) => ({
      ...r,
      lastSession: r.lastCompletedAt || r.lastSession || '—',
      nextDue: r.nextDueAt || r.upcoming?.scheduledAt || r.nextDue || '—',
      status: getRowStatus(r),
    }));
    exportToPDF('Supervision Sessions Report', columns, mapped);
  }, [filteredRows]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Supervision Sessions"
        links={[
          { name: 'Dashboard', href: paths.lineManager.root },
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
              Book session
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

      <TeamDevelopmentTabs />

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

        {canReset && (
          <UserTableFiltersResult
            filters={filters}
            totalResults={filteredRows.length}
            onResetPage={table.onResetPage}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <Box sx={{ position: 'relative' }}>
          <TableContainer>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom headLabel={TABLE_HEAD} />

                <TableBody>
                  {isLoading || isFetching ? (
                    <TableBodySkeleton
                      rowCount={table.rowsPerPage}
                      cellCount={TABLE_HEAD.length}
                      dense={table.dense}
                    />
                  ) : (
                    <>
                      {filteredRows.map((row, index) => (
                        <SupervisionTableRow
                          key={row.staffId || row._id || row.id || index}
                          serialNumber={table.page * table.rowsPerPage + index + 1}
                          row={row}
                          onLog={() => handleOpenLog(row)}
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
          count={totalRecords}
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
    </DashboardContent>
  );
}

export default SupervisionListView;