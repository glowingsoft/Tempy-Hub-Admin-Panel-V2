import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';

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

// import { useGetDepartmentsQuery } from 'src/store/Reducer/departments-api';
import { createMockDepartment, mockDepartmentsResponse } from '../mocks/data';
import { getOwnerOrganizationId } from '../utils';
import { DepartmentCreateEditModal } from '../department-create-edit-modal';
import { DepartmentTableRow } from '../department-table-row';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'default' },
];

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'name', label: 'Name', minWidth: 220 },
  { id: 'sortOrder', label: 'Sort Order', width: 120, align: 'center' },
  { id: 'status', label: 'Status', width: 120, align: 'center' },
  { id: 'actions', label: 'Actions', width: 100, align: 'center' },
];

const FILTER_FIELDS = [
  createFilterField.status({ options: STATUS_OPTIONS, showCounts: true }),
  createFilterField.search({ placeholder: 'Search department...' }),
];

// ----------------------------------------------------------------------

export function DepartmentListView() {
  const table = useTable({ defaultOrderBy: 'sortOrder', defaultOrder: 'asc' });

  const { user } = useSelector((state) => state.user);
  const organizationId = getOwnerOrganizationId(user);

  const filters = useSetState({ search: '', status: 'all' });
  const keyword = useDebounce(filters.state.search, 500);

  const createModal = useBoolean();
  const editModal = useBoolean();
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // --- Data source ---------------------------------------------------------
  // TODO: swap for the real query once the endpoint is wired up:
  // const { data, isLoading, isFetching } = useGetDepartmentsQuery(
  //   { organizationId, page: table.page + 1, limit: table.rowsPerPage },
  //   { skip: !organizationId }
  // );
  const isLoading = false;
  const isFetching = false;
  const data = mockDepartmentsResponse;

  // Departments are scoped to the owner's organization.
  // `reloadKey` bumps after a mock create/edit so the mutated list re-renders.
  const allDepartments = useMemo(
    () => (data?.data ?? []).filter((d) => !organizationId || d.organizationId === organizationId),
    [data, organizationId, reloadKey]
  );

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((field) => field.type === 'status'),
    []
  );
  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((field) => field.type !== 'status'),
    []
  );

  // Client-side filtering (mock only — the API will do this server-side).
  const filteredDepartments = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return allDepartments
      .filter((department) => {
        const matchesStatus =
          filters.state.status === 'all' ||
          (filters.state.status === 'active') === !!department.isActive;

        const matchesSearch = !search || department.name?.toLowerCase().includes(search);

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [allDepartments, filters.state.status, keyword]);

  const totalRecords = filteredDepartments.length;

  const paginatedDepartments = useMemo(() => {
    const start = table.page * table.rowsPerPage;
    return filteredDepartments.slice(start, start + table.rowsPerPage);
  }, [filteredDepartments, table.page, table.rowsPerPage]);

  const getStatusCount = useCallback(
    (status) => {
      if (status === 'all') return allDepartments.length;
      if (status === 'active') return allDepartments.filter((d) => d.isActive).length;
      return allDepartments.filter((d) => !d.isActive).length;
    },
    [allDepartments]
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

  const handleCreateSuccess = useCallback((payload) => {
    createMockDepartment(payload);
    setReloadKey((key) => key + 1);
  }, []);

  const orgName = user?.organization?.name;

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
            onClick={createModal.onTrue}
            disabled={!organizationId}
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Department
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

        <Box sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
              />

              <TableBody>
                {isLoading || isFetching ? (
                  [...Array(table.rowsPerPage)].map((_, index) => (
                    <TableSkeleton key={index} />
                  ))
                ) : (
                  <>
                    {paginatedDepartments.map((row, index) => (
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
