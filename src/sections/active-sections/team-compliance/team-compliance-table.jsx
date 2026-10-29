import PropTypes from 'prop-types';
import { useMemo, useCallback, useState } from 'react';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import InputAdornment from '@mui/material/InputAdornment';
import TableContainer from '@mui/material/TableContainer';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import {
  useTable,
  TableNoData,
  TableBodySkeleton,
  TablePaginationCustom,
} from 'src/components/table';
import { FlexibleTableFiltersResult } from 'src/components/generic-table/table-filters-result';
import { toast } from 'src/components/snackbar';
import { useSetState } from 'src/hooks/use-set-state';
import { useDebounce } from 'src/hooks/use-debounce';
import { useGetDepartmentsQuery } from 'src/store/Reducer/departments-api';
import { useGetJobTitlesQuery } from 'src/store/Reducer/job-titles-api';
import { useGetCompetencyMatrixQuery } from 'src/store/Reducer/assignments-api';
import { usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { AssignStaffDialog } from './assign-staff-dialog';

// ----------------------------------------------------------------------

const mapOption = (item) => ({ value: item._id, label: item.name });

const EXTRA_DEPT_OPTIONS = [{ value: 'all', label: 'All Departments' }];
const EXTRA_JOB_OPTIONS = [{ value: 'all', label: 'All Job Titles' }];

// ----------------------------------------------------------------------

const STATUS_CONFIG = {
  valid: {
    label: 'Valid',
    color: 'success',
    icon: 'eva:checkmark-circle-2-fill',
    description: 'Requirement met and currently valid',
  },
  completed: {
    label: 'Completed',
    color: 'success',
    icon: 'eva:checkmark-circle-2-fill',
    description: 'Completed successfully',
  },
  in_progress: {
    label: 'In Progress',
    color: 'warning',
    icon: 'eva:clock-outline',
    description: 'Assigned or due soon',
  },
  overdue: {
    label: 'Overdue',
    color: 'error',
    icon: 'eva:alert-triangle-fill',
    description: 'Past due date and requires immediate action',
  },
  expired: {
    label: 'Expired',
    color: 'error',
    icon: 'eva:close-circle-fill',
    description: 'Validity expired and requires renewal',
  },
  na: {
    label: 'N/A',
    color: 'default',
    icon: 'eva:minus-circle-outline',
    description: 'Not applicable for this staff member',
  },
};

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status ? String(status).replace(/_/g, ' ') : '—',
      color: 'default',
      icon: null,
      description: 'Status info',
    }
  );
}

function getAssignmentId(cell, requirementId) {
  const candidates = [
    cell?.assignmentId,
    cell?.assignment_id,
    cell?.assignment?._id,
    cell?.assignment?.id,
    cell?.assignment,
    cell?.id,
  ];

  for (const candidate of candidates) {
    const id = typeof candidate === 'string' ? candidate : candidate?._id || candidate?.id;
    if (id) return id;
  }

  return cell?._id && cell._id !== requirementId && cell._id !== cell.requirementId
    ? cell._id
    : null;
}

// ----------------------------------------------------------------------

function ComplianceMatrixCell({ cell, column, staff, onSelectCell }) {
  if (!cell) {
    return (
      <TableCell align="center" sx={{ color: 'text.disabled' }}>
        —
      </TableCell>
    );
  }

  const status = cell.status;
  const assignmentId = getAssignmentId(cell, column?._id);
  const config = getStatusConfig(status);

  return (
    <TableCell align="center" sx={{ whiteSpace: 'nowrap', px: 1.5, minWidth: 240 }}>
      <ButtonBase
        aria-label={`${config.label} status for ${column?.name || 'requirement'}`}
        onClick={() => onSelectCell({ cell, assignmentId, column, staff })}
        sx={{ display: 'inline-flex', borderRadius: 1 }}
      >
        <Label
          variant="soft"
          color={config.color}
          startIcon={config.icon ? <Iconify icon={config.icon} width={14} /> : undefined}
          sx={{
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: 600,
            px: 1,
            py: 0.5,
            textTransform: 'capitalize',
            transition: (theme) => theme.transitions.create(['transform', 'box-shadow']),
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: (theme) => theme.customShadows?.z4 || 2,
            },
          }}
        >
          {config.label}
        </Label>
      </ButtonBase>
    </TableCell>
  );
}

ComplianceMatrixCell.propTypes = {
  cell: PropTypes.object,
  column: PropTypes.object,
  staff: PropTypes.object,
  onSelectCell: PropTypes.func,
};

// ----------------------------------------------------------------------

export function TeamComplianceTable({
  organizationId,
  isSiteManager = false,
  siteManagerBranchId = null,
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Set dense: true by default like supervision & appraisal table
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });

  // Standard project filter state via useSetState
  const filters = useSetState({
    search: '',
    departmentId: 'all',
    jobTitleId: 'all',
  });

  const debouncedKeyword = useDebounce(filters.state.search, 400).trim();

  // Query Competency Matrix API
  const queryParams = useMemo(
    () => ({
      organizationId,
      ...(debouncedKeyword ? { keyword: debouncedKeyword } : {}),
      ...(filters.state.departmentId !== 'all' ? { departmentId: filters.state.departmentId } : {}),
      ...(filters.state.jobTitleId !== 'all' ? { jobTitleId: filters.state.jobTitleId } : {}),
      page: table.page + 1,
      limit: table.rowsPerPage,
    }),
    [
      organizationId,
      debouncedKeyword,
      filters.state.departmentId,
      filters.state.jobTitleId,
      table.page,
      table.rowsPerPage,
    ]
  );

  const { data, isLoading, isFetching } = useGetCompetencyMatrixQuery(queryParams, {
    skip: !organizationId,
  });

  const [assignModal, setAssignModal] = useState({
    open: false,
    requirement: null,
    staff: null,
  });

  const handleSelectCell = useCallback(
    ({ cell, assignmentId, column, staff }) => {
      if (assignmentId) {
        const detailPath = pathname.startsWith(paths.siteManager.root)
          ? paths.siteManager.teamComplianceDetail(assignmentId)
          : pathname.startsWith(paths.owner.root)
            ? paths.owner.teamComplianceDetail(assignmentId)
            : paths.lineManager.teamComplianceDetail(assignmentId);
        router.push(detailPath);
        return;
      }

      // For N/A or any cell without an assignmentId, open AssignStaffDialog
      const requirement = cell?.requirement || column;
      if (!requirement?._id) {
        toast.error('Requirement details are missing for this cell.');
        return;
      }

      setAssignModal({
        open: true,
        requirement,
        staff,
      });
    },
    [pathname, router]
  );

  const matrixData = data?.data;
  const columns = useMemo(() => matrixData?.columns ?? [], [matrixData?.columns]);
  const rows = useMemo(() => matrixData?.rows ?? [], [matrixData?.rows]);
  const meta = data?.meta;
  const totalRecords = meta?.totalRecords ?? rows.length;

  // InfiniteAutocomplete value objects derived from filter state
  const deptValue = useMemo(
    () =>
      filters.state.departmentId === 'all'
        ? EXTRA_DEPT_OPTIONS[0]
        : { value: filters.state.departmentId, label: '' },
    [filters.state.departmentId]
  );

  const jobValue = useMemo(
    () =>
      filters.state.jobTitleId === 'all'
        ? EXTRA_JOB_OPTIONS[0]
        : { value: filters.state.jobTitleId, label: '' },
    [filters.state.jobTitleId]
  );

  const handleSearchChange = useCallback(
    (event) => {
      table.onResetPage();
      filters.setState({ search: event.target.value });
    },
    [table, filters]
  );

  const handleDeptChange = useCallback(
    (newValue) => {
      table.onResetPage();
      filters.setState({ departmentId: newValue?.value || 'all' });
    },
    [table, filters]
  );

  const handleJobChange = useCallback(
    (newValue) => {
      table.onResetPage();
      filters.setState({ jobTitleId: newValue?.value || 'all' });
    },
    [table, filters]
  );

  // Active filters for chip display
  const activeFilters = useMemo(() => {
    const list = [];
    if (filters.state.departmentId !== 'all') {
      list.push({
        key: 'departmentId',
        type: 'select',
        label: 'Department',
        value: filters.state.departmentId,
        options: EXTRA_DEPT_OPTIONS,
      });
    }
    if (filters.state.jobTitleId !== 'all') {
      list.push({
        key: 'jobTitleId',
        type: 'select',
        label: 'Job Title',
        value: filters.state.jobTitleId,
        options: EXTRA_JOB_OPTIONS,
      });
    }
    return list;
  }, [filters.state]);

  const canReset = activeFilters.length > 0 || Boolean(filters.state.search);

  const handleResetAllFilters = useCallback(() => {
    table.onResetPage();
    filters.setState({
      search: '',
      departmentId: 'all',
      jobTitleId: 'all',
    });
  }, [table, filters]);

  const handleRemoveFilter = useCallback(
    (key) => {
      table.onResetPage();
      filters.setState({ [key]: 'all' });
    },
    [table, filters]
  );

  return (
    <Card sx={{ mt: 3 }}>
      <CardHeader
        title="Team Compliance Matrix"
        subheader="Individual staff compliance status across competencies & mandatory training"
        sx={{ pb: 1 }}
      />

      {/* Toolbar */}
      <Stack spacing={2} sx={{ p: 2.5 }}>
        {/* Row 1: Search — 100% width */}
        <TextField
          fullWidth
          value={filters.state.search}
          onChange={handleSearchChange}
          placeholder="Search staff by name or email..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Row 2: Department (25%) + Job Title (25%) — left-aligned */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
          <Box sx={{ width: { xs: 1, sm: '25%' }, minWidth: 180 }}>
            <InfiniteAutocomplete
              value={deptValue}
              onChange={handleDeptChange}
              useQuery={useGetDepartmentsQuery}
              queryArgs={{ organizationId }}
              mapOption={mapOption}
              extraOptions={EXTRA_DEPT_OPTIONS}
              label="Department"
              placeholder="Search department..."
              disabled={!organizationId}
              fullWidth
            />
          </Box>

          <Box sx={{ width: { xs: 1, sm: '25%' }, minWidth: 180 }}>
            <InfiniteAutocomplete
              value={jobValue}
              onChange={handleJobChange}
              useQuery={useGetJobTitlesQuery}
              queryArgs={{ organizationId }}
              mapOption={mapOption}
              extraOptions={EXTRA_JOB_OPTIONS}
              label="Job Title"
              placeholder="Search job title..."
              disabled={!organizationId}
              fullWidth
            />
          </Box>
        </Stack>
      </Stack>

      {/* Active Filter Chips / Reset */}
      {canReset && (
        <FlexibleTableFiltersResult
          activeFilters={activeFilters}
          totalResults={totalRecords}
          onResetFilters={handleResetAllFilters}
          onRemoveFilter={handleRemoveFilter}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}

      {/* Table Container */}
      <Box sx={{ position: 'relative' }}>
        <TableContainer sx={{ overflow: 'unset' }}>
          <Scrollbar>
            <Table
              size={table.dense ? 'small' : 'medium'}
              sx={{ minWidth: Math.max(800, 300 + columns.length * 240) }}
            >
              <TableHead
                sx={{
                  '& .MuiTableCell-head': {
                    height: table.dense ? 48 : 56,
                    py: table.dense ? 0.75 : 1.25,
                    boxSizing: 'border-box',
                    verticalAlign: 'middle',
                  },
                }}
              >
                <TableRow sx={{ height: table.dense ? 48 : 56 }}>
                  {/* Sticky Column 1: Sr# */}
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 3,
                      width: 60,
                      minWidth: 60,
                      maxWidth: 60,
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Sr#
                    </Typography>
                  </TableCell>

                  {/* Sticky Column 2: Staff Member */}
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 60,
                      zIndex: 3,
                      width: 240,
                      minWidth: 240,
                      maxWidth: 240,
                      bgcolor: 'background.paper',
                      borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                      boxShadow: (theme) => `2px 0 4px -2px ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="subtitle2" color="text.secondary">
                      Staff Member
                    </Typography>
                  </TableCell>

                  {/* Competency Columns (Only show complete requirement name) */}
                  {columns.map((col) => (
                    <TableCell
                      key={col._id || col.name}
                      align="center"
                      sx={{
                        minWidth: 240,
                        whiteSpace: 'nowrap',
                        verticalAlign: 'middle',
                        px: 1.5,
                      }}
                    >
                      <Tooltip
                        title={
                          col.renewalMonths
                            ? `${col.name} (${col.renewalMonths}m renewal)`
                            : col.name
                        }
                        arrow
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            lineHeight: 1.2,
                            textAlign: 'center',
                          }}
                        >
                          {col.name}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading || isFetching ? (
                  <TableBodySkeleton
                    rowCount={table.rowsPerPage}
                    cellCount={Math.max(columns.length + 2, 5)}
                    dense={table.dense}
                  />
                ) : (
                  <>
                    {rows.map((row, index) => {
                      const staff = row.staff || {};
                      const serialNumber = table.page * table.rowsPerPage + index + 1;

                      return (
                        <TableRow
                          key={staff._id || row._id || index}
                          hover
                          sx={{
                            height: table.dense ? 48 : 56,
                            '& .MuiTableCell-root': {
                              py: table.dense ? 0.75 : 1.25,
                              boxSizing: 'border-box',
                            },
                          }}
                        >
                          {/* Sticky Column 1: Sr# */}
                          <TableCell
                            sx={{
                              position: 'sticky',
                              left: 0,
                              zIndex: 1,
                              width: 60,
                              minWidth: 60,
                              maxWidth: 60,
                              color: 'text.secondary',
                              typography: 'body2',
                              bgcolor: 'background.paper',
                            }}
                          >
                            {serialNumber}
                          </TableCell>

                          {/* Sticky Column 2: Staff Member */}
                          <TableCell
                            sx={{
                              position: 'sticky',
                              left: 60,
                              zIndex: 1,
                              width: 240,
                              minWidth: 240,
                              maxWidth: 240,
                              bgcolor: 'background.paper',
                              borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                              boxShadow: (theme) => `2px 0 4px -2px ${theme.palette.divider}`,
                            }}
                          >
                            <Stack spacing={0.25}>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{ textTransform: 'capitalize' }}
                                noWrap
                              >
                                {staff.name || 'Unknown Staff'}
                              </Typography>

                              {staff.email && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ textTransform: 'none' }}
                                  noWrap
                                >
                                  {staff.email}
                                </Typography>
                              )}
                            </Stack>
                          </TableCell>

                          {/* Dynamic Competency Matrix Cells */}
                          {columns.map((col, cellIndex) => {
                            const cell = Array.isArray(row.cells)
                              ? row.cells.find((c) => c?.requirementId === col._id || c?._id === col._id) ||
                              row.cells[cellIndex]
                              : null;
                            return (
                              <ComplianceMatrixCell
                                key={col._id || cellIndex}
                                cell={cell}
                                column={col}
                                staff={staff}
                                onSelectCell={handleSelectCell}
                              />
                            );
                          })}
                        </TableRow>
                      );
                    })}

                    <TableNoData
                      notFound={!isLoading && rows.length === 0}
                      title="No staff compliance records found"
                    />
                  </>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </TableContainer>
      </Box>

      {/* Pagination Controls */}
      <TablePaginationCustom
        page={table.page}
        count={totalRecords}
        dense={table.dense}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
        onChangeDense={table.onChangeDense}
      />

      {/* Assign Staff Modal for N/A Cells */}
      {assignModal.open && (
        <AssignStaffDialog
          open={assignModal.open}
          onClose={() => setAssignModal({ open: false, requirement: null, staff: null })}
          requirement={assignModal.requirement}
          initialStaff={assignModal.staff}
          organizationId={organizationId}
          isSiteManager={isSiteManager}
          siteManagerBranchId={siteManagerBranchId}
        />
      )}

    </Card>
  );
}

TeamComplianceTable.propTypes = {
  organizationId: PropTypes.string,
  isSiteManager: PropTypes.bool,
  siteManagerBranchId: PropTypes.string,
};

export default TeamComplianceTable;