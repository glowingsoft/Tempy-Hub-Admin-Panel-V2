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
import { FlexibleTableFiltersResult } from 'src/components/generic-table/table-filters-result';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TeamDevelopmentTabs } from 'src/components/team-development-tabs';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { exportToCSV, exportToPDF } from 'src/utils/export-helper';
import { toast } from 'src/components/snackbar';

import AppraisalTableRow from '../appraisal-table-row';
import LogAppraisalDialog from '../log-appraisal-dialog';
import { _mockAppraisals, logTeamAppraisalReview } from '../mocks/data';

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 50 },
  { id: 'staff', label: 'Staff Member' },
  { id: 'period', label: 'Review Period' },
  { id: 'lastReview', label: 'Last Review' },
  { id: 'nextDue', label: 'Next Due' },
  { id: 'status', label: 'Status', align: 'center' },
  { id: 'actions', label: 'Actions', align: 'center' },
];

const DEFAULT_FILTERS = { name: '', status: 'all', department: 'all' };

export default function AppraisalListView() {
  const table = useTable();
  const filters = useSetState(DEFAULT_FILTERS);

  // Appraisals record state (allows live optimistic update upon saving review)
  const [appraisals, setAppraisals] = useState(_mockAppraisals);
  const [selectedRow, setSelectedRow] = useState(null);
  const logModal = useBoolean();

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
    return appraisals.filter((row) => {
      const matchesSearch = !search || row.name.toLowerCase().includes(search);
      const matchesStatus = filters.state.status === 'all' || row.status === filters.state.status;
      const matchesDept =
        filters.state.department === 'all' || row.department.toLowerCase() === filters.state.department.toLowerCase();
      return matchesSearch && matchesStatus && matchesDept;
    });
  }, [appraisals, filters.state.name, filters.state.status, filters.state.department]);

  const paginatedRows = filteredRows.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const handleOpenLogReview = useCallback(
    (row) => {
      setSelectedRow(row);
      logModal.onTrue();
    },
    [logModal]
  );

  const handleSaveReview = useCallback(
    (reviewData) => {
      logTeamAppraisalReview(reviewData.staffId, reviewData);
      setAppraisals([..._mockAppraisals]);
      toast.success(`Appraisal review successfully logged for ${selectedRow?.name || 'staff member'}`);
      logModal.onFalse();
      setSelectedRow(null);
    },
    [logModal, selectedRow]
  );

  const handleExportCSV = useCallback(() => {
    const exportData = filteredRows.map((row) => ({
      Name: row.name,
      Role: row.role,
      Department: row.department,
      Period: row.period,
      'Last Review': row.lastReview,
      'Next Due': row.nextDue,
      Status: row.status,
    }));
    exportToCSV(exportData, 'staff-appraisals-report.csv');
  }, [filteredRows]);

  const handleExportPDF = useCallback(() => {
    const columns = [
      { id: 'name', label: 'Staff Member' },
      { id: 'department', label: 'Department' },
      { id: 'period', label: 'Review Period' },
      { id: 'lastReview', label: 'Last Review' },
      { id: 'nextDue', label: 'Next Due' },
      { id: 'status', label: 'Status' },
    ];
    exportToPDF('Staff Appraisals Report', columns, filteredRows);
  }, [filteredRows]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Staff Appraisals"
        links={[
          { name: 'Dashboard', href: paths.lineManager.root },
          { name: 'Appraisals' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="solar:export-bold" />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Button
              variant="contained"
              color="primary"
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
        <FlexibleTableToolbar
          filterFields={[createFilterField.search({ placeholder: 'Search staff...' })]}
          filterValues={filters.state}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />

        <TableContainer sx={{ overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 800 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {paginatedRows.map((row, index) => (
                  <AppraisalTableRow
                    key={row.id}
                    row={row}
                    serialNumber={table.page * table.rowsPerPage + index + 1}
                    onLogReview={handleOpenLogReview}
                  />
                ))}

                <TableNoData notFound={!filteredRows.length} />
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

        <TablePaginationCustom
          page={table.page}
          count={filteredRows.length}
          dense={table.dense}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          onChangeDense={table.onChangeDense}
        />
      </Card>

      <LogAppraisalDialog
        open={logModal.value}
        row={selectedRow}
        onClose={() => {
          logModal.onFalse();
          setSelectedRow(null);
        }}
        onSave={handleSaveReview}
      />
    </DashboardContent>
  );
}
