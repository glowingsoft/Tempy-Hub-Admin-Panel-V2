import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';
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

import { useGetOrganizationsQuery } from 'src/store/Reducer/organizations-api';
import {
  createMockOrganization,
  ORGANIZATION_STATUS_OPTIONS,
} from '../mocks/data';
import { canEditOrganization } from '../utils';
import { ConfigureModulesDialog } from '../configure-modules-dialog';
import { OrganizationCreateEditModal } from '../organization-create-edit-modal';
import { OrganizationTableRow } from '../organization-table-row';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  ...ORGANIZATION_STATUS_OPTIONS,
];
const ROWS_PER_PAGE = 10;

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'name', label: 'Organization', minWidth: 220 },
  { id: 'ownerName', label: 'Owner', minWidth: 160 },
  { id: 'ownerEmail', label: 'Owner Email', minWidth: 200 },
  { id: 'status', label: 'Status', width: 120, align: 'center' },
  { id: 'createdAt', label: 'Created At', width: 180 },
  { id: 'actions', label: 'Actions', width: 100, align: 'center' },
];

const FILTER_FIELDS = [
  createFilterField.status({ options: STATUS_OPTIONS, showCounts: true }),
  createFilterField.search({ placeholder: 'Search organization or owner...' }),
];

// ----------------------------------------------------------------------

export function OrganizationListView() {
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: ROWS_PER_PAGE,
    defaultOrderBy: 'createdAt',
    defaultOrder: 'desc',
  });
  const router = useRouter();

  const { user } = useCurrentOrganization();
  const canEdit = canEditOrganization(user);

  const filters = useSetState({ search: '', status: 'all' });

  const keyword = useDebounce(filters.state.search, 500);

  const createModal = useBoolean();
  const editModal = useBoolean();
  const configureModulesDialog = useBoolean();
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [createdOrganization, setCreatedOrganization] = useState(null);

  // --- Data source ---------------------------------------------------------
  const { data, isLoading, isFetching } = useGetOrganizationsQuery({
    page: table.page + 1,
    limit: table.rowsPerPage,
    keyword: keyword ? keyword.trim() : undefined,
    status: filters.state.status !== 'all' ? filters.state.status : undefined,
  });

  const organizations = useMemo(() => data?.data ?? [], [data]);
  const totalRecords = data?.meta?.totalRecords ?? organizations.length;
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
    (status) => {
      if (status === 'all') {
        const totalFromCounts = Object.values(statusCounts).reduce(
          (sum, count) => sum + (Number(count) || 0),
          0
        );
        return totalFromCounts || totalRecords;
      }

      return statusCounts[status] ?? 0;
    },
    [statusCounts, totalRecords]
  );

  const notFound = !isLoading && !isFetching && organizations.length === 0;

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
    (organization) => {
      setSelectedOrganization(organization);
      editModal.onTrue();
    },
    [editModal]
  );

  const handleCloseEdit = useCallback(() => {
    editModal.onFalse();
    setSelectedOrganization(null);
  }, [editModal]);

  // After a successful create, ask whether to configure modules now.
  const handleCreateSuccess = useCallback(
    (response) => {
      const organization = response?._id ? response : createMockOrganization(response);
      setCreatedOrganization(organization);
      configureModulesDialog.onTrue();
    },
    [configureModulesDialog]
  );

  const handleConfigureNow = useCallback(() => {
    configureModulesDialog.onFalse();
    if (createdOrganization) {
      router.push(
        `${paths.dashboard.organizations.detail(createdOrganization._id)}?tab=module-access`
      );
    }
    setCreatedOrganization(null);
  }, [configureModulesDialog, createdOrganization, router]);

  const handleConfigureLater = useCallback(() => {
    configureModulesDialog.onFalse();
    setCreatedOrganization(null);
  }, [configureModulesDialog]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Organizations"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Organizations' },
        ]}
        action={
          <Button
            variant="contained"
            color="primary"
            onClick={createModal.onTrue}
          // startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Organization
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
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
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
                    {organizations.map((row, index) => (
                      <OrganizationTableRow
                        key={row._id}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                        canEdit={canEdit}
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

      <OrganizationCreateEditModal
        open={createModal.value}
        onClose={createModal.onFalse}
        currentOrganization={null}
        onSuccess={handleCreateSuccess}
      />

      <OrganizationCreateEditModal
        open={editModal.value}
        onClose={handleCloseEdit}
        currentOrganization={selectedOrganization}
      />

      <ConfigureModulesDialog
        open={configureModulesDialog.value}
        onClose={handleConfigureLater}
        onConfigureNow={handleConfigureNow}
        onLater={handleConfigureLater}
      />
    </DashboardContent>
  );
}
