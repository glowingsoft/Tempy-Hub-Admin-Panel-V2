import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { USER_STATUS_OPTIONS } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable
} from 'src/components/table';

import { UserTableFiltersResult } from '../user-table-filters-result';
import { UserTableRow } from '../user-table-row';
// import { useGetUsersQuery } from 'src/store/Reducer/user-api';
import { Stack } from '@mui/material';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { useDebounce } from 'src/hooks/use-debounce';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';
import { useGetExternalPeopleQuery } from 'src/store/Reducer/general-directory-api';
import QuickAddUserModal from '../quick-add-user-modal';
import UserLoadingSkeleton from '../user-loading-skeleton';
import QuickStatusChangeModal from '../user-status-dialog';

// ----------------------------------------------------------------------

const USER_TYPE_OPTION = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'visitor', label: 'Visitors' },
  { value: 'contractor', label: 'Contractors' },
];
const DEPARTMENT_OPTION = [
  { value: 'all', label: 'All' },
  { value: 'management', label: 'Management' },
  { value: 'accounting', label: 'Accounting' },
  { value: 'sales', label: 'Sales' },
  { value: 'support', label: 'Support' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'activities', label: 'Activities' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'administrative', label: 'Administrative' },
];
const SITE_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'onSite', label: 'On Site' },
  { value: 'offSite', label: 'Off Site' },
];


const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 60 },
  { id: 'name', label: 'Name', minWidth: 220 },
  { id: 'branch', label: 'Site', minWidth: 180 },
  { id: 'role', label: 'Role', minWidth: 180 },
  { id: 'department', label: 'Department', minWidth: 160 },
  { id: 'status', label: 'Status', width: 120, align: 'center' },
  { id: 'actions', label: 'Actions', width: 100, align: 'center' },
];

const FILTER_FIELDS = [
  createFilterField.status({
    options: STATUS_OPTIONS,
    showCounts: true,
  }),

  createFilterField.search({
    placeholder: 'Search ...',
  }),
  createFilterField.select({
    key: 'userType',
    label: 'User Type',
    options: USER_TYPE_OPTION,
    defaultValue: 'all',
  }),

  createFilterField.select({
    key: 'department',
    label: 'Department',
    options: DEPARTMENT_OPTION,
    defaultValue: 'all',
  }),
];

const DEFAULT_FILTERS = FILTER_FIELDS.reduce((acc, field) => {
  acc[field.key] = field.defaultValue;
  return acc;
}, {})
// ----------------------------------------------------------------------

export function UserListView() {

  const table = useTable();
  const location = useLocation();
  const { organizationId } = useCurrentOrganization();
  const { branchOptions: siteOptions, getBranchName } = useOrganizationLookups({
    organizationId,
    jobTitles: false,
    departments: false,
    limit: 100,
  });
  const isOwnerDirectory = location.pathname.startsWith(paths.owner.root);

  const filters = useSetState({
    search: '',
    status: 'all',
    branchId: 'all',
    siteStatus: 'all',
  });

  const [currentUser, setCurrentUser] = useState(null);

  const openStatusChangeModal = useBoolean();

  const openModal = useBoolean();

  const keyword = useDebounce(filters.state.search, 500);

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((f) => f.type === 'status'),
    []
  );

  const { branchId, userType } = filters.state;

  const { data, isLoading, isFetching } = useGetExternalPeopleQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      branchId: branchId && branchId !== 'all' ? branchId : undefined,
      type: userType && userType !== 'all' ? userType : undefined,
    },
    { skip: !organizationId }
  );

  const apiUsers = data?.data || [];

  const branchOptions = useMemo(
    () => [{ value: 'all', label: 'All Sites' }, ...siteOptions],
    [siteOptions]
  );

  const meta = data?.meta || {};

  const tableData = apiUsers
    .map((user) => ({
      id: user._id,
      image: user.image,
      name: user.name,
      email: user.email,
      phone: user.phone,
      carRegistration: user.carRegistration || '',
      // The "Role" column shows the external person type (visitor / contractor).
      role: user.type ? user.type.charAt(0).toUpperCase() + user.type.slice(1) : '—',
      department: user.department?.name || '—',
      branchId: user.branchId,
      branch: getBranchName(user),
      status: user.status || 'Active',
      indicators: {
        attendance: user.indicators?.attendance || 'Good',
        performance: user.indicators?.performance || 'Good',
      },
      lastSeen: user.lastSeen || '—',
    }));

  const getStatusCount = useCallback((status) => {
    const statusCounts = meta?.usersCount || {};
    if (status === 'all') {
      return statusCounts.total || meta?.totalRecords || 0;
    }


    return statusCounts[status] || 0;
  },
    [meta]
  );


  const filteredTableData = useMemo(() => {
    const search = filters.state.search.trim().toLowerCase();

    return tableData.filter((user) => {
      const matchesSearch =
        !search ||
        user.name?.toLowerCase().includes(search) ||
        user.email?.toLowerCase().includes(search) ||
        user.role?.toLowerCase().includes(search) ||
        user.department?.toLowerCase().includes(search);
      const matchesStatus =
        filters.state.status === 'all' || user.status === filters.state.status;
      const matchesSiteStatus =
        filters.state.siteStatus === 'all' ||
        (filters.state.siteStatus === 'onSite' && user.status === 'On site') ||
        (filters.state.siteStatus === 'offSite' && user.status !== 'On site');
      return matchesSearch && matchesStatus && matchesSiteStatus;
    });
  }, [filters.state.search, filters.state.siteStatus, filters.state.status, tableData]);

  const canReset =
    !!filters.state.search ||
    filters.state.status !== 'all' ||
    filters.state.siteStatus !== 'all';

  const handleEditRow = useCallback((user) => {
    setCurrentUser(user);
    openStatusChangeModal.onTrue();
  }, [openStatusChangeModal]);

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      filters.setState({ status: newValue });
    },
    [filters, table]
  );

  const handleCloseStatusChangeModal = useCallback(() => {
    openStatusChangeModal.onFalse();
    setCurrentUser(null);
  }, [openStatusChangeModal]);

  const handleFilterChange = useCallback((key, value) => {
    table.onResetPage();
    filters.setState({ [key]: value });
  }, [filters, table]);

  const handleSearchChange = useCallback((event) => {
    table.onResetPage();
    filters.setState({ search: event.target.value });
  }, [filters, table]);

  const toolbarFilterFields = useMemo(
    () => [
      ...FILTER_FIELDS.filter((field) => field.type !== 'status'),
      createFilterField.select({
        key: 'branchId',
        label: 'Sites',
        options: branchOptions,
        defaultValue: 'all',
      }),
      createFilterField.select({
        key: 'siteStatus',
        label: 'Site Status',
        options: SITE_STATUS_OPTIONS,
        defaultValue: 'all',
      }),
    ],
    [branchOptions]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="List"
        links={[
          { name: 'Dashboard', href: isOwnerDirectory ? paths.owner.root : paths.siteManager.root },
          {
            name: 'Directory',
            href: isOwnerDirectory ? paths.owner.directory.root : paths.siteManager.directory.root,
          },
          { name: 'List' },
        ]}
        action={<Stack direction={{ md: "row", xs: "column" }} spacing={1.5}>
          <Button variant="outlined" startIcon={<Iconify icon="solar:export-bold" />} onClick={() => { }}>
            Export to CSV
          </Button>
          <Button variant="contained"
            onClick={openModal.onTrue}
            startIcon={<Iconify icon="mingcute:add-line" />} >
            Add Employee
          </Button>
        </Stack>}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>

        <StatusTabsFilterWrapper
          filterField={statusFilterField}
          value={filters.state.status}
          onChange={handleFilterChange}
          getCount={getStatusCount}
        />


        {/* Toolbar with Search */}
        <FlexibleTableToolbar
          filterFields={toolbarFilterFields}
          filterValues={filters.state}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
        />

        {canReset && (
          <UserTableFiltersResult
            filters={filters}
            totalResults={meta?.totalRecords || 0}
            onResetPage={table.onResetPage}
            sx={{ p: 2.5, pt: 0 }}
          />
        )}

        <Box sx={{ position: 'relative' }}>

          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                numSelected={table.selected.length}
              />

              <TableBody>
                {(isLoading || isFetching) ?
                  <UserLoadingSkeleton />
                  : filteredTableData?.length > 0 ? filteredTableData.map((row, index) => (
                    <UserTableRow
                      key={row.id}
                      row={row}
                      serialNumber={index + 1 + (table.page * table.rowsPerPage)}
                      selected={table.selected.includes(row.id)}
                      onEditRow={() => handleEditRow(row)}
                    />
                  )) :
                    <TableNoData notFound />
                }

              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <QuickStatusChangeModal
          open={openStatusChangeModal.value}
          onClose={handleCloseStatusChangeModal}
          currentUser={currentUser}
        />

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={meta?.totalRecords || 0}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <QuickAddUserModal
        open={openModal.value}
        onClose={openModal.onFalse}
        currentUser={{}}
      />

    </DashboardContent>
  )
}