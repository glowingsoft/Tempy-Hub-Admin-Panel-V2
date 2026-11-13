import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Grid from '@mui/material/Unstable_Grid2';

import { CONFIG } from 'src/config-global';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { getListStatusTabCount } from 'src/utils/table-utils';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { useGetFamilyRelationshipsQuery } from 'src/store/Reducer/family-invitations-api';
import { useGetFamilyGroupsQuery } from 'src/store/Reducer/family-groups-api';

import { FAMILY_GROUP_FILTER_FIELDS, FAMILY_GROUP_TABLE_HEAD, widgetIcon } from './constants';
import { toResidentOption } from './mocks/data';
import { FamilyGroupTableRow } from './family-group-table-row';

// ----------------------------------------------------------------------

export function FamilyGroupList({ onView, onInvite }) {
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

  const { data, isLoading, isFetching, isError } = useGetFamilyGroupsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(status && status !== 'all' ? { status } : {}),
      ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
    },
    { skip: !organizationId }
  );

  const groups = data?.data ?? [];
  const statusCounts = data?.meta?.counts ?? {};
  const totalRecords = data?.meta?.totalRecords ?? groups.length;
  const loading = isLoading || isFetching;

  const statusFilterField = useMemo(
    () => FAMILY_GROUP_FILTER_FIELDS.find((field) => field.type === 'status'),
    []
  );
  const toolbarFilterFields = useMemo(
    () => FAMILY_GROUP_FILTER_FIELDS.filter((field) => field.type !== 'status'),
    []
  );

  const handleSearchChange = useCallback(
    (event) => {
      table.onResetPage();
      filters.setState({ search: event.target.value });
    },
    [filters, table]
  );

  const handleFilterChange = useCallback(
    (key, value) => {
      table.onResetPage();
      filters.setState({ [key]: value });
    },
    [filters, table]
  );

  const getStatusCount = useCallback(
    (tabStatus) => getListStatusTabCount(statusCounts, tabStatus, totalRecords, { keepTotal: true }),
    [statusCounts, totalRecords]
  );

  return (
    <>
      <Helmet>
        <title>{`Family Groups | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent maxWidth="xl">
        <CustomBreadcrumbs
          heading="Family Groups"
          links={[
            { name: 'Dashboard', href: familyPaths.dashboardRoot },
            { name: 'Family Engagement', href: familyPaths.familyOverview },
            { name: 'Family Groups' },
          ]}
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:user-plus-bold" />}
              onClick={() => onInvite()}
            >
              Invite family member
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid xs={12} sm={6} md={3}>
            <CourseWidgetSummary
              title="Total groups"
              total={loading ? '—' : statusCounts.total ?? totalRecords}
              color="primary"
              icon={widgetIcon('ic-users')}
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <CourseWidgetSummary
              title="Active"
              total={loading ? '—' : statusCounts.active ?? 0}
              color="success"
              icon={widgetIcon('ic-user')}
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <CourseWidgetSummary
              title="Invite pending"
              total={loading ? '—' : statusCounts.invitePending ?? 0}
              color="warning"
              icon={widgetIcon('ic-mail')}
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <CourseWidgetSummary
              title="No family"
              total={loading ? '—' : statusCounts.noFamily ?? 0}
              color="error"
              icon={widgetIcon('ic-disabled')}
            />
          </Grid>
        </Grid>

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
                <TableHeadCustom headLabel={FAMILY_GROUP_TABLE_HEAD} />

                <TableBody>
                  {loading ? (
                    <TableBodySkeleton
                      rowCount={table.rowsPerPage}
                      cellCount={FAMILY_GROUP_TABLE_HEAD.length}
                      dense={table.dense}
                    />
                  ) : (
                    <>
                      {groups.map((row, index) => (
                        <FamilyGroupTableRow
                          key={row.residentId}
                          row={row}
                          serialNumber={table.page * table.rowsPerPage + index + 1}
                          relationshipOptions={relationshipOptions}
                          onView={onView}
                          onInvite={() => onInvite(toResidentOption(row))}
                        />
                      ))}

                      <TableNoData
                        notFound={!groups.length}
                        title={isError ? 'Unable to load family groups' : 'No family groups found'}
                      />
                    </>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            count={totalRecords}
            dense={table.dense}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </DashboardContent>
    </>
  );
}

FamilyGroupList.propTypes = {
  onView: PropTypes.func,
  onInvite: PropTypes.func,
};
