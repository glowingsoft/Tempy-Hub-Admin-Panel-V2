import { useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

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
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { RouterLink } from 'src/routes/components';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import {
  useGetFamilyInvitationsQuery,
  useGetFamilyRelationshipsQuery,
} from 'src/store/Reducer/family-invitations-api';

import { FamilyInvitationActionDialog } from './family-invitation-action-dialog';
import { FamilyInvitationTableRow } from './family-invitation-table-row';
import { useFamilyInvitationActions } from './use-family-invitation-actions';
import { FAMILY_INVITATION_STATUS_OPTIONS, getInvitationId } from './utils';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'name', label: 'Invited Member', minWidth: 200 },
  { id: 'relationship', label: 'Relationship', minWidth: 140 },
  { id: 'resident', label: 'Resident', minWidth: 180 },
  { id: 'status', label: 'Status', width: 120, align: 'center' },
  { id: 'createdAt', label: 'Started At', width: 130 },
  { id: 'actions', label: 'Actions', width: 140, align: 'center' },
];

const FILTER_FIELDS = [
  createFilterField.status({ options: FAMILY_INVITATION_STATUS_OPTIONS, showCounts: true }),
  createFilterField.search({ placeholder: 'Search name, email, or resident...' }),
];

export function FamilyInvitationListView() {
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });
  const familyPaths = useFamilyEngagementPaths();
  const { organizationId } = useCurrentOrganization();

  const filters = useSetState({
    search: '',
    status: 'all',
  });
  const trimmedKeyword = useDebounce(filters.state.search, 400).trim();
  const { status } = filters.state;

  const { data: relationshipOptions = [] } = useGetFamilyRelationshipsQuery();

  const { data, isLoading, isFetching, isError } = useGetFamilyInvitationsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(status && status !== 'all' ? { status } : {}),
      ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
    },
    { skip: !organizationId }
  );

  const invitations = data?.data ?? [];
  const statusCounts = data?.meta?.counts ?? {};
  const totalRecords = data?.meta?.totalRecords ?? invitations.length;
  const loading = isLoading || isFetching;

  const { resend, askRevoke, confirmProps } = useFamilyInvitationActions({ organizationId });

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((field) => field.type === 'status'),
    []
  );
  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((field) => field.type !== 'status'),
    []
  );

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

  const newPath = familyPaths.familyMemberships?.invitations?.new || '#';

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Invitations"
        links={[
          { name: 'Dashboard', href: familyPaths.dashboardRoot },
          { name: 'Family Engagement', href: familyPaths.familyOverview || familyPaths.dashboardRoot },
          { name: 'Memberships', href: familyPaths.familyMemberships?.invitations?.root },
          { name: 'Invitations' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={newPath}
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Invite Family Member
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
              <TableHeadCustom headLabel={TABLE_HEAD} />

              <TableBody>
                {loading ? (
                  <TableBodySkeleton
                    rowCount={table.rowsPerPage}
                    cellCount={TABLE_HEAD.length}
                    dense={table.dense}
                  />
                ) : (
                  <>
                    {invitations.map((row, index) => {
                      const invitationId = getInvitationId(row);
                      return (
                        <FamilyInvitationTableRow
                          key={invitationId}
                          row={row}
                          serialNumber={table.page * table.rowsPerPage + index + 1}
                          relationshipOptions={relationshipOptions}
                          onResend={resend}
                          onRevoke={askRevoke}
                          detailPath={
                            familyPaths.familyMemberships?.invitations?.detail(invitationId) || '#'
                          }
                          editPath={
                            familyPaths.familyMemberships?.invitations?.edit(invitationId) || '#'
                          }
                        />
                      );
                    })}

                    <TableNoData
                      notFound={!invitations.length}
                      title={isError ? 'Unable to load invitations' : 'No invitations found'}
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

      <FamilyInvitationActionDialog {...confirmProps} />
    </DashboardContent>
  );
}
