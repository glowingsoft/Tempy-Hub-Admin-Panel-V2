import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

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
import { TeamDevelopmentTabs } from 'src/components/team-development-tabs';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { exportToCSV, exportToPDF } from 'src/utils/export-helper';
import { fDate } from 'src/utils/format-time';
import { useGetTrainingRecordsQuery } from 'src/store/Reducer/assignments-api';

import { TrainingRecordTableRow } from '../training-record-table-row';
import { AddTrainingRecordDialog } from '../add-training-record-dialog';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 60 },
  { id: 'staff', label: 'Staff Member' },
  { id: 'requirement', label: 'Requirement / Training' },
  { id: 'dueDate', label: 'Due Date' },
  { id: 'completedAt', label: 'Completed Date' },
  { id: 'expiresAt', label: 'Expiry Date' },
  { id: 'status', label: 'Status', align: 'center' },
  { id: 'actions', label: 'Actions', align: 'center' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'in_progress', label: 'In Progress', color: 'warning' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'expired', label: 'Expired', color: 'error' },
];

const STATUS_FILTER_FIELD = createFilterField.status({
  key: 'status',
  options: STATUS_OPTIONS,
  showCounts: true,
});

const DEFAULT_FILTERS = { keyword: '', status: 'all' };

// ----------------------------------------------------------------------

export default function TrainingListView({ dashboardHref: dashboardHrefProp }) {
  const pathname = usePathname();
  const dashboardHref =
    dashboardHrefProp ||
    (pathname.startsWith(paths.siteManager.root)
      ? paths.siteManager.root
      : pathname.startsWith(paths.owner.root)
        ? paths.owner.root
        : paths.lineManager.root);

  const { organizationId } = useCurrentOrganization();
  const table = useTable({ defaultDense: true, defaultRowsPerPage: 10 });
  const filters = useSetState(DEFAULT_FILTERS);

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const debouncedKeyword = useDebounce(filters.state.keyword, 500)?.trim();

  // API Call to fetch training records
  const { data, isLoading, isFetching } = useGetTrainingRecordsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
      ...(filters.state.status !== 'all' ? { status: filters.state.status } : {}),
    },
    { skip: !organizationId }
  );

  const records = useMemo(() => data?.data ?? [], [data]);
  const totalRecords = data?.meta?.totalRecords ?? records.length;
  const statusCounts = data?.meta?.statusCounts ?? data?.meta?.counts ?? {};

  const getStatusCount = useCallback(
    (statusValue) => {
      // When backend returns statusCounts in meta
      if (statusCounts && Object.keys(statusCounts).length > 0) {
        if (statusValue === 'all') {
          const sum = STATUS_OPTIONS.filter((o) => o.value !== 'all').reduce(
            (acc, o) => acc + (Number(statusCounts[o.value]) || 0),
            0
          );
          return sum || totalRecords || 0;
        }
        return statusCounts[statusValue] ?? 0;
      }

      // Temporary fallback until backend adds statusCounts
      if (statusValue === 'all') {
        return totalRecords || records.length;
      }
      return records.filter((r) => (r.status || r.cellStatus) === statusValue).length;
    },
    [statusCounts, totalRecords, records]
  );

  const toolbarFilterFields = useMemo(
    () => [
      createFilterField.search({
        placeholder: 'Search staff, email, or requirement...',
      }),
    ],
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
      filters.setState({ keyword: event.target.value });
    },
    [filters, table]
  );

  const handleOpenAddRecord = useCallback((row) => {
    setSelectedAssignment(row);
    setOpenAddDialog(true);
  }, []);

  const handleCloseAddRecord = useCallback(() => {
    setSelectedAssignment(null);
    setOpenAddDialog(false);
  }, []);

  const handleExportCSV = useCallback(() => {
    const exportData = records.map((row) => ({
      'Staff Name': row.staff?.name || '',
      'Staff Email': row.staff?.email || '',
      'Job Title': row.staff?.jobTitle?.name || '',
      'Requirement': row.requirement?.name || '',
      'Type': row.requirement?.type || '',
      'Due Date': row.dueDate ? fDate(row.dueDate) : '',
      'Completed Date': row.completedAt
        ? fDate(row.completedAt)
        : row.record?.completedAt
          ? fDate(row.record.completedAt)
          : '',
      'Expiry Date': row.expiresAt ? fDate(row.expiresAt) : '',
      'Status': row.status || row.cellStatus || '',
    }));
    exportToCSV(exportData, 'training-records-report.csv');
  }, [records]);

  const handleExportPDF = useCallback(() => {
    const columns = [
      { id: 'staffName', label: 'Staff Member' },
      { id: 'requirementName', label: 'Course / Requirement' },
      { id: 'type', label: 'Type' },
      { id: 'dueDate', label: 'Due Date' },
      { id: 'completedDate', label: 'Completed' },
      { id: 'status', label: 'Status' },
    ];
    const pdfData = records.map((row) => ({
      staffName: row.staff?.name || row.staff?.email || '—',
      requirementName: row.requirement?.name || '—',
      type: row.requirement?.type || '—',
      dueDate: row.dueDate ? fDate(row.dueDate) : '—',
      completedDate: row.completedAt
        ? fDate(row.completedAt)
        : row.record?.completedAt
          ? fDate(row.record.completedAt)
          : '—',
      status: row.status || row.cellStatus || '—',
    }));
    exportToPDF('Training Records Report', columns, pdfData);
  }, [records]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Training Records"
        links={[
          { name: 'Dashboard', href: dashboardHref },
          { name: 'Training' },
        ]}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="solar:export-bold" />}
              onClick={handleExportCSV}
              disabled={!records.length}
            >
              Export CSV
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:printer-bold" />}
              onClick={handleExportPDF}
              disabled={!records.length}
            >
              Export PDF
            </Button>
          </Stack>
        }
        sx={{ mb: 3 }}
      />

      <TeamDevelopmentTabs />

      <Card sx={{ mt: 3 }}>
        <StatusTabsFilterWrapper
          filterField={STATUS_FILTER_FIELD}
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

        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 900 }}>
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
                    {records.map((row, index) => (
                      <TrainingRecordTableRow
                        key={row._id || row.assignmentId || index}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                        onAddRecord={handleOpenAddRecord}
                      />
                    ))}

                    <TableNoData notFound={records.length === 0} />
                  </>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>

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

      {/* Add Training Record Dialog */}
      <AddTrainingRecordDialog
        open={openAddDialog}
        onClose={handleCloseAddRecord}
        assignment={selectedAssignment}
      />
    </DashboardContent>
  );
}

TrainingListView.propTypes = {
  dashboardHref: PropTypes.string,
};