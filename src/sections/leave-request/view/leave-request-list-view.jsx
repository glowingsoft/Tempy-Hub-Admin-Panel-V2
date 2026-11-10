import { useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { OwnerBranchFilterActions, useOwnerBranchFilter } from 'src/sections/branch/owner-branch-select';
import { useGetLeaveRequestsQuery } from 'src/store/Reducer/leave-requests-api';
import { LeaveEntitlementModal } from '../leave-entitlement-modal';
import { LeaveRequestActionDialog } from '../leave-request-action-dialog';
import { LeaveRequestTableRow } from '../leave-request-table-row';
import { LEAVE_REQUEST_STATUS_OPTIONS } from '../mocks/data';
import { useLeaveRequestActions } from '../use-leave-request-actions';
import { getLeaveRequestContext } from '../utils';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  ...LEAVE_REQUEST_STATUS_OPTIONS,
];

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'staff', label: 'Staff', minWidth: 200 },
  { id: 'branch', label: 'Site', minWidth: 140 },
  { id: 'leaveType', label: 'Leave Type', width: 120 },
  { id: 'dates', label: 'Dates', minWidth: 170 },
  { id: 'status', label: 'Status', width: 120, align: 'center' },
  { id: 'actions', label: 'Actions', width: 120 },
];

const FILTER_FIELDS = [
  createFilterField.status({ options: STATUS_OPTIONS, showCounts: true }),
  createFilterField.search({ placeholder: 'Search staff or reason...' }),
];

// ----------------------------------------------------------------------

/**
 * One listing for both the Owner Dashboard and the Line Manager "Leave Approval"
 * screen.
 *
 * @param {'owner' | 'lineManager' | 'siteManager'} variant
 * @param {boolean} [canSetEntitlement] - overrides the per-variant default
 *   (owner: true, line manager: false — the owner grants this). Approve + Reject
 *   are always available on both surfaces.
 */
export function LeaveRequestListView({
  variant = 'owner',
  canSetEntitlement,
  ownerDashboard = variant === 'owner',
}) {
  const ctx = useMemo(() => getLeaveRequestContext(variant), [variant]);
  const showEntitlement = canSetEntitlement ?? ctx.defaultCanSetEntitlement;

  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });

  const { organizationId, organizationName: orgName } = useCurrentOrganization();
  const { branchId, onBranchChange } = useOwnerBranchFilter();

  const filters = useSetState({ search: '', status: 'all' });
  const keyword = useDebounce(filters.state.search, 500);
  const trimmedKeyword = keyword.trim();
  const { status } = filters.state;

  const entitlementModal = useBoolean();

  const { data, isLoading, isFetching, refetch } = useGetLeaveRequestsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
      ...(status && status !== 'all' ? { status } : {}),
      ...(ownerDashboard && branchId && branchId !== 'all' ? { branchId } : {}),
    },
    { skip: !organizationId }
  );

  const { askApprove, askReject, dialogProps } = useLeaveRequestActions({
    organizationId,
    onChanged: refetch,
  });

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((field) => field.type === 'status'),
    []
  );
  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((field) => field.type !== 'status'),
    []
  );

  const requests = useMemo(() => data?.data ?? [], [data]);
  const meta = data?.meta ?? {};
  const statusCounts = meta.counts ?? {};
  const totalRecords = meta.totalRecords ?? requests.length;

  const detailHref = useCallback(
    (rowId) => {
      const base = ctx.detailHref(rowId);
      return organizationId ? `${base}?orgId=${organizationId}` : base;
    },
    [ctx, organizationId]
  );

  const getStatusCount = useCallback(
    (tabStatus) => {
      if (tabStatus === 'all') {
        const totalFromCounts = Object.values(statusCounts).reduce(
          (sum, count) => sum + (Number(count) || 0),
          0
        );
        return totalFromCounts || totalRecords;
      }

      return statusCounts[tabStatus] ?? 0;
    },
    [statusCounts, totalRecords]
  );

  const notFound = !isLoading && !isFetching && requests.length === 0;

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
    <DashboardContent>
      <CustomBreadcrumbs
        heading={ctx.heading}
        links={[
          { name: 'Dashboard', href: ctx.dashboardHref },
          { name: ctx.heading },
          ...(orgName ? [{ name: orgName }] : []),
        ]}
        action={
          ownerDashboard ? (
            <OwnerBranchFilterActions value={branchId} onChange={onBranchChange}>
              {showEntitlement && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={entitlementModal.onTrue}
                  startIcon={<Iconify icon="solar:calendar-mark-bold" />}
                >
                  Set Entitlement
                </Button>
              )}
            </OwnerBranchFilterActions>
          ) : (
            showEntitlement && (
              <Button
                variant="contained"
                color="primary"
                onClick={entitlementModal.onTrue}
                startIcon={<Iconify icon="solar:calendar-mark-bold" />}
              >
                Set Entitlement
              </Button>
            )
          )
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        {statusFilterField && (
          <StatusTabsFilterWrapper
            filterField={statusFilterField}
            value={status}
            onChange={handleFilterChange}
            getCount={getStatusCount}
          />
        )}

        <FlexibleTableToolbar
          filterFields={toolbarFilterFields}
          filterValues={filters.state}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
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
                    {requests.map((row, index) => (
                      <LeaveRequestTableRow
                        key={row._id}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                        detailHref={detailHref}
                        onApprove={askApprove}
                        onReject={askReject}
                      />
                    ))}

                    <TableNoData notFound={notFound} title="No leave requests yet" />
                  </>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={totalRecords}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      {showEntitlement && (
        <LeaveEntitlementModal
          open={entitlementModal.value}
          onClose={entitlementModal.onFalse}
          organizationId={organizationId}
        />
      )}

      <LeaveRequestActionDialog {...dialogProps} />
    </DashboardContent>
  );
}
