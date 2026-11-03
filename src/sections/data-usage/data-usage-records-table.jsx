import { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { Scrollbar } from 'src/components/scrollbar';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import { useDebounce } from 'src/hooks/use-debounce';
import { useGetBillingUsageQuery } from 'src/store/Reducer/billing-api';

import { DataUsageTableRow } from './data-usage-table-row';
import { DataUsageTableToolbar } from './data-usage-table-toolbar';
import { getBillingSortParam, mapUsageListRow } from './utils';

// ----------------------------------------------------------------------

export function DataUsageRecordsTable({
  organizationId,
  headerOrganizationId,
  showOrgFilter = false,
  organizations = [],
  selectedOrg = 'all',
  onOrgChange,
  onViewDetail,
  onEdit,
  disableRowClick = false,
  nameColumnLabel,
}) {
  const table = useTable({ defaultOrderBy: 'totalUsedGb', defaultOrder: 'desc' });
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading, isFetching, isError } = useGetBillingUsageQuery({
    page: table.page + 1,
    limit: table.rowsPerPage,
    keyword: debouncedSearch,
    sort: getBillingSortParam(table.orderBy, table.order),
    organizationId,
    headerOrganizationId,
  });

  const meta = data?.meta ?? {};
  const rows = useMemo(() => (data?.data ?? []).map(mapUsageListRow), [data]);

  const tableHead = useMemo(
    () => [
      {
        id: 'name',
        label: nameColumnLabel || (rows.some((row) => row.isSite) ? 'Site' : 'Organization'),
        minWidth: 240,
      },
      { id: 'totalUsedGb', label: 'Total Used', minWidth: 140 },
      { id: 'imageUsageGb', label: 'Image Usage', minWidth: 160 },
      { id: 'otherFilesGb', label: 'Other Files', minWidth: 140 },
      { id: 'usagePercentage', label: 'Usage %', minWidth: 180 },
      { id: 'actions', label: 'Actions', width: 80, align: 'right' },
    ],
    [nameColumnLabel, rows]
  );

  const handleSearchChange = useCallback(
    (value) => {
      setSearchQuery(value);
      table.onResetPage();
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    onOrgChange?.('all');
    setSearchQuery('');
    table.onResetPage();
  }, [onOrgChange, table]);

  const handleOrgChange = useCallback(
    (orgId) => {
      onOrgChange?.(orgId);
      table.onResetPage();
    },
    [onOrgChange, table]
  );

  const canReset = (showOrgFilter && selectedOrg !== 'all') || !!searchQuery;
  const loading = isLoading || isFetching;
  const notFound = !loading && !rows.length;
  const totalRecords = meta.totalRecords ?? rows.length;

  return (
    <Card>
      <DataUsageTableToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedOrg={selectedOrg}
        onOrgChange={handleOrgChange}
        organizations={organizations}
        showOrgFilter={showOrgFilter}
        onResetFilters={handleResetFilters}
        canReset={canReset}
      />

      <Box sx={{ position: 'relative' }}>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={tableHead}
              rowCount={rows.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
            />

            <TableBody>
              {loading ? (
                <TableBodySkeleton
                  rowCount={table.rowsPerPage}
                  cellCount={tableHead.length}
                  dense={table.dense}
                />
              ) : (
                <>
                  {rows.map((row) => (
                    <DataUsageTableRow
                      key={row.id}
                      row={row}
                      clickable={!disableRowClick}
                      onViewDetail={onViewDetail}
                      onEdit={onEdit}
                    />
                  ))}

                  <TableNoData
                    notFound={notFound}
                    title={isError ? 'Unable to load usage' : 'No records found'}
                    subTitle={
                      isError
                        ? 'Billing & usage could not be loaded. Try again shortly.'
                        : debouncedSearch
                          ? `No records match the search term "${debouncedSearch}".`
                          : 'No data usage records currently available.'
                    }
                  />
                </>
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </Box>

      <TablePaginationCustom
        count={totalRecords}
        page={table.page}
        rowsPerPage={table.rowsPerPage}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
        dense={table.dense}
        onChangeDense={table.onChangeDense}
      />
    </Card>
  );
}

DataUsageRecordsTable.propTypes = {
  organizationId: PropTypes.string,
  headerOrganizationId: PropTypes.string,
  showOrgFilter: PropTypes.bool,
  organizations: PropTypes.array,
  selectedOrg: PropTypes.string,
  onOrgChange: PropTypes.func,
  onViewDetail: PropTypes.func,
  onEdit: PropTypes.func,
  disableRowClick: PropTypes.bool,
  nameColumnLabel: PropTypes.string,
};
