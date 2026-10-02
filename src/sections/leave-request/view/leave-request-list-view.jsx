import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

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
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  TableSkeleton,
  useTable,
} from 'src/components/table';

// import { useGetLeaveRequestsQuery } from 'src/store/Reducer/leave-requests-api';
import { LEAVE_REQUEST_STATUS_OPTIONS, mockLeaveRequestsResponse } from '../mocks/data';
import {
  getLeaveRequestContext,
  getLeaveRequestStaffName,
  getOwnerOrganizationId,
  getOwnerOrganizationName,
} from '../utils';
import { useLeaveRequestActions } from '../use-leave-request-actions';
import { LeaveRequestActionDialog } from '../leave-request-action-dialog';
import { LeaveEntitlementModal } from '../leave-entitlement-modal';
import { LeaveRequestTableRow } from '../leave-request-table-row';
import { OwnerBranchFilterActions, useOwnerBranchFilter } from 'src/sections/branch/owner-branch-select';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  ...LEAVE_REQUEST_STATUS_OPTIONS,
];

// Client feedback: Approve/Reject needs to be reachable without scrolling
// the table every time. Reason and Requested-date are still one click away
// via "View", and Start / End / Days collapse into a single Dates column,
// so the table fits without horizontal scroll on a normal laptop screen —
// Actions stays in its usual place at the end of the row.
const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'staff', label: 'Staff', minWidth: 200 },
  { id: 'branch', label: 'Site', minWidth: 140 },
  { id: 'leaveType', label: 'Leave Type', width: 120 },
  { id: 'dates', label: 'Dates', minWidth: 170 },
  { id: 'status', label: 'Status', width: 120, align: 'center' },
  { id: 'actions', label: 'Actions', width: 120, align: 'center' },
];

// TODO: confirm whether the list endpoint supports a keyword/search param — the
// search below is client-side only against the current page of mock data.
const FILTER_FIELDS = [
  createFilterField.status({ options: STATUS_OPTIONS, showCounts: true }),
  createFilterField.search({ placeholder: 'Search staff or reason...' }),
];

// ----------------------------------------------------------------------

/**
 * One listing for both the Owner Dashboard and the Line Manager "Leave Approval"
 * screen.
 *
 * @param {'owner' | 'lineManager'} variant
 * @param {boolean} [canSetEntitlement] - overrides the per-variant default
 *   (owner: true, line manager: false — the owner grants this). Approve + Reject
 *   are always available on both surfaces.
 */
export function LeaveRequestListView({ variant = 'owner', canSetEntitlement, ownerDashboard = variant === 'owner' }) {
  const ctx = useMemo(() => getLeaveRequestContext(variant), [variant]);
  const showEntitlement = canSetEntitlement ?? ctx.defaultCanSetEntitlement;

  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });

  const { user } = useSelector((state) => state.user);
  const organizationId = getOwnerOrganizationId(user);
  const orgName = getOwnerOrganizationName(user);
  const { branchId, onBranchChange } = useOwnerBranchFilter();

  const filters = useSetState({ search: '', status: 'all' });
  const keyword = useDebounce(filters.state.search, 500);

  const entitlementModal = useBoolean();
  const [reloadKey, setReloadKey] = useState(0);
  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  const { askApprove, askReject, dialogProps } = useLeaveRequestActions({
    organizationId,
    onChanged: refresh,
  });

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((field) => field.type === 'status'),
    []
  );
  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((field) => field.type !== 'status'),
    []
  );

  // --- Data source ---------------------------------------------------------
  // TODO: swap for the real query once the endpoint is wired up:
  // const { data, isLoading, isFetching } = useGetLeaveRequestsQuery(
  //   { organizationId, page: table.page + 1, limit: table.rowsPerPage, status: filters.state.status },
  //   { skip: !organizationId }
  // );
  const isLoading = false;
  const isFetching = false;
  const data = mockLeaveRequestsResponse;

  const allRequests = useMemo(
    () =>
      (data?.data ?? []).filter(
        (request) =>
          (!organizationId || request.organizationId === organizationId) &&
          (!ownerDashboard || branchId === 'all' || request.branchId === branchId)
      ),
    [branchId, data, organizationId, ownerDashboard, reloadKey]
  );

  // Client-side filtering (mock only — the API filters server-side).
  const filteredRequests = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return allRequests.filter((request) => {
      const matchesStatus =
        filters.state.status === 'all' || request.status === filters.state.status;

      const matchesSearch =
        !search ||
        getLeaveRequestStaffName(request).toLowerCase().includes(search) ||
        request.staff?.email?.toLowerCase().includes(search) ||
        request.reason?.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [allRequests, filters.state.status, keyword]);

  // Pagination metadata (mirrors the API `meta`).
  const totalRecords = filteredRequests.length;
  const paginatedRequests = useMemo(() => {
    const start = table.page * table.rowsPerPage;
    return filteredRequests.slice(start, start + table.rowsPerPage);
  }, [filteredRequests, table.page, table.rowsPerPage]);

  const getStatusCount = useCallback(
    (status) =>
      status === 'all'
        ? allRequests.length
        : allRequests.filter((request) => request.status === status).length,
    [allRequests]
  );

  const notFound = !isLoading && !isFetching && totalRecords === 0;

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
            value={filters.state.status}
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
              <TableHeadCustom order={table.order} orderBy={table.orderBy} headLabel={TABLE_HEAD} />

              <TableBody>
                {isLoading || isFetching ? (
                  [...Array(table.rowsPerPage)].map((_, index) => <TableSkeleton key={index} />)
                ) : (
                  <>
                    {paginatedRequests.map((row, index) => (
                      <LeaveRequestTableRow
                        key={row._id}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                        detailHref={ctx.detailHref}
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
