import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';

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
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';
import { TeamDevelopmentTabs } from 'src/components/team-development-tabs';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { exportToCSV, exportToPDF } from 'src/utils/export-helper';
import { UserTableFiltersResult } from 'src/sections/user/user-table-filters-result';

import LogSessionDialog from '../log-session-dialog';
import { _teamSupervision, logTeamSupervisionSession } from '../mocks/data';
import SupervisionTableRow from '../supervision-table-row';

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
  { value: 'overdue', label: 'Overdue', color: 'error' },
  { value: 'due_soon', label: 'Due soon', color: 'warning' },
  { value: 'booked', label: 'Booked', color: 'default' },
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
  const { organizationId } = useCurrentOrganization();
  const table = useTable();
  const logModal = useBoolean();
  const filters = useSetState({ name: '', status: 'all' });
  const [selectedRow, setSelectedRow] = useState(null);

  // Bumped after saving a session so the roster row's updated last/next
  // session dates re-render — the mock helper mutates the array in place.
  const [reloadKey, setReloadKey] = useState(0);

  const handleOpenLog = (row) => {
    setSelectedRow(row);
    logModal.onTrue();
  };

  const handleSaveSession = (session) => {
    logTeamSupervisionSession(session.staffId, session);

    const staffRow = _teamSupervision.find((row) => row.id === session.staffId);
    if (staffRow) {
      staffRow.lastSession = dayjs(session.dateHeld).format('YYYY-MM-DD');
      staffRow.nextDue = dayjs(session.nextDue).format('D MMM');
      staffRow.status = 'booked';
      staffRow.overdueDays = undefined;
    }

    setReloadKey((key) => key + 1);
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
    const search = filters.state.name.trim().toLowerCase();
    return _teamSupervision.filter((row) => {
      const matchesSearch = !search || row.name?.toLowerCase().includes(search);
      const matchesStatus = filters.state.status === 'all' || row.status === filters.state.status;
      return matchesSearch && matchesStatus;
    });
  }, [filters.state.name, filters.state.status]);

  const canReset = !!filters.state.name || filters.state.status !== 'all';

  const handleExportCSV = useCallback(() => {
    const exportData = filteredRows.map((row) => ({
      Name: row.name,
      Role: row.role,
      'Last Session': row.lastSession,
      'Next Due': row.nextDue,
      Status: row.status,
    }));
    exportToCSV(exportData, 'supervision-sessions-report.csv');
  }, [filteredRows]);

  const handleExportPDF = useCallback(() => {
    const columns = [
      { id: 'name', label: 'Staff Member' },
      { id: 'lastSession', label: 'Last Session' },
      { id: 'nextDue', label: 'Next Due' },
      { id: 'status', label: 'Status' },
    ];
    exportToPDF('Supervision Sessions Report', columns, filteredRows);
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
          <Stack direction="row" spacing={1}>
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
        <StatusTabsFilterWrapper
          filterField={statusFilterField}
          value={filters.state.status}
          onChange={handleFilterChange}
          getCount={() => filteredRows.length}
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

        <TableContainer>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody key={reloadKey}>
                {filteredRows
                  .slice(table.page * table.rowsPerPage, table.page * table.rowsPerPage + table.rowsPerPage)
                  .map((row, index) => (
                    <SupervisionTableRow
                      key={row.id}
                      serialNumber={table.page * table.rowsPerPage + index + 1}
                      row={row}
                      onLog={() => handleOpenLog(row)}
                    />
                  ))}

                <TableNoData notFound={!filteredRows.length} />
              </TableBody>
            </Table>
          </Scrollbar>

          <TablePaginationCustom
            page={table.page}
            count={filteredRows.length}
            dense={table.dense}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            onChangeDense={table.onChangeDense}
          />
        </TableContainer>
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