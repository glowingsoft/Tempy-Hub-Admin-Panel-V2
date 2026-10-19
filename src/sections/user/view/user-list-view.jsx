import { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';

import { useBoolean } from 'src/hooks/use-boolean';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useDebounce } from 'src/hooks/use-debounce';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';
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

import { useGetExternalPeopleQuery } from 'src/store/Reducer/general-directory-api';
import QuickAddUserModal from '../quick-add-user-modal';
import QuickStatusChangeModal from '../user-status-dialog';
import { UserTableRow } from '../user-table-row';

// ----------------------------------------------------------------------

const USER_TYPE_OPTION = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'visitor', label: 'Visitors' },
  { value: 'contractor', label: 'Contractors' },
  { value: 'professional', label: 'Professionals' },
];

const SITE_STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  { value: 'onSite', label: 'On Site', color: 'success' },
  { value: 'offSite', label: 'Off Site', color: 'default' },
];

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
    key: 'siteStatus',
    options: SITE_STATUS_OPTIONS,
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
];

const SITE_STATUS_LABEL = {
  onSite: 'On Site',
  offSite: 'Off Site',
};

// ----------------------------------------------------------------------

export function UserListView() {
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });

  const location = useLocation();
  const { organizationId } = useCurrentOrganization();
  const { branchOptions: siteOptions, departmentOptions, getBranchName } = useOrganizationLookups({
    organizationId,
    jobTitles: false,
    departments: true,
    limit: 100,
  });
  const isOwnerDirectory = location.pathname.startsWith(paths.owner.root);

  const filters = useSetState({
    search: '',
    siteStatus: 'all',
    branchId: 'all',
    departmentId: 'all',
    userType: 'all',
  });

  const [currentUser, setCurrentUser] = useState(null);
  const openStatusChangeModal = useBoolean();
  const openModal = useBoolean();

  const keyword = useDebounce(filters.state.search, 500);
  const trimmedKeyword = keyword.trim();

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((field) => field.type === 'status'),
    []
  );

  const { branchId, departmentId, userType, siteStatus } = filters.state;

  const { data, isLoading, isFetching } = useGetExternalPeopleQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
      ...(branchId && branchId !== 'all' ? { branchId } : {}),
      ...(departmentId && departmentId !== 'all' ? { departmentId } : {}),
      ...(userType && userType !== 'all' ? { type: userType } : {}),
      ...(siteStatus && siteStatus !== 'all' ? { siteStatus } : {}),
    },
    { skip: !organizationId }
  );

  const apiUsers = data?.data || [];
  const meta = data?.meta || {};
  const siteStatusCounts = meta.counts || {};
  const totalRecords = meta.totalRecords ?? apiUsers.length;

  const branchOptions = useMemo(
    () => [{ value: 'all', label: 'All Sites' }, ...siteOptions],
    [siteOptions]
  );

  const departmentFilterOptions = useMemo(
    () => [{ value: 'all', label: 'All Departments' }, ...departmentOptions],
    [departmentOptions]
  );

  const tableData = apiUsers.map((user) => ({
    id: user._id,
    image: user.photoUrl || user.image,
    name: user.name,
    email: user.email,
    phone: user.phone,
    carRegistration: user.carRegistration || '',
    role: user.type ? user.type.charAt(0).toUpperCase() + user.type.slice(1) : '—',
    department: user.department?.name || '—',
    branchId: user.branchId,
    branch: user.branch?.name || getBranchName(user),
    status: SITE_STATUS_LABEL[user.siteStatus] || user.siteStatus || '—',
    siteStatus: user.siteStatus,
  }));

  const getStatusCount = useCallback(
    (status) => {
      if (status === 'all') {
        const totalFromCounts = Object.values(siteStatusCounts).reduce(
          (sum, count) => sum + (Number(count) || 0),
          0
        );
        return totalFromCounts || totalRecords;
      }

      return siteStatusCounts[status] ?? 0;
    },
    [siteStatusCounts, totalRecords]
  );

  const notFound = !isLoading && !isFetching && tableData.length === 0;

  const handleEditRow = useCallback(
    (user) => {
      setCurrentUser(user);
      openStatusChangeModal.onTrue();
    },
    [openStatusChangeModal]
  );

  const handleCloseStatusChangeModal = useCallback(() => {
    openStatusChangeModal.onFalse();
    setCurrentUser(null);
  }, [openStatusChangeModal]);

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
        key: 'departmentId',
        label: 'Department',
        options: departmentFilterOptions,
        defaultValue: 'all',
      }),
    ],
    [branchOptions, departmentFilterOptions]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="General Directory"
        links={[
          { name: 'Dashboard', href: isOwnerDirectory ? paths.owner.root : paths.siteManager.root },
          {
            name: 'Directory',
            href: isOwnerDirectory ? paths.owner.directory.root : paths.siteManager.directory.root,
          },
          { name: 'List' },
        ]}
        action={
          <Stack direction={{ md: 'row', xs: 'column' }} spacing={1.5}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Iconify icon="solar:export-bold" />}
              onClick={() => { }}
            >
              Export to CSV
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={openModal.onTrue}
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Add Employee
            </Button>
          </Stack>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <StatusTabsFilterWrapper
          filterField={statusFilterField}
          value={filters.state.siteStatus}
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
                    {tableData.map((row, index) => (
                      <UserTableRow
                        key={row.id}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                        selected={table.selected.includes(row.id)}
                        onEditRow={() => handleEditRow(row)}
                      />
                    ))}

                    <TableNoData notFound={notFound} />
                  </>
                )}
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
          count={totalRecords}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <QuickAddUserModal open={openModal.value} onClose={openModal.onFalse} currentUser={{}} />
    </DashboardContent>
  );
}
