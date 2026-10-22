import { useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Scrollbar } from 'src/components/scrollbar';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';

import { useTempyConnection } from 'src/sections/tempy-connection/use-tempy-connection';
import { useGetShiftClaimsQuery } from 'src/store/Reducer/shift-claims-api';

import { SHIFT_CLAIM_STATUS_OPTIONS } from '../mocks/data';
import { ShiftClaimActionDialog } from '../shift-claim-action-dialog';
import { ShiftClaimTableRow } from '../shift-claim-table-row';
import { useShiftClaimActions } from '../use-shift-claim-actions';
import { getShiftClaimStaffName } from '../utils';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  ...SHIFT_CLAIM_STATUS_OPTIONS,
];

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'branch', label: 'Site', minWidth: 140 },
  { id: 'staff', label: 'Staff', minWidth: 180 },
  { id: 'startsAt', label: 'Start Date/Time', minWidth: 170 },
  { id: 'endsAt', label: 'End Date/Time', minWidth: 170 },
  { id: 'status', label: 'Status', width: 120, align: 'center' },
  { id: 'approvedBy', label: 'Approved By', minWidth: 150, align: 'center' },
  { id: 'createdAt', label: 'Created', width: 130 },
  { id: 'actions', label: 'Actions', width: 90, align: 'center' },
];

const FILTER_FIELDS = [
  createFilterField.status({ options: STATUS_OPTIONS, showCounts: true }),
  createFilterField.search({ placeholder: 'Search site or staff...' }),
];

// ----------------------------------------------------------------------

export function ShiftClaimListView() {
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });

  const { organizationId, organizationName: orgName } = useCurrentOrganization();

  const filters = useSetState({ search: '', status: 'all' });
  const keyword = useDebounce(filters.state.search, 500);
  const trimmedKeyword = keyword.trim();
  const { status } = filters.state;

  const { data, isLoading, isFetching, refetch } = useGetShiftClaimsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
      ...(status && status !== 'all' ? { status } : {}),
    },
    { skip: !organizationId }
  );

  const { askApprove, confirmProps } = useShiftClaimActions({
    organizationId,
    onChanged: refetch,
  });

  const { connected: tempyConnected, requestShift } = useTempyConnection();

  const handleSendToTempy = useCallback(
    (row) => {
      requestShift({
        site: row.branch?.name,
        role: getShiftClaimStaffName(row),
        startsAt: row.shift?.startsAt || row.startsAt,
        endsAt: row.shift?.endsAt || row.endsAt,
        urgentCover: row.urgentCover ?? row.shift?.urgentCover,
        notes: `Sent from Shift Claim ${row._id}`,
      });
    },
    [requestShift]
  );

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((field) => field.type === 'status'),
    []
  );
  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((field) => field.type !== 'status'),
    []
  );

  const claims = useMemo(() => data?.data ?? [], [data]);
  const meta = data?.meta ?? {};
  const statusCounts = meta.counts ?? {};
  const totalRecords = meta.totalRecords ?? claims.length;

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

  const notFound = !isLoading && !isFetching && claims.length === 0;

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
        heading="Shift Claims"
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Rota' },
          { name: 'Shift Claims' },
          ...(orgName ? [{ name: orgName }] : []),
        ]}
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
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1200 }}>
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
                    {claims.map((row, index) => (
                      <ShiftClaimTableRow
                        key={row._id}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                        onApprove={askApprove}
                        onSendToTempy={handleSendToTempy}
                        tempyConnected={tempyConnected}
                      />
                    ))}

                    <TableNoData notFound={notFound} title="No shift claims yet" />
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

      <ShiftClaimActionDialog {...confirmProps} />
    </DashboardContent>
  );
}
