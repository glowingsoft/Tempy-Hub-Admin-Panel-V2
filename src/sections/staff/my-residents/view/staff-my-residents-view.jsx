import { useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { CONFIG } from 'src/config-global';
import { useDebounce } from 'src/hooks/use-debounce';
import { useSetState } from 'src/hooks/use-set-state';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
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
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { getUserBranchId } from 'src/utils/organization';
import { useGetResidentsQuery } from 'src/store/Reducer/residents-api';
import { RESIDENT_ADMISSION_STATUS_OPTIONS } from 'src/sections/resident/mocks/data';

import { StaffMyResidentsTableRow } from '../staff-my-residents-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'sr#', label: 'Sr#', width: 48, sx: { pr: 0 } },
  { id: 'resident', label: 'Resident', width: '25%', minWidth: 200, sx: { pl: 0 } },
  { id: 'family', label: 'Family', width: '28%', minWidth: 220 },
  { id: 'photoSharing', label: 'Photo sharing', width: '18%', minWidth: 150 },
  { id: 'actions', label: 'Action', align: 'center', width: '20%', minWidth: 160 },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All', color: 'default' },
  ...RESIDENT_ADMISSION_STATUS_OPTIONS.filter((option) =>
    ['admitted', 'discharged'].includes(option.value)
  ),
];

const FILTER_FIELDS = [
  createFilterField.status({
    options: STATUS_OPTIONS,
    showCounts: true,
  }),
  createFilterField.search({
    placeholder: 'Search resident, room, or email...',
  }),
];

// ----------------------------------------------------------------------

export function StaffMyResidentsView() {
  const table = useTable({
    defaultDense: true,
    defaultRowsPerPage: 10,
  });
  const router = useRouter();
  const familyPaths = useFamilyEngagementPaths();
  const { organizationId, user } = useCurrentOrganization();
  const branchId = getUserBranchId(user, organizationId);

  const filters = useSetState({ search: '', status: 'all' });
  const trimmedKeyword = useDebounce(filters.state.search, 400).trim();
  const { status } = filters.state;

  const { data, isLoading, isFetching, isError } = useGetResidentsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      ...(branchId ? { branchId } : {}),
      ...(trimmedKeyword ? { keyword: trimmedKeyword } : {}),
      ...(status && status !== 'all' ? { status, admissionStatus: status } : {}),
    },
    { skip: !organizationId }
  );

  const residents = useMemo(() => data?.data ?? [], [data]);
  const meta = data?.meta ?? {};
  const admittedCount = Number(meta.admitted) || 0;
  const dischargedCount = Number(meta.discharged) || 0;
  const totalRecords = Number.isFinite(meta.totalRecords) ? meta.totalRecords : residents.length;
  const loading = isLoading || isFetching;

  const breadcrumbLinks = [
    { name: 'Dashboard', href: familyPaths.dashboardRoot },
    { name: 'Family Engagement', href: familyPaths.familyOverview || familyPaths.myResidents },
    { name: 'My Residents' },
  ];

  const statusFilterField = useMemo(() => FILTER_FIELDS.find((field) => field.type === 'status'), []);
  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((field) => field.type !== 'status'),
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
    (tabStatus) => {
      if (tabStatus === 'admitted') return admittedCount;
      if (tabStatus === 'discharged') return dischargedCount;
      return admittedCount + dischargedCount || totalRecords;
    },
    [admittedCount, dischargedCount, totalRecords]
  );

  const notFound = !loading && !residents.length;

  const handleViewResident = useCallback(
    (row) => {
      router.push(paths.staff.familyEngagement.myResidentDetail(row._id));
    },
    [router]
  );

  return (
    <>
      <Helmet>
        <title>{`My Residents | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent>
        <CustomBreadcrumbs
          heading="My Residents"
          links={breadcrumbLinks}
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
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 720 }}>
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
                      {residents.map((row, index) => (
                        <StaffMyResidentsTableRow
                          key={row._id || index}
                          serialNumber={table.page * table.rowsPerPage + index + 1}
                          row={row}
                          onViewResident={handleViewResident}
                        />
                      ))}

                      <TableNoData
                        notFound={notFound}
                        title={isError ? 'Unable to load residents' : 'No residents found'}
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

export default StaffMyResidentsView;
