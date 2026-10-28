import { useCallback, useMemo } from 'react';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { TeamDevelopmentTabs } from 'src/components/team-development-tabs';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { exportToCSV, exportToPDF } from 'src/utils/export-helper';
import { fDate } from 'src/utils/format-time';

const _mockTrainingRecords = [
  {
    id: 'tr1',
    name: 'Amara Nwosu',
    role: 'Care Assistant',
    course: 'Safeguarding Adults Level 2',
    category: 'Mandatory',
    provider: 'e-Learning Portal',
    completionDate: '2026-03-01',
    expiryDate: '2027-03-01',
    progress: 100,
    status: 'completed',
  },
  {
    id: 'tr2',
    name: 'Priya Nair',
    role: 'Senior Carer',
    course: 'Fire Safety Refresher',
    category: 'Mandatory',
    provider: 'On-site Practical',
    completionDate: '2025-11-20',
    expiryDate: '2026-11-20',
    progress: 100,
    status: 'completed',
  },
  {
    id: 'tr3',
    name: 'Sam Okafor',
    role: 'Senior Carer',
    course: 'Medication Administration',
    category: 'Clinical',
    provider: 'NHS Academy',
    completionDate: '—',
    expiryDate: '2026-10-15',
    progress: 45,
    status: 'in_progress',
  },
  {
    id: 'tr4',
    name: 'Grace Obi',
    role: 'Care Assistant',
    course: 'Manual Handling & Moving',
    category: 'Mandatory',
    provider: 'Internal Assessor',
    completionDate: '2024-08-10',
    expiryDate: '2025-08-10',
    progress: 100,
    status: 'expired',
  },
];

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 50 },
  { id: 'staff', label: 'Staff Member' },
  { id: 'course', label: 'Course / Qualification' },
  { id: 'category', label: 'Category' },
  { id: 'progress', label: 'Progress', width: 160 },
  { id: 'expiry', label: 'Expiry Date' },
  { id: 'status', label: 'Status', align: 'center' },
];

const STATUS_COLOR = {
  completed: 'success',
  in_progress: 'warning',
  expired: 'error',
};

const DEFAULT_FILTERS = { name: '', status: 'all' };

export default function TrainingListView({ dashboardHref: dashboardHrefProp }) {
  const pathname = usePathname();
  const dashboardHref =
    dashboardHrefProp ||
    (pathname.startsWith(paths.siteManager.root)
      ? paths.siteManager.root
      : pathname.startsWith(paths.owner.root)
        ? paths.owner.root
        : paths.lineManager.root);

  const table = useTable();
  const filters = useSetState(DEFAULT_FILTERS);

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
    return _mockTrainingRecords.filter((row) => {
      const matchesSearch = !search || row.name.toLowerCase().includes(search) || row.course.toLowerCase().includes(search);
      const matchesStatus = filters.state.status === 'all' || row.status === filters.state.status;
      return matchesSearch && matchesStatus;
    });
  }, [filters.state.name, filters.state.status]);

  const paginatedRows = filteredRows.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const handleExportCSV = useCallback(() => {
    const exportData = filteredRows.map((row) => ({
      Name: row.name,
      Role: row.role,
      Course: row.course,
      Category: row.category,
      Provider: row.provider,
      'Completion Date': row.completionDate,
      'Expiry Date': row.expiryDate,
      Status: row.status,
    }));
    exportToCSV(exportData, 'training-records-report.csv');
  }, [filteredRows]);

  const handleExportPDF = useCallback(() => {
    const columns = [
      { id: 'name', label: 'Staff Member' },
      { id: 'course', label: 'Course' },
      { id: 'category', label: 'Category' },
      { id: 'expiryDate', label: 'Expiry Date' },
      { id: 'status', label: 'Status' },
    ];
    exportToPDF('Training Records Report', columns, filteredRows);
  }, [filteredRows]);

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

      <Card>
        <FlexibleTableToolbar
          filterFields={[
            createFilterField.search({ placeholder: 'Search staff or course...' }),
          ]}
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
                  <TableRow key={row.id} hover>
                    <TableCell>{table.page * table.rowsPerPage + index + 1}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar alt={row.name}>{row.name.charAt(0)}</Avatar>
                        <Stack>
                          <Typography variant="body2" fontWeight={600}>
                            {row.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.role}
                          </Typography>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {row.course}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.provider}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={row.category} size="small" variant="soft" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ width: '100%' }}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                          <Typography variant="caption">{row.progress}%</Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={row.progress}
                          color={row.progress === 100 ? 'success' : 'warning'}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>{fDate(row.expiryDate)}</TableCell>
                    <TableCell align="center">
                      <Label color={STATUS_COLOR[row.status] || 'default'}>
                        {row.status.replace('_', ' ')}
                      </Label>
                    </TableCell>
                  </TableRow>
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
    </DashboardContent>
  );
}