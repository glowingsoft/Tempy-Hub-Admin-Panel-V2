import { useCallback, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { CONFIG } from 'src/config-global';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { useFamilyEngagementPaths } from 'src/sections/family-engagement/hooks/use-family-engagement-paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Scrollbar } from 'src/components/scrollbar';
import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';
import {
  TableEmptyRows,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  emptyRows,
  useTable,
} from 'src/components/table';
import { UserTableFiltersResult } from 'src/sections/user/user-table-filters-result';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { FamilyWallPostDialog } from 'src/sections/family-engagement/family-wall-post-dialog';
import { GazettePreviewDialog } from 'src/sections/gazettes/gazette-preview-dialog';
import { mockMyResidentsData } from '../mocks/data';
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
  { value: 'with_family', label: 'With Family', color: 'success' },
  { value: 'no_family', label: 'No Family Linked', color: 'warning' },
];

const FILTER_FIELDS = [
  createFilterField.status({
    options: STATUS_OPTIONS,
    showCounts: true,
  }),
  createFilterField.search({
    placeholder: 'Search resident, room, or family contact...',
  }),
];

// ----------------------------------------------------------------------

export function StaffMyResidentsView() {
  const table = useTable();
  const router = useRouter();
  const familyPaths = useFamilyEngagementPaths();

  const [tableData, setTableData] = useState(mockMyResidentsData);

  // Dialog Controls
  const wallPostDialog = useBoolean();
  const previewGazetteDialog = useBoolean();
  const [activeResidentForAction, setActiveResidentForAction] = useState(null);

  const filters = useSetState({ name: '', status: 'all' });

  // Breadcrumbs for staff
  const breadcrumbLinks = [
    { name: 'Dashboard', href: familyPaths.dashboardRoot },
    { name: 'Family Engagement', href: familyPaths.familyOverview || familyPaths.myResidents },
    { name: 'My Residents' },
  ];

  const statusFilterField = useMemo(
    () => FILTER_FIELDS.find((f) => f.type === 'status'),
    []
  );

  const toolbarFilterFields = useMemo(
    () => FILTER_FIELDS.filter((f) => f.type !== 'status'),
    []
  );

  const handleSearchChange = useCallback(
    (event) => {
      table.onResetPage();
      filters.setState({ name: event.target.value });
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

  const handleResetFilters = useCallback(() => {
    table.onResetPage();
    filters.setState({ name: '', status: 'all' });
  }, [filters, table]);

  const getStatusCount = useCallback(
    (status) => {
      if (status === 'all') return tableData.length;
      return tableData.filter((item) => item.status === status).length;
    },
    [tableData]
  );

  const filteredRows = useMemo(() => {
    const search = filters.state.name.trim().toLowerCase();
    const status = filters.state.status;

    return tableData.filter((row) => {
      const matchesSearch =
        !search ||
        row.resident?.toLowerCase().includes(search) ||
        row.room?.toLowerCase().includes(search) ||
        row.nextOfKin?.name?.toLowerCase().includes(search) ||
        row.familyMembers?.some((m) => m.name?.toLowerCase().includes(search));

      const matchesStatus = status === 'all' || row.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [tableData, filters.state.name, filters.state.status]);

  const canReset = !!filters.state.name || filters.state.status !== 'all';
  const notFound = !filteredRows.length;

  const dataInPage = useMemo(
    () =>
      filteredRows.slice(
        table.page * table.rowsPerPage,
        table.page * table.rowsPerPage + table.rowsPerPage
      ),
    [filteredRows, table.page, table.rowsPerPage]
  );

  const handleViewResident = useCallback(
    (row) => {
      router.push(paths.staff.familyEngagement.myResidentDetail(row.id));
    },
    [router]
  );

  const handleAddPost = useCallback(
    (row) => {
      setActiveResidentForAction(row);
      wallPostDialog.onTrue();
    },
    [wallPostDialog]
  );

  const handlePreviewGazette = useCallback(
    (row) => {
      setActiveResidentForAction(row);
      previewGazetteDialog.onTrue();
    },
    [previewGazetteDialog]
  );

  const handleDownloadGazette = useCallback((row) => {
    toast.success(`Downloading Gazette PDF for ${row.resident}...`);
    window.open(row.pdfUrl, '_blank');
  }, []);

  const handlePostCreated = useCallback(() => {
    toast.success(`Photo post created and queued for ${activeResidentForAction?.resident}'s gazette!`);
  }, [activeResidentForAction]);

  return (
    <>
      <Helmet>
        <title>{`My Residents | ${CONFIG.site.name}`}</title>
      </Helmet>

      <DashboardContent>
        <CustomBreadcrumbs
          heading="My Residents"
          links={breadcrumbLinks}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={() => {
                setActiveResidentForAction(null);
                wallPostDialog.onTrue();
              }}
              sx={{ fontWeight: 600 }}
            >
              Add Post
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

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              totalResults={filteredRows.length}
              onResetPage={handleResetFilters}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'}>
                <TableHeadCustom headLabel={TABLE_HEAD} />

                <TableBody>
                  {dataInPage.map((row, index) => (
                    <StaffMyResidentsTableRow
                      key={row.id}
                      serialNumber={table.page * table.rowsPerPage + index + 1}
                      row={row}
                      onViewResident={handleViewResident}
                      onAddPost={handleAddPost}
                      onPreviewGazette={handlePreviewGazette}
                      onDownloadGazette={handleDownloadGazette}
                    />
                  ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 76}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, filteredRows.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={filteredRows.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </DashboardContent>

      {/* Add Post Dialog reused from Gazette / Family Engagement */}
      <FamilyWallPostDialog
        open={wallPostDialog.value}
        onClose={wallPostDialog.onFalse}
        onCreated={handlePostCreated}
      />

      {/* Gazette Preview Dialog */}
      <GazettePreviewDialog
        open={previewGazetteDialog.value}
        onClose={previewGazetteDialog.onFalse}
        resident={activeResidentForAction}
      />
    </>
  );
}

export default StaffMyResidentsView;