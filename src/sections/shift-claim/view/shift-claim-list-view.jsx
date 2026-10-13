import { useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';

import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
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

import { useGetShiftClaimsQuery } from 'src/store/Reducer/shift-claims-api';
import { useTempyConnection } from 'src/sections/tempy-connection/use-tempy-connection';

import { SHIFT_CLAIM_STATUS_OPTIONS } from '../mocks/data';
import { getShiftClaimStaffName } from '../utils';
import { useShiftClaimActions } from '../use-shift-claim-actions';
import { ShiftClaimActionDialog } from '../shift-claim-action-dialog';
import { ShiftClaimTableRow } from '../shift-claim-table-row';

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
  { id: 'visibility', label: 'Visibility', width: 120 },
  { id: 'urgentCover', label: 'Urgent Cover', width: 120, align: 'center' },
  { id: 'createdAt', label: 'Created', width: 130 },
  { id: 'actions', label: 'Actions', width: 90, align: 'center' },
];

const FILTER_FIELDS = [
  createFilterField.status({ options: STATUS_OPTIONS, showCounts: true }),
  createFilterField.search({ placeholder: 'Search site or staff...' }),
];

// ----------------------------------------------------------------------

export function ShiftClaimListView() {
  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });

  const { organizationId, organizationName: orgName } = useCurrentOrganization();

  const filters = useSetState({ search: '', status: 'all' });
  const keyword = useDebounce(filters.state.search, 500);

  const {
    data: apiResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetShiftClaimsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      status: filters.state.status,
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
        startsAt: row.startsAt,
        endsAt: row.endsAt,
        urgentCover: row.urgentCover,
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

  const allClaims = useMemo(
    () => apiResponse?.data ?? [],
    [apiResponse]
  );

  // Client-side filtering for keyword search across staff & site
  const filteredClaims = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return allClaims.filter((claim) => {
      const matchesStatus = filters.state.status === 'all' || claim.status === filters.state.status;

      const matchesSearch =
        !search ||
        claim.branch?.name?.toLowerCase().includes(search) ||
        getShiftClaimStaffName(claim).toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [allClaims, filters.state.status, keyword]);

  const totalRecords = apiResponse?.meta?.totalRecords ?? filteredClaims.length;

  const paginatedClaims = useMemo(() => {
    if (keyword.trim()) {
      const start = table.page * table.rowsPerPage;
      return filteredClaims.slice(start, start + table.rowsPerPage);
    }
    return allClaims;
  }, [allClaims, filteredClaims, keyword, table.page, table.rowsPerPage]);

  const getStatusCount = useCallback(
    (status) =>
      status === 'all'
        ? (apiResponse?.meta?.totalRecords ?? allClaims.length)
        : allClaims.filter((claim) => claim.status === status).length,
    [allClaims, apiResponse]
  );

  const notFound = !isLoading && !isFetching && (paginatedClaims.length === 0 || totalRecords === 0);

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
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1200 }}>
              <TableHeadCustom order={table.order} orderBy={table.orderBy} headLabel={TABLE_HEAD} />

              <TableBody>
                {isLoading || isFetching ? (
                  [...Array(table.rowsPerPage)].map((_, index) => <TableSkeleton key={index} />)
                ) : (
                  <>
                    {paginatedClaims.map((row, index) => (
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
