import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';
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

import { Iconify } from 'src/components/iconify';
import { getListStatusTabCount } from 'src/utils/table-utils';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import { BranchActivationCodeModal } from '../branch-activation-code-modal';
import { BranchEmergencyPinModal } from '../branch-emergency-pin-modal';
import { BranchTableRow } from '../branch-table-row';
import { BRANCH_STATUS_OPTIONS } from '../mocks/data';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All', color: 'default' }, ...BRANCH_STATUS_OPTIONS];
const ROWS_PER_PAGE = 10;

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 56 },
  { id: 'name', label: 'Name', minWidth: 180 },
  { id: 'code', label: 'Code', width: 140 },
  { id: 'address', label: 'Address', width: 280 },
  { id: 'status', label: 'Status', width: 160, align: 'center' },
  { id: 'createdAt', label: 'Created At', width: 140, align: 'center' },
  { id: 'actions', label: 'Actions', width: 164, align: 'center' },
];

const FILTER_FIELDS = [
  createFilterField.status({ options: STATUS_OPTIONS, showCounts: true }),
  createFilterField.search({ placeholder: 'Search site...' }),
];

// ----------------------------------------------------------------------

export function BranchListView() {
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: ROWS_PER_PAGE,
  });

  const { organizationId = '', organizationName = '', user } = useCurrentOrganization();

  const pinModal = useBoolean();
  const activationModal = useBoolean();
  const [selectedBranch, setSelectedBranch] = useState(null);

  const filters = useSetState({ search: '', status: 'all' });
  const keyword = useDebounce(filters.state.search, 500);
  const trimmedKeyword = keyword.trim();

  const { data, isLoading, isFetching } = useGetBranchesQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
      ...(filters.state.status !== 'all' ? { status: filters.state.status } : {}),
    },
    { skip: !organizationId }
  );

  const branches = useMemo(() => data?.data ?? [], [data]);
  const totalRecords = data?.meta?.totalRecords ?? branches.length;
  const statusCounts = data?.meta?.counts ?? {};

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((field) => field.type === 'status'),
    []
  );
  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((field) => field.type !== 'status'),
    []
  );

  const getStatusCount = useCallback(
    (status) => getListStatusTabCount(statusCounts, status, totalRecords),
    [statusCounts, totalRecords]
  );

  const notFound = !isLoading && !isFetching && branches.length === 0;

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

  const handleOpenEmergencyPin = useCallback(
    (branch) => {
      setSelectedBranch(branch);
      pinModal.onTrue();
    },
    [pinModal]
  );

  const handleCloseEmergencyPin = useCallback(() => {
    pinModal.onFalse();
    setSelectedBranch(null);
  }, [pinModal]);

  const handleOpenActivationCode = useCallback(
    (branch) => {
      setSelectedBranch(branch);
      activationModal.onTrue();
    },
    [activationModal]
  );

  const handleCloseActivationCode = useCallback(() => {
    activationModal.onFalse();
    setSelectedBranch(null);
  }, [activationModal]);

  const orgName = organizationName || user?.organization?.name;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Sites"
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Sites' },
          ...(orgName ? [{ name: orgName }] : []),
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.owner.sites.new}
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Site
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
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

        <Box sx={{ position: 'relative', width: 1, minWidth: 0 }}>
          <Scrollbar sx={{ width: 1 }}>
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
                    {branches.map((row, index) => (
                      <BranchTableRow
                        key={row._id}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                        onEmergencyPin={handleOpenEmergencyPin}
                        onActivationCode={handleOpenActivationCode}
                      />
                    ))}

                    <TableNoData notFound={notFound} />
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

      <BranchEmergencyPinModal
        open={pinModal.value}
        onClose={handleCloseEmergencyPin}
        branch={selectedBranch}
        organizationId={organizationId}
      />

      <BranchActivationCodeModal
        open={activationModal.value}
        onClose={handleCloseActivationCode}
        branch={selectedBranch}
        organizationId={organizationId}
      />
    </DashboardContent>
  );
}
