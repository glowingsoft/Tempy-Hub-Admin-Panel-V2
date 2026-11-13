import { useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

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
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { getListStatusTabCount } from 'src/utils/table-utils';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import { useGetFamilyRelationshipsQuery } from 'src/store/Reducer/family-invitations-api';
import { useGetFamilyMembersQuery } from 'src/store/Reducer/family-members-api';

import { FamilyMemberActionDialog } from './family-member-action-dialog';
import { FamilyMemberTableRow } from './family-member-table-row';
import { useFamilyMemberActions } from './use-family-member-actions';
import { FAMILY_MEMBER_STATUS_OPTIONS, getFamilyMemberId } from './utils';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 60 },
  { id: 'name', label: 'Family member', minWidth: 200 },
  { id: 'relationship', label: 'Relationship', minWidth: 140 },
  { id: 'resident', label: 'Resident', minWidth: 200 },
  { id: 'nok', label: 'Next of kin', align: 'center', minWidth: 130 },
  { id: 'status', label: 'Status', align: 'center', width: 120 },
  { id: 'joinedAt', label: 'Joined at', width: 130 },
  { id: 'actions', label: 'Actions', align: 'center', width: 120 },
];

const FILTER_FIELDS = [
  createFilterField.status({
    options: FAMILY_MEMBER_STATUS_OPTIONS,
    showCounts: true,
  }),
  createFilterField.search({
    placeholder: 'Search family member, email, or resident...',
  }),
];

export function FamilyMemberListView() {
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

  const { data, isLoading, isFetching, isError } = useGetFamilyMembersQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(status && status !== 'all' ? { status } : {}),
      ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
    },
    { skip: !organizationId }
  );

  const members = data?.data ?? [];
  const statusCounts = data?.meta?.counts ?? {};
  const totalRecords = data?.meta?.totalRecords ?? members.length;
  const allCount = Number(statusCounts.all ?? totalRecords) || 0;
  const loading = isLoading || isFetching;

  const { askDeactivate, askDelete, confirmProps } = useFamilyMemberActions({
    organizationId,
  });

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
    (tabStatus) =>
      tabStatus === 'all'
        ? allCount
        : getListStatusTabCount(statusCounts, tabStatus),
    [allCount, statusCounts]
  );

  return (
    <DashboardContent maxWidth="xl">
      <CustomBreadcrumbs
        heading="Members"
        links={[
          { name: 'Dashboard', href: familyPaths.dashboardRoot },
          { name: 'Family Engagement', href: familyPaths.familyOverview || familyPaths.dashboardRoot },
          { name: 'Memberships', href: familyPaths.familyMemberships?.members?.root },
          { name: 'Members' },
        ]}
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
                    {members.map((row, index) => {
                      const memberId = getFamilyMemberId(row);
                      return (
                        <FamilyMemberTableRow
                          key={memberId}
                          row={row}
                          serialNumber={table.page * table.rowsPerPage + index + 1}
                          relationshipOptions={relationshipOptions}
                          onDeactivate={askDeactivate}
                          onDelete={askDelete}
                          detailPath={familyPaths.familyMemberships?.members?.detail(memberId) || '#'}
                          editPath={familyPaths.familyMemberships?.members?.edit(memberId) || '#'}
                        />
                      );
                    })}

                    <TableNoData
                      notFound={!members.length}
                      title={isError ? 'Unable to load family members' : 'No family members found'}
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

      <FamilyMemberActionDialog {...confirmProps} />
    </DashboardContent>
  );
}
