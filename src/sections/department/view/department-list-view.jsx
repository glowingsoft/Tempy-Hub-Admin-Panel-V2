import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';

import { getListStatusTabCount } from 'src/utils/table-utils';
import { useGetDepartmentsQuery } from 'src/store/Reducer/departments-api';
import { DepartmentCreateEditModal } from '../department-create-edit-modal';
import { DepartmentTableRow } from '../department-table-row';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'error' },
];

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 56 },
  { id: 'name', label: 'Name', minWidth: 180 },
  { id: 'branch', label: 'Site', minWidth: 160 },
  { id: 'createdAt', label: 'Created At', width: 140, align: 'center' },
  { id: 'status', label: 'Status', width: 120, align: 'center' },
  { id: 'actions', label: 'Actions', width: 100, align: 'center' },
];

const FILTER_FIELDS = [
  createFilterField.status({ options: STATUS_OPTIONS, showCounts: true }),
  createFilterField.search({ placeholder: 'Search department...' }),
];

// ----------------------------------------------------------------------

export function DepartmentListView() {
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });

  const { organizationId, organizationName, user } = useCurrentOrganization();

  const filters = useSetState({ search: '', status: 'all' });
  const keyword = useDebounce(filters.state.search, 500);
  const trimmedKeyword = keyword.trim();

  const createModal = useBoolean();
  const editModal = useBoolean();
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const { data, isLoading, isFetching, isError, error } = useGetDepartmentsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
      ...(filters.state.status !== 'all' ? { status: filters.state.status } : {}),
    },
    { skip: !organizationId }
  );

  const departments = useMemo(() => data?.data ?? [], [data]);
  const totalRecords = data?.meta?.totalRecords ?? departments.length;
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

  const notFound = !isLoading && !isFetching && departments.length === 0;

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

  const handleOpenEdit = useCallback(
    (department) => {
      setSelectedDepartment(department);
      editModal.onTrue();
    },
    [editModal]
  );

  const handleCloseEdit = useCallback(() => {
    editModal.onFalse();
    setSelectedDepartment(null);
  }, [editModal]);

  const handleCreateSuccess = useCallback(() => table.onResetPage(), [table.onResetPage]);

  const orgName = organizationName || user?.organization?.name;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Departments"
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Departments' },
          ...(orgName ? [{ name: orgName }] : []),
        ]}
        action={
          <Button
            variant="contained"
            color="primary"
            onClick={createModal.onTrue}
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Department
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        {isError && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error?.data?.message || error?.error || 'Failed to load departments.'}
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
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
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
                    {departments.map((row, index) => (
                      <DepartmentTableRow
                        key={row._id}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                        onEditRow={() => handleOpenEdit(row)}
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

      <DepartmentCreateEditModal
        open={createModal.value}
        onClose={createModal.onFalse}
        organizationId={organizationId}
        currentDepartment={null}
        onSuccess={handleCreateSuccess}
      />

      <DepartmentCreateEditModal
        open={editModal.value}
        onClose={handleCloseEdit}
        organizationId={organizationId}
        currentDepartment={selectedDepartment}
      />
    </DashboardContent>
  );
}
