import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

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
import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { usePathname, useRouter } from 'src/routes/hooks';
import { API_ROUTES } from 'src/store/apiRoutes';
import { downloadCsvFromApi } from 'src/utils/export-helper';
import { getListStatusTabCount } from 'src/utils/table-utils';
import { DataUsageSummaryCard } from 'src/sections/data-usage/data-usage-summary-card';
import {
  useGetAppStaffAppraisalsQuery,
  useGetAppraisalsQuery,
} from 'src/store/Reducer/appraisals-api';

import AppraisalTableRow, { getAppraisalRowStatus } from '../appraisal-table-row';
import BookAppraisalDialog from '../book-appraisal-dialog';
import LogAppraisalDialog from '../log-appraisal-dialog';
import { CompleteAppraisalDialog } from '../complete-appraisal-dialog';
import { SessionSignOffDialog } from '../../common/session-sign-off-dialog';
import { _mockAppraisals } from '../mocks/data';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 50 },
  { id: 'staff', label: 'Staff Member' },
  { id: 'period', label: 'Review Period' },
  { id: 'lastReview', label: 'Last Review' },
  { id: 'nextDue', label: 'Next Due' },
  { id: 'status', label: 'Status', align: 'center' },
  { id: 'actions', label: 'Actions', align: 'center' },
];

const APPRAISAL_STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled', color: 'info' },
  { value: 'completed', label: 'Completed', color: 'success' },
];

const STAFF_APPRAISAL_STATUS_OPTIONS = [
  ...APPRAISAL_STATUS_OPTIONS,
  { value: 'cancelled', label: 'Cancelled', color: 'default' },
];

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...APPRAISAL_STATUS_OPTIONS];

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

export function AppraisalListView({
  dashboardHref: dashboardHrefProp,
  heading = 'Appraisals',
  branchId: branchIdProp,
  basePath,
  showTabs = true,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const dashboardHref =
    dashboardHrefProp ||
    (pathname.startsWith(`${paths.staff.root}/`)
      ? paths.staff.dashboard
      : pathname.startsWith(paths.siteManager.root)
        ? paths.siteManager.root
        : pathname.startsWith(paths.owner.root)
          ? paths.owner.root
          : paths.lineManager.root);
  const { organizationId, user } = useCurrentOrganization();
  const isStaffRoute = pathname.startsWith(`${paths.staff.root}/`);
  const isStaffRole =
    Array.isArray(user?.access?.memberships) &&
    user.access.memberships.some(
      (membership) => typeof membership?.role === 'string' && membership.role.toLowerCase() === 'staff'
    );
  const isStaffView = isStaffRoute;
  const currentStaffId = [
    typeof user?.staffId === 'object' ? user.staffId?._id || user.staffId?.id : user?.staffId,
    user?.basicInfo?._id,
    user?.id,
  ].find(Boolean);
  const userBranchId = branchIdProp || user?.branchId?._id || user?.branchId;

  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });

  const bookModal = useBoolean();
  const logModal = useBoolean();
  const completeModal = useBoolean();
  const signOffModal = useBoolean();
  const [selectedRow, setSelectedRow] = useState(null);

  const filters = useSetState({ name: '', status: 'all' });
  const keyword = useDebounce(filters.state.name, 400);
  const trimmedKeyword = keyword.trim();

  // Query live appraisals from API
  const staffAppraisalsQuery = useGetAppStaffAppraisalsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      search: trimmedKeyword || undefined,
      status: filters.state.status !== 'all' ? filters.state.status : undefined,
      cacheUserId: currentStaffId,
    },
    { skip: !isStaffView || !isStaffRole || !organizationId }
  );

  const organizationAppraisalsQuery = useGetAppraisalsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(userBranchId ? { branchId: userBranchId } : {}),
      ...(trimmedKeyword ? { keyword: trimmedKeyword, search: trimmedKeyword } : {}),
      ...(filters.state.status !== 'all' ? { status: filters.state.status } : {}),
    },
    { skip: isStaffView || !organizationId }
  );

  const liveData = isStaffView
    ? staffAppraisalsQuery.currentData
    : organizationAppraisalsQuery.data;
  const isLoading = isStaffView
    ? staffAppraisalsQuery.isLoading
    : organizationAppraisalsQuery.isLoading;
  const isFetching = isStaffView
    ? staffAppraisalsQuery.isFetching
    : organizationAppraisalsQuery.isFetching;
  const isError = isStaffView ? staffAppraisalsQuery.isError : organizationAppraisalsQuery.isError;
  const error = isStaffView ? staffAppraisalsQuery.error : organizationAppraisalsQuery.error;
  const refetch = isStaffView ? staffAppraisalsQuery.refetch : organizationAppraisalsQuery.refetch;

  const rawList = useMemo(() => {
    if (Array.isArray(liveData)) return liveData;
    if (Array.isArray(liveData?.data)) return liveData.data;
    if (isStaffView) return [];
    return _mockAppraisals;
  }, [liveData, isStaffView]);

  const counts = liveData?.meta?.counts ?? {};
  const compliance = liveData?.meta?.compliance;
  const totalRecords =
    liveData?.meta?.totalRecords ?? liveData?.total ?? rawList.length;

  const statusFilterField = useMemo(
    () =>
      createFilterField.status({
        options: isStaffView
          ? [{ value: 'all', label: 'All' }, ...STAFF_APPRAISAL_STATUS_OPTIONS]
          : STATUS_OPTIONS,
        showCounts: true,
      }),
    [isStaffView]
  );
  const toolbarFilterFields = useMemo(() => {
    const fields = FILTER_FIELDS.filter((field) => field.type !== 'status');
    return isStaffView
      ? fields.map((field) =>
          field.type === 'search' ? { ...field, placeholder: 'Search appraisals...' } : field
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

  const filteredRows = useMemo(() => {
    if (isStaffView) return rawList;

    let rows = rawList;
    if (filters.state.status !== 'all') {
      rows = rows.filter((row) => getAppraisalRowStatus(row) === filters.state.status);
    }
    if (trimmedKeyword && rawList === _mockAppraisals) {
      rows = rows.filter((row) => {
        const name = row.name || row.staffName || '';
        return name.toLowerCase().includes(trimmedKeyword.toLowerCase());
      });
    }
    return rows;
  }, [rawList, filters.state.status, trimmedKeyword, isStaffView]);

  const paginatedRows = useMemo(() => {
    // If backend did not paginate (e.g. mock fallback)
    if (rawList === _mockAppraisals) {
      return filteredRows.slice(
        table.page * table.rowsPerPage,
        table.page * table.rowsPerPage + table.rowsPerPage
      );
    }
    return filteredRows;
  }, [filteredRows, rawList, table.page, table.rowsPerPage]);

  const effectiveTotal = useMemo(() => {
    if (isStaffView) return Number(totalRecords) || filteredRows.length;

    if (filters.state.status === 'all') {
      return getListStatusTabCount(counts, 'all', totalRecords);
    }
    return typeof counts[filters.state.status] === 'number'
      ? counts[filters.state.status]
      : filteredRows.length;
  }, [isStaffView, filters.state.status, counts, totalRecords, filteredRows.length]);

  const getStatusCount = useCallback(
    (statusValue) => getListStatusTabCount(counts, statusValue, totalRecords),
    [counts, totalRecords]
  );

  const canReset = !!filters.state.name || filters.state.status !== 'all';

  const handleOpenBook = (row = null) => {
    setSelectedRow(row);
    bookModal.onTrue();
  };

  const handleOpenLog = (row = null) => {
    setSelectedRow(row);
    logModal.onTrue();
  };

  const handleOpenComplete = (row = null) => {
    setSelectedRow(row);
    completeModal.onTrue();
  };

  const handleOpenSignOff = (row = null) => {
    const rowId = row?._id || row?.id || row?.staffId;
    let signOffPath = paths.lineManager.appraisalSignOff(rowId);
    if (basePath) {
      signOffPath = `${basePath}/${rowId}/sign-off`;
    } else if (pathname.startsWith('/site-manager')) {
      signOffPath = paths.siteManager.appraisalSignOff(rowId);
    } else if (pathname.startsWith('/owner-dashboard')) {
      signOffPath = paths.owner.appraisalSignOff(rowId);
    }
    router.push(signOffPath);
  };

  const handleSaveBook = () => {
    refetch();
    bookModal.onFalse();
    setSelectedRow(null);
  };

  const handleSaveComplete = () => {
    refetch();
    completeModal.onFalse();
    setSelectedRow(null);
  };

  const handleExportCSV = useCallback(() => {
    if (isStaffView) {
      downloadCsvFromApi(
        API_ROUTES.APP_APPRAISALS,
        'appraisals.csv',
        {
          search: trimmedKeyword || undefined,
          status: filters.state.status !== 'all' ? filters.state.status : undefined,
        },
        organizationId
      );
    } else {
      if (!organizationId) return;
      downloadCsvFromApi(
        API_ROUTES.ORGANIZATION_APPRAISALS(organizationId),
        'appraisals.csv',
        {
          search: trimmedKeyword || undefined,
          status: filters.state.status !== 'all' ? filters.state.status : undefined,
          branchId: userBranchId && userBranchId !== 'all' ? userBranchId : undefined,
        },
        organizationId
      );
    }
  }, [isStaffView, organizationId, trimmedKeyword, filters.state.status, userBranchId]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={heading}
        links={[
          { name: 'Dashboard', href: dashboardHref },
          { name: 'Appraisals' },
        ]}
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
            {!isStaffView && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="solar:calendar-add-bold" />}
                onClick={() => handleOpenBook(null)}
              >
                Book Appraisal
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
          </Stack>
        }
        sx={{ mb: 3 }}
      />

      {isStaffView && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <DataUsageSummaryCard
              title="Score"
              total={`${compliance?.score ?? 0}%`}
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
              title="Review interval"
              total={compliance?.intervalMonths != null ? `${compliance.intervalMonths} Months` : '—'}
              color="primary"
              icon="solar:calendar-bold-duotone"
              loading={isStaffView && (isLoading || isFetching)}
              sx={{ minHeight: 124 }}
            />
          </Grid>
        </Grid>
      )}

      <Card>
        {isStaffView && !isStaffRole && (
          <Alert severity="error" sx={{ m: 2 }}>
            Your account is not associated with a staff membership.
          </Alert>
        )}
        {isError && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error?.data?.message || error?.error || 'Failed to load appraisals.'}
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
                      <TableRow key={`appraisal-skeleton-${rowIndex}`}>
                        {/* Sr# */}
                        <TableCell sx={{ py: table.dense ? 0.8 : 1.5 }}>
                          <Skeleton variant="rounded" height={table.dense ? 16 : 18} width={24} />
                        </TableCell>
                        {/* Staff Member */}
                        <TableCell sx={{ py: table.dense ? 0.8 : 1.5 }}>
                          <Stack spacing={0.5}>
                            <Skeleton variant="rounded" height={table.dense ? 16 : 18} width={140} />
                            <Skeleton variant="rounded" height={12} width={180} />
                          </Stack>
                        </TableCell>
                        {/* Review Period */}
                        <TableCell sx={{ py: table.dense ? 0.8 : 1.5 }}>
                          <Skeleton variant="rounded" height={table.dense ? 16 : 18} width={120} />
                        </TableCell>
                        {/* Last Review */}
                        <TableCell sx={{ py: table.dense ? 0.8 : 1.5 }}>
                          <Skeleton variant="rounded" height={table.dense ? 16 : 18} width={100} />
                        </TableCell>
                        {/* Next Due */}
                        <TableCell sx={{ py: table.dense ? 0.8 : 1.5 }}>
                          <Skeleton variant="rounded" height={table.dense ? 16 : 18} width={100} />
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
                      {paginatedRows.map((row, index) => (
                        <AppraisalTableRow
                          key={row.staffId || row._id || row.id || index}
                          row={row}
                          serialNumber={table.page * table.rowsPerPage + index + 1}
                          onBook={() => handleOpenBook(row)}
                          onComplete={() => handleOpenComplete(row)}
                          onSignOff={() => handleOpenSignOff(row)}
                          basePath={basePath}
                          readOnly={isStaffView}
                        />
                      ))}

                      <TableNoData notFound={!filteredRows.length} title="No appraisals found" />
                    </>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            page={table.page}
            count={rawList === _mockAppraisals ? filteredRows.length : effectiveTotal}
            dense={table.dense}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            onChangeDense={table.onChangeDense}
          />
        </Box>
      </Card>

      {!isStaffView && (
        <>
          <BookAppraisalDialog
            open={bookModal.value}
            row={selectedRow}
            organizationId={organizationId}
            branchId={userBranchId}
            onClose={() => {
              bookModal.onFalse();
              setSelectedRow(null);
            }}
            onSave={handleSaveBook}
          />

          <LogAppraisalDialog
            open={logModal.value}
            row={selectedRow}
            onClose={() => {
              logModal.onFalse();
              setSelectedRow(null);
            }}
            onSave={() => {
              refetch();
              logModal.onFalse();
              setSelectedRow(null);
            }}
          />

          <CompleteAppraisalDialog
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
            type="appraisal"
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

AppraisalListView.propTypes = {
  dashboardHref: PropTypes.string,
  heading: PropTypes.string,
  branchId: PropTypes.string,
  basePath: PropTypes.string,
  showTabs: PropTypes.bool,
};

export default AppraisalListView;