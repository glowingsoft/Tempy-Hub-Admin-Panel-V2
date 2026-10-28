import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

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
import { exportToCSV, exportToPDF } from 'src/utils/export-helper';
import { useGetAppraisalsQuery } from 'src/store/Reducer/appraisals-api';

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
    (pathname.startsWith(paths.siteManager.root)
      ? paths.siteManager.root
      : pathname.startsWith(paths.owner.root)
        ? paths.owner.root
        : paths.lineManager.root);
  const { organizationId, user } = useCurrentOrganization();
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
  const {
    data: liveData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetAppraisalsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(userBranchId ? { branchId: userBranchId } : {}),
      ...(trimmedKeyword ? { keyword: trimmedKeyword, search: trimmedKeyword } : {}),
      ...(filters.state.status !== 'all' ? { status: filters.state.status } : {}),
    },
    { skip: !organizationId }
  );

  const rawList = useMemo(() => {
    if (Array.isArray(liveData)) return liveData;
    if (Array.isArray(liveData?.data)) return liveData.data;
    return _mockAppraisals;
  }, [liveData]);

  const counts = liveData?.meta?.counts ?? {};
  const totalRecords =
    liveData?.meta?.totalRecords ?? liveData?.total ?? rawList.length;

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
  }, [rawList, filters.state.status, trimmedKeyword]);

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
    if (filters.state.status === 'all') {
      const sumFromCounts = APPRAISAL_STATUS_OPTIONS.reduce(
        (sum, opt) => sum + (Number(counts[opt.value]) || 0),
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
        const sumFromCounts = APPRAISAL_STATUS_OPTIONS.reduce(
          (sum, opt) => sum + (Number(counts[opt.value]) || 0),
          0
        );
        return sumFromCounts || totalRecords;
      }
      return counts[statusValue] ?? 0;
    },
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
    const exportData = filteredRows.map((row) => ({
      Name: row.name || row.staffName || '—',
      Period: row.period || row.periodLabel || '—',
      'Last Review': row.lastReview || row.lastCompletedAt || '—',
      'Next Due': row.nextDue || row.nextDueAt || row.scheduledAt || '—',
      Status: getAppraisalRowStatus(row),
    }));
    exportToCSV(exportData, 'staff-appraisals-report.csv');
  }, [filteredRows]);

  const handleExportPDF = useCallback(() => {
    const columns = [
      { id: 'name', label: 'Staff Member' },
      { id: 'period', label: 'Review Period' },
      { id: 'lastReview', label: 'Last Review' },
      { id: 'nextDue', label: 'Next Due' },
      { id: 'status', label: 'Status' },
    ];
    const mapped = filteredRows.map((r) => ({
      ...r,
      name: r.name || r.staffName || '—',
      period: r.period || r.periodLabel || '—',
      lastReview: r.lastReview || r.lastCompletedAt || '—',
      nextDue: r.nextDue || r.nextDueAt || r.scheduledAt || '—',
      status: getAppraisalRowStatus(r),
    }));
    exportToPDF('Appraisals Report', columns, mapped);
  }, [filteredRows]);

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
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:calendar-add-bold" />}
              onClick={() => handleOpenBook(null)}
            >
              Book Appraisal
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

      <Card>
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
                      {paginatedRows.map((row, index) => (
                        <AppraisalTableRow
                          key={row.staffId || row._id || row.id || index}
                          row={row}
                          serialNumber={table.page * table.rowsPerPage + index + 1}
                          onBook={() => handleOpenBook(row)}
                          onComplete={() => handleOpenComplete(row)}
                          onSignOff={() => handleOpenSignOff(row)}
                          basePath={basePath}
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