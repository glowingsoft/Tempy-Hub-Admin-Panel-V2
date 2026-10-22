import { useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import Typography from '@mui/material/Typography';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableFiltersResult } from 'src/components/generic-table/table-filters-result';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';
import { TeamDevelopmentTabs } from 'src/components/team-development-tabs';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { exportToCSV, exportToPDF } from 'src/utils/export-helper';

import ComplianTableRow from '../compliance-table-row';
import {
  _complianceColumns,
  _courseStats,
  _departments,
  _departmentStats,
  _teamCompliance,
} from '../mocks/data';

// ----------------------------------------------------------------------

const OPTIONS = [
  { value: 'matrix', label: 'Competency matrix' },
  { value: 'supervision', label: 'Supervision' },
  { value: 'appraisal', label: 'Appraisal' },
  { value: 'evidence_queue', label: 'Evidence queue' },
];

const HEAD_LABELS = [
  { id: 'sr#', label: 'Sr#' },
  { id: 'staffMember', label: 'Staff member' },
  { id: 'fire', label: 'Fire Safety', align: 'center' },
  { id: 'moving', label: 'Moving & Handling', align: 'center' },
  { id: 'safeguard', label: 'Safeguarding', align: 'center' },
  { id: 'medication', label: 'Medication', align: 'center' },
  { id: 'infection', label: 'Infection Control', align: 'center' },
];

const DEFAULT_FILTERS = { name: '', status: 'matrix', staff: 'all', role: 'all', department: 'all' };

// ----------------------------------------------------------------------

function TeamComplianceListView({ columns = _complianceColumns, rows = _teamCompliance, dashboardHref: dashboardHrefProp }) {
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

  const staffOptions = useMemo(
    () => [
      { value: 'all', label: 'All staff' },
      ...rows.map((row) => ({ value: row.id, label: row.name })),
    ],
    [rows]
  );

  const roleOptions = useMemo(
    () => [
      { value: 'all', label: 'All roles' },
      ...[...new Set(rows.map((row) => row.role))].map((role) => ({ value: role, label: role })),
    ],
    [rows]
  );

  const departmentOptions = useMemo(() => _departments.map((d) => ({ value: d.id, label: d.name })), []);

  const FILTER_FIELDS = useMemo(
    () => [
      createFilterField.select({
        options: OPTIONS,
        label: 'Compliance View',
      }),
      createFilterField.select({
        key: 'department',
        label: 'Department',
        options: departmentOptions,
      }),
      createFilterField.select({
        key: 'staff',
        label: 'Staff member',
        options: staffOptions,
      }),
      createFilterField.select({
        key: 'role',
        label: 'Role',
        options: roleOptions,
      }),
      createFilterField.search({
        placeholder: 'Search staff...',
      }),
    ],
    [departmentOptions, staffOptions, roleOptions]
  );

  const statusFilterField = useMemo(() => FILTER_FIELDS.find((f) => f.type === 'status'), [FILTER_FIELDS]);
  const toolbarFilterFields = useMemo(() => FILTER_FIELDS.filter((f) => f.type !== 'status'), [FILTER_FIELDS]);

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

    return rows.filter((row) => {
      const matchesSearch = !search || row.name?.toLowerCase().includes(search);
      const matchesStaff = filters.state.staff === 'all' || row.id === filters.state.staff;
      const matchesRole = filters.state.role === 'all' || row.role === filters.state.role;
      const matchesDept = filters.state.department === 'all' || row.department === filters.state.department;
      return matchesSearch && matchesStaff && matchesRole && matchesDept;
    });
  }, [rows, filters.state.name, filters.state.staff, filters.state.role, filters.state.department]);

  const paginatedRows = filteredRows.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const activeFilters = useMemo(() => {
    const list = [];
    if (filters.state.name) {
      list.push({ key: 'name', label: 'Search', value: filters.state.name });
    }
    if (filters.state.department !== 'all') {
      list.push({
        key: 'department',
        type: 'select',
        label: 'Department',
        value: filters.state.department,
        options: departmentOptions,
      });
    }
    if (filters.state.staff !== 'all') {
      list.push({ key: 'staff', type: 'select', label: 'Staff member', value: filters.state.staff, options: staffOptions });
    }
    if (filters.state.role !== 'all') {
      list.push({ key: 'role', type: 'select', label: 'Role', value: filters.state.role, options: roleOptions });
    }
    return list;
  }, [filters.state, departmentOptions, staffOptions, roleOptions]);

  const canReset = activeFilters.length > 0;

  const handleRemoveFilter = useCallback(
    (key) => {
      table.onResetPage();
      filters.setState({ [key]: DEFAULT_FILTERS[key] });
    },
    [filters, table]
  );

  const handleResetAllFilters = useCallback(() => {
    table.onResetPage();
    filters.setState({ name: '', staff: 'all', role: 'all', department: 'all' });
  }, [filters, table]);

  // Export Handlers
  const handleExportCSV = useCallback(() => {
    const exportData = filteredRows.map((row) => ({
      Name: row.name,
      Role: row.role,
      Department: row.department,
      'Overall Compliance': `${row.overallCompliance}%`,
      'Fire Safety': row.modules?.fire?.state || 'N/A',
      'Moving & Handling': row.modules?.moving?.state || 'N/A',
      Safeguarding: row.modules?.safeguard?.state || 'N/A',
      Medication: row.modules?.medication?.state || 'N/A',
      'Infection Control': row.modules?.infection?.state || 'N/A',
    }));
    exportToCSV(exportData, 'team-compliance-report.csv');
  }, [filteredRows]);

  const handleExportPDF = useCallback(() => {
    const exportColumns = [
      { id: 'name', label: 'Staff Member' },
      { id: 'role', label: 'Role' },
      { id: 'overallCompliance', label: 'Compliance' },
      { id: 'fire', label: 'Fire Safety' },
      { id: 'moving', label: 'Moving & Handling' },
      { id: 'safeguard', label: 'Safeguarding' },
    ];
    const exportData = filteredRows.map((row) => ({
      name: row.name,
      role: row.role,
      overallCompliance: `${row.overallCompliance}%`,
      fire: row.modules?.fire?.state || 'N/A',
      moving: row.modules?.moving?.state || 'N/A',
      safeguard: row.modules?.safeguard?.state || 'N/A',
    }));
    exportToPDF('Team Compliance Report', exportColumns, exportData);
  }, [filteredRows]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Team Compliance"
        links={[
          { name: 'Dashboard', href: dashboardHref },
          { name: 'Team Compliance' },
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

      {/* Compliance Statistics Overview Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Course Compliance Rates */}
        <Grid item xs={12} md={7}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Compliance Statistics per Course
            </Typography>
            <Stack spacing={2}>
              {_courseStats.map((course) => (
                <Box key={course.key}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {course.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {course.compliance}% ({course.compliant}/{course.total} Compliant)
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={course.compliance}
                    color={
                      course.compliance >= 90
                        ? 'success'
                        : course.compliance >= 75
                        ? 'warning'
                        : 'error'
                    }
                    sx={{ height: 8, borderRadius: 1 }}
                  />
                </Box>
              ))}
            </Stack>
          </Card>
        </Grid>

        {/* Department Compliance Stats */}
        <Grid item xs={12} md={5}>
          <Card sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Department Compliance Overview
            </Typography>
            <Stack spacing={2}>
              {_departmentStats.map((dept) => (
                <Stack
                  key={dept.department}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                  }}
                >
                  <Stack>
                    <Typography variant="subtitle2">{dept.department}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dept.staffCount} Staff members
                    </Typography>
                  </Stack>
                  <Label
                    variant="soft"
                    color={
                      dept.compliance >= 90
                        ? 'success'
                        : dept.compliance >= 75
                        ? 'warning'
                        : 'error'
                    }
                  >
                    {dept.compliance}%
                  </Label>
                </Stack>
              ))}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Main Table Card */}
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
          <FlexibleTableFiltersResult
            activeFilters={activeFilters}
            totalResults={filteredRows.length}
            onResetFilters={handleResetAllFilters}
            onRemoveFilter={handleRemoveFilter}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <TableContainer sx={{ overflow: 'unset' }}>
          <Scrollbar>
            <Table sx={{ minWidth: 720 }}>
              <TableHeadCustom headLabel={HEAD_LABELS} />

              <TableBody>
                {paginatedRows.map((row, index) => (
                  <ComplianTableRow
                    key={row.id}
                    row={row}
                    columns={columns}
                    serialNumber={table.page * table.rowsPerPage + index + 1}
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
    </DashboardContent>
  );
}

export default TeamComplianceListView;