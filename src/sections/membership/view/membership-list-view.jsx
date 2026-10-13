import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

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

import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';
import { useGetInvitationsQuery } from 'src/store/Reducer/invitations-api';
import { MEMBERSHIP_STATUS_OPTIONS, mockInvitationsResponse } from '../mocks/data';
import { useInvitationActions } from '../use-invitation-actions';
import { InvitationActionDialog } from '../invitation-action-dialog';
import { MembershipTableRow } from '../membership-table-row';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  ...MEMBERSHIP_STATUS_OPTIONS,
];

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'name', label: 'Name', minWidth: 200 },
  { id: 'role', label: 'Role', minWidth: 120 },
  { id: 'branch', label: 'Site', minWidth: 140 },
  { id: 'jobTitle', label: 'Job Title', minWidth: 140 },
  { id: 'departments', label: 'Departments', minWidth: 160 },
  { id: 'startDate', label: 'Start Date', width: 130 },
  { id: 'status', label: 'Status', width: 120, align: 'center' },
  { id: 'createdAt', label: 'Created', width: 130 },
  { id: 'actions', label: 'Actions', width: 140, align: 'center' },
];

const FILTER_FIELDS = [
  createFilterField.status({ options: STATUS_OPTIONS, showCounts: true }),
  createFilterField.search({ placeholder: 'Search name or email...' }),
];

// ----------------------------------------------------------------------

export function MembershipListView() {
  const table = useTable({ defaultOrderBy: 'createdAt', defaultOrder: 'desc' });

  const { organizationId, organizationName: orgName } = useCurrentOrganization();
  const { branchesMap, jobTitlesMap, departmentsMap } = useOrganizationLookups(organizationId);

  const filters = useSetState({ search: '', status: 'all' });
  const keyword = useDebounce(filters.state.search, 500);

  const [reloadKey, setReloadKey] = useState(0);
  const refresh = useCallback(() => setReloadKey((key) => key + 1), []);

  const { resend, askRevoke, askDelete, confirmProps } = useInvitationActions({
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
  const {
    data: apiData,
    isLoading,
    isFetching,
    isError,
    error: apiError,
  } = useGetInvitationsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      status: filters.state.status,
      keyword,
    },
    { skip: !organizationId }
  );
  const usesApi = Boolean(organizationId);
  const data = usesApi ? apiData : mockInvitationsResponse;

  const allInvitations = useMemo(
    () =>
      (data?.data ?? []).filter(
        (invitation) => !organizationId || invitation.organizationId === organizationId
      ),
    [data, organizationId, reloadKey]
  );

  const mockFilteredInvitations = useMemo(() => {
    const search = keyword.trim().toLowerCase();

    return allInvitations.filter((invitation) => {
      const matchesStatus =
        filters.state.status === 'all' || invitation.status === filters.state.status;

      const matchesSearch =
        !search ||
        invitation.name?.toLowerCase().includes(search) ||
        invitation.email?.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  }, [allInvitations, filters.state.status, keyword]);

  const mockPageInvitations = useMemo(() => {
    const start = table.page * table.rowsPerPage;
    return mockFilteredInvitations.slice(start, start + table.rowsPerPage);
  }, [mockFilteredInvitations, table.page, table.rowsPerPage]);

  const paginatedInvitations = usesApi ? allInvitations : mockPageInvitations;
  const totalRecords = usesApi
    ? apiData?.meta?.totalRecords ?? apiData?.data?.length ?? 0
    : mockFilteredInvitations.length;

  const getStatusCount = useCallback(
    (status) =>
      status === 'all'
        ? allInvitations.length
        : allInvitations.filter((invitation) => invitation.status === status).length,
    [allInvitations]
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
        heading="Invitations"
        links={[
          { name: 'Dashboard', href: paths.owner.root },
          { name: 'Memberships' },
          { name: 'Invitations' },
          ...(orgName ? [{ name: orgName }] : []),
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.owner.memberships.invitations.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Invitation
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        {isError && (
          <Alert severity="error">
            {apiError?.data?.message || 'Unable to load invitations. Please try again.'}
          </Alert>
        )}

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
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1080 }}>
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
                    {paginatedInvitations.map((row, index) => (
                      <MembershipTableRow
                        key={row._id}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                        onResend={resend}
                        onRevoke={askRevoke}
                        onDelete={askDelete}
                        branchesMap={branchesMap}
                        jobTitlesMap={jobTitlesMap}
                        departmentsMap={departmentsMap}
                      />
                    ))}

                    <TableNoData notFound={notFound} title="No invitations yet" />
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

      <InvitationActionDialog {...confirmProps} />
    </DashboardContent>
  );
}
