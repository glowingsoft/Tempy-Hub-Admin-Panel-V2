import { useCallback, useMemo } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
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
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Scrollbar } from 'src/components/scrollbar';
import { TableBodySkeleton, TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';
import { DataUsageSummaryCard } from 'src/sections/data-usage/data-usage-summary-card';
import { Label } from 'src/components/label';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useGetAppStaffCompetenciesQuery, useGetCompetencyMatrixQuery } from 'src/store/Reducer/assignments-api';
import { useGetDepartmentsQuery } from 'src/store/Reducer/departments-api';

import { TeamComplianceTable } from '../team-compliance-table';
import { TrainingRecordTableRow } from '../../training/training-record-table-row';

// ----------------------------------------------------------------------

const STAFF_COMPETENCY_TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 60 },
  { id: 'staff', label: 'Staff Member' },
  { id: 'requirement', label: 'Competency' },
  { id: 'dueDate', label: 'Due Date' },
  { id: 'completedAt', label: 'Completed Date' },
  { id: 'expiresAt', label: 'Expiry Date' },
  { id: 'status', label: 'Status', align: 'center' },
];

const STAFF_COMPETENCY_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'in_progress', label: 'In Progress', color: 'warning' },
  { value: 'completed', label: 'Completed', color: 'success' },
  { value: 'expired', label: 'Expired', color: 'error' },
];

function StaffCompetenciesList({ organizationId, user }) {
  const isStaffRole =
    Array.isArray(user?.access?.memberships) &&
    user.access.memberships.some(
      (membership) => typeof membership?.role === 'string' && membership.role.toLowerCase() === 'staff'
    );
  const cacheUserId = user?.id || user?.userId?._id || user?.staffId?._id || user?.staffId;
  const table = useTable({ defaultDense: true, defaultRowsPerPage: 10 });
  const filters = useSetState({ search: '', status: 'all' });
  const search = useDebounce(filters.state.search, 400).trim();

  const { data, isLoading, isFetching, isError, error } = useGetAppStaffCompetenciesQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      search: search || undefined,
      status: filters.state.status !== 'all' ? filters.state.status : undefined,
      cacheUserId,
    },
    { skip: !isStaffRole || !organizationId }
  );

  const payload = data?.data ?? {};
  const items = Array.isArray(payload) ? payload : Array.isArray(payload.items) ? payload.items : [];
  const compliance = payload.compliance ?? data?.meta?.compliance;
  const meta = data?.meta ?? payload.meta ?? {};
  const totalRecords = meta.totalRecords ?? items.length;
  const statusCounts = meta.statusCounts ?? items.reduce((counts, item) => {
    const status = item.status || item.cellStatus || 'in_progress';
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});

  const getStatusCount = useCallback(
    (statusValue) => {
      if (statusValue === 'all') {
        const sum = STAFF_COMPETENCY_STATUS_OPTIONS.filter((option) => option.value !== 'all').reduce(
          (total, option) => total + (Number(statusCounts[option.value]) || 0),
          0
        );
        return sum || totalRecords;
      }
      return statusCounts[statusValue] ?? 0;
    },
    [statusCounts, totalRecords]
  );
  const statusFilterField = useMemo(
    () => createFilterField.status({ options: STAFF_COMPETENCY_STATUS_OPTIONS, showCounts: true }),
    []
  );
  const searchFilterFields = useMemo(
    () => [createFilterField.search({ key: 'search', placeholder: 'Search competencies...' })],
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
      filters.setState({ search: event.target.value });
    },
    [filters, table]
  );

  return (
    <>
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DataUsageSummaryCard
            title="Score"
            total={compliance?.score != null ? `${compliance.score}%` : '—'}
            color="success"
            icon="solar:shield-check-bold-duotone"
            loading={isLoading || isFetching}
            sx={{ minHeight: 124 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataUsageSummaryCard
            title="Done"
            total={compliance?.done ?? '—'}
            color="info"
            icon="solar:check-circle-bold-duotone"
            loading={isLoading || isFetching}
            sx={{ minHeight: 124 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataUsageSummaryCard
            title="Expected"
            total={compliance?.expected ?? '—'}
            color="warning"
            icon="solar:target-bold-duotone"
            loading={isLoading || isFetching}
            sx={{ minHeight: 124 }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DataUsageSummaryCard
            title="Remaining"
            total={
              compliance?.expected != null && compliance?.done != null
                ? Math.max(Number(compliance.expected) - Number(compliance.done), 0)
                : '—'
            }
            color="primary"
            icon="solar:hourglass-bold-duotone"
            loading={isLoading || isFetching}
            sx={{ minHeight: 124 }}
          />
        </Grid>
      </Grid>

      {!isStaffRole && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Your account is not associated with a staff membership.
        </Alert>
      )}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error?.data?.message || error?.error || 'Failed to load competencies.'}
        </Alert>
      )}

      <Card>
        <StatusTabsFilterWrapper
          filterField={statusFilterField}
          value={filters.state.status}
          onChange={handleFilterChange}
          getCount={getStatusCount}
        />
        <FlexibleTableToolbar
          filterFields={searchFilterFields}
          filterValues={filters.state}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />
        <TableContainer>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 850 }}>
              <TableHeadCustom headLabel={STAFF_COMPETENCY_TABLE_HEAD} />
              <TableBody>
                {isLoading || isFetching ? (
                  <TableBodySkeleton
                    rowCount={table.rowsPerPage}
                    cellCount={STAFF_COMPETENCY_TABLE_HEAD.length}
                    dense={table.dense}
                  />
                ) : (
                  <>
                    {items.map((row, index) => (
                      <TrainingRecordTableRow
                        key={row._id || row.assignmentId || index}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                        readOnly
                        showDocuments={false}
                      />
                    ))}
                    <TableNoData notFound={!items.length} title="No competencies found" />
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
    </>
  );
}

function TeamComplianceListView({ dashboardHref: dashboardHrefProp }) {
  const pathname = usePathname();
  const isSiteManager = pathname.startsWith(paths.siteManager.root);
  const { organizationId, user } = useCurrentOrganization();
  const isStaffRoute = pathname.startsWith(`${paths.staff.root}/`);
  const isStaffCompetenciesRoute = pathname === paths.staff.competencies;
  const isStaffRole =
    Array.isArray(user?.access?.memberships) &&
    user.access.memberships.some(
      (membership) => typeof membership?.role === 'string' && membership.role.toLowerCase() === 'staff'
    );
  const staffIdCandidates = [user?.staffId, user?.basicInfo?._id, user?.id];
  const staffId = staffIdCandidates
    .map((candidate) => (typeof candidate === 'string' ? candidate : candidate?._id || candidate?.id))
    .find(Boolean);

  const dashboardHref =
    dashboardHrefProp ||
    (isStaffRoute
      ? paths.staff.dashboard
      : isSiteManager
        ? paths.siteManager.root
        : pathname.startsWith(paths.owner.root)
          ? paths.owner.root
          : paths.lineManager.root);

  const {
    data: complianceMatrixData,
    isLoading: isComplianceStatsLoading,
    isError: isComplianceStatsError,
    error: complianceStatsError,
  } = useGetCompetencyMatrixQuery({ organizationId, page: 1, limit: 10 }, { skip: !organizationId || isStaffRoute });
  const {
    data: departmentsData,
    isLoading: isDepartmentsLoading,
    isError: isDepartmentsError,
    error: departmentsError,
  } = useGetDepartmentsQuery({ organizationId, page: 1, limit: 1000 }, { skip: !organizationId || isStaffRoute });
  const courseStats = complianceMatrixData?.meta?.stats?.courses ?? [];
  const departmentsById = useMemo(() => Object.fromEntries((departmentsData?.data ?? []).map(({ _id, name }) => [_id, name])), [departmentsData?.data]);
  const departmentStats = useMemo(
    () =>
      (complianceMatrixData?.meta?.stats?.departments ?? []).map((department) => ({
        ...department,
        department: departmentsById[department.departmentId] || '—',
      })),
    [complianceMatrixData?.meta?.stats?.departments, departmentsById]
  );
  const isStatsLoading = isComplianceStatsLoading || isDepartmentsLoading;

  if (isStaffRoute) {
    return (
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Competencies"
          links={[
            { name: 'Dashboard', href: dashboardHref },
            { name: 'Competencies' },
          ]}
          sx={{ mb: 3 }}
        />
        <StaffCompetenciesList organizationId={organizationId} user={user} />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={isStaffCompetenciesRoute ? 'Competencies' : 'Team Compliance'}
        links={[
          { name: 'Dashboard', href: dashboardHref },
          ...(isStaffCompetenciesRoute
            ? [{ name: 'Competencies' }]
            : isStaffRoute
              ? [
                  { name: 'Supervision & Appraisal', href: paths.staff.supervision },
                  { name: 'Team Compliance Matrix' },
                ]
              : [{ name: 'Team Compliance' }]),
        ]}
        sx={{ mb: 3 }}
      />

      {/* Compliance Statistics Overview Section */}
      {!isStaffRoute && (isComplianceStatsError || isDepartmentsError) && (
        <Stack spacing={2} sx={{ mb: 2 }}>
          {isComplianceStatsError && (
            <Alert severity="error">{complianceStatsError?.data?.message || complianceStatsError?.error || 'Failed to load compliance statistics.'}</Alert>
          )}
          {isDepartmentsError && <Alert severity="error">{departmentsError?.data?.message || departmentsError?.error || 'Failed to load department names.'}</Alert>}
        </Stack>
      )}
      {!isStaffRoute && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Course Compliance Rates */}
          <Grid item xs={12} md={7}>
            <Card sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Compliance Statistics per Course
              </Typography>
              <Stack spacing={2}>
                {isStatsLoading ? (
                  <Typography variant="body2" color="text.secondary">
                    Loading course statistics...
                  </Typography>
                ) : courseStats.length ? (
                  courseStats.map((course) => (
                    <Box key={course.requirementId}>
                      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {course.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {course.percent}% ({course.done}/{course.expected} Compliant)
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={course.percent}
                        color={course.percent > 90 ? 'success' : 'warning'}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No course statistics available.
                  </Typography>
                )}
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
                {isStatsLoading ? (
                  <Typography variant="body2" color="text.secondary">
                    Loading department statistics...
                  </Typography>
                ) : departmentStats.length ? (
                  departmentStats.map((dept) => (
                    <Stack
                      key={dept.departmentId}
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
                          {dept.done}/{dept.expected} Compliant
                        </Typography>
                      </Stack>
                      <Label variant="soft" color={dept.percent >= 90 ? 'success' : dept.percent >= 75 ? 'warning' : 'error'}>
                        {dept.percent}%
                      </Label>
                    </Stack>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No department statistics available.
                  </Typography>
                )}
              </Stack>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Staff Compliance Matrix Table */}
      {isStaffRoute && (!isStaffRole || !staffId) && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {!isStaffRole
            ? 'Your account is not associated with a staff membership.'
            : 'Could not determine your staff profile. Contact your administrator.'}
        </Alert>
      )}
      <TeamComplianceTable
        organizationId={organizationId}
        isSiteManager={isSiteManager}
        siteManagerBranchId={user?.branchId || user?.branch?._id}
        isStaffView={isStaffRoute}
        staffId={staffId}
        skip={!organizationId || (isStaffRoute && (!isStaffRole || !staffId))}
      />
    </DashboardContent>
  );
}

export default TeamComplianceListView;