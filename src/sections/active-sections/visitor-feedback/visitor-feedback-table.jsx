import { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { CONFIG } from 'src/config-global';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { Scrollbar } from 'src/components/scrollbar';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useSetState } from 'src/hooks/use-set-state';
import { usePathname, useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { useGetVisitorSurveyResponsesQuery } from 'src/store/Reducer/visitor-survey-api';
import { selectUser } from 'src/store/slices/userSlice';
import { getUserBranchId } from 'src/utils/organization';

import VisitorFeedbackTableRow from './visitor-feedback-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 56 },
  { id: 'visitor', label: 'Visitor', minWidth: 180 },
  { id: 'site', label: 'Site', minWidth: 160 },
  { id: 'host', label: 'Host', minWidth: 180 },
  { id: 'submitted', label: 'Submitted', minWidth: 140 },
  { id: 'actions', label: 'Action', align: 'center', width: 88 },
];

const FILTER_FIELDS = [
  createFilterField.search({ placeholder: 'Search visitor...' }),
];

const summaryIcon = (name) => `${CONFIG.site.basePath}/assets/icons/navbar/${name}.svg`;

// ----------------------------------------------------------------------

export function VisitorFeedbackTable({ ownerDashboard = false, selectedBranchId }) {
  const router = useRouter();
  const pathname = usePathname();
  const table = useTable({ defaultDense: true });
  const user = useSelector(selectUser);
  const { organizationId } = useCurrentOrganization();
  const userBranchId =
    getUserBranchId(user, organizationId) || user?.branchId?._id || user?.branchId;
  const branchId = ownerDashboard ? selectedBranchId : userBranchId;

  const filters = useSetState({ name: '' });

  useEffect(() => {
    table.onResetPage();
  }, [selectedBranchId, table.onResetPage]);

  const { data: responseData, isLoading, isFetching } = useGetVisitorSurveyResponsesQuery(
    {
      organizationId,
      branchId: branchId && branchId !== 'all' ? branchId : undefined,
      page: table.page + 1,
      limit: table.rowsPerPage,
      search: filters.state.name ? filters.state.name.trim() : undefined,
    },
    { skip: !organizationId }
  );

  const rawFeedbackList = responseData?.data || [];
  const totalRecords = responseData?.meta?.totalRecords || rawFeedbackList.length;
  const summary = responseData?.meta?.summary;
  const isSummaryCardsLoading = Boolean(
    organizationId && !summary && (isLoading || isFetching)
  );
  const averageRating =
    typeof summary?.averageRating === 'number' && Number.isFinite(summary.averageRating)
      ? `${summary.averageRating.toFixed(1)} / 5`
      : '—';

  const summaryCards = [
    {
      title: 'Total responses',
      total: summary?.totalResponses ?? responseData?.meta?.totalRecords ?? '—',
      color: 'primary',
      icon: summaryIcon('ic-feedback'),
    },
    {
      title: 'Average rating',
      total: averageRating,
      color: 'warning',
      icon: summaryIcon('ic-analytics'),
    },
    {
      title: 'Rated count',
      total: summary?.ratedCount ?? '—',
      color: 'success',
      icon: summaryIcon('ic-check'),
    },
    {
      title: 'With comments',
      total: summary?.withComments ?? '—',
      color: 'info',
      icon: summaryIcon('ic-chat'),
    },
  ];

  // Client-side search enhancement
  const filteredFeedback = useMemo(() => {
    const search = filters.state.name.trim().toLowerCase();
    if (!search) return rawFeedbackList;

    return rawFeedbackList.filter((item) => {
      const visitor = (item.visitorName || '').toLowerCase();
      const host = (item.hostName || item.host || '').toLowerCase();
      const branch = (item.branchName || item.site || '').toLowerCase();
      const comment = (item.comments || item.comment || '').toLowerCase();
      return (
        visitor.includes(search) ||
        host.includes(search) ||
        branch.includes(search) ||
        comment.includes(search)
      );
    });
  }, [rawFeedbackList, filters.state.name]);

  const handleSearchChange = (event) => {
    table.onResetPage();
    filters.setState({ name: event.target.value });
  };

  const handleViewRow = (row) => {
    const rowId = row._id || row.id;
    if (rowId) {
      const detailHref = ownerDashboard
        ? paths.owner.feedbackDetail(rowId)
        : pathname.includes('/line-manager')
          ? paths.lineManager.feedbackDetail(rowId)
          : paths.siteManager.feedbackDetail(rowId);
      router.push(detailHref, {
        state: ownerDashboard ? { feedback: row, branchId } : { feedback: row },
      });
    }
  };

  return (
    <>
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {summaryCards.map((summaryCard) => (
          <Grid key={summaryCard.title} xs={12} sm={6} md={3}>
            {isSummaryCardsLoading ? (
              <Skeleton variant="rounded" height={124} sx={{ borderRadius: 2 }} />
            ) : (
              <CourseWidgetSummary {...summaryCard} />
            )}
          </Grid>
        ))}
      </Grid>

      <Card>
        <FlexibleTableToolbar
          filterFields={FILTER_FIELDS}
          filterValues={filters.state}
          onFilterChange={(key, value) => filters.setState({ [key]: value })}
          onSearchChange={handleSearchChange}
        />

        {isFetching && !isLoading && <LinearProgress sx={{ height: 2 }} />}

        <TableContainer sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 880 }}>
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {isLoading ? (
                  <TableBodySkeleton rowCount={table.rowsPerPage} cellCount={6} dense={table.dense} />
                ) : (
                  <>
                    {filteredFeedback.map((row, index) => (
                      <VisitorFeedbackTableRow
                        key={row._id || row.id || index}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                        onView={() => handleViewRow(row)}
                      />
                    ))}

                    <TableNoData notFound={!filteredFeedback.length} />
                  </>
                )}
              </TableBody>
            </Table>
          </Scrollbar>

          <TablePaginationCustom
            page={table.page}
            count={totalRecords}
            dense={table.dense}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            onChangeDense={table.onChangeDense}
          />
        </TableContainer>
      </Card>
    </>
  );
}
