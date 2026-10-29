import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TeamDevelopmentTabs } from 'src/components/team-development-tabs';
import {
  TableBodySkeleton,
  TableHeadCustom,
  TableNoData,
  TablePaginationCustom,
  useTable,
} from 'src/components/table';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDebounce } from 'src/hooks/use-debounce';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { useGetCompetenciesQuery } from 'src/store/Reducer/competencies-api';

import ComplianTableRow from 'src/sections/active-sections/team-compliance/compliance-table-row';
import { RequirementNewEditDialog } from 'src/sections/active-sections/team-compliance/requirement-new-edit-dialog';
import { AssignStaffDialog } from 'src/sections/active-sections/team-compliance/assign-staff-dialog';

// ----------------------------------------------------------------------

const BASE_HEAD_LABELS = [
  { id: 'sr#', label: 'Sr#', width: 50 },
  { id: 'name', label: 'Name' },
  { id: 'type', label: 'Type' },
  { id: 'renewalMonths', label: 'Renewal' },
  { id: 'firstCompletionDays', label: 'First due' },
  { id: 'evidenceRequired', label: 'Evidence required', align: 'center' },
  { id: 'appliesTo', label: 'Applies to' },
];

const ACTIONS_HEAD_LABEL = { id: 'actions', label: 'Actions', align: 'center' };

// ----------------------------------------------------------------------

const TYPE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'competency', label: 'Competency', color: 'info' },
  { value: 'training', label: 'Training', color: 'success' },
];

const TYPE_FILTER_FIELD = createFilterField.status({
  key: 'type',
  options: TYPE_OPTIONS,
  showCounts: false,
});

// ----------------------------------------------------------------------

export function RequirementsListView({ dashboardHref: dashboardHrefProp }) {
  const pathname = usePathname();
  const isSiteManager = pathname.startsWith(paths.siteManager.root);

  const dashboardHref =
    dashboardHrefProp ||
    (isSiteManager
      ? paths.siteManager.root
      : pathname.startsWith(paths.owner.root)
        ? paths.owner.root
        : paths.lineManager.root);

  const table = useTable({ defaultDense: true, defaultRowsPerPage: 10 });
  const { organizationId, user } = useCurrentOrganization();
  const filters = useSetState({ search: '', type: 'all' });
  const keyword = useDebounce(filters.state.search, 500).trim();

  const reqDialog = useBoolean();
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [assignRequirement, setAssignRequirement] = useState(null);

  const handleOpenAssign = useCallback((req) => {
    setAssignRequirement(req);
  }, []);

  const handleCloseAssign = useCallback(() => {
    setAssignRequirement(null);
  }, []);

  const { data, isLoading, isFetching } = useGetCompetenciesQuery(
    {
      organizationId,
      ...(filters.state.type !== 'all' ? { type: filters.state.type } : {}),
      ...(keyword ? { keyword } : {}),
      page: table.page + 1,
      limit: table.rowsPerPage,
    },
    { skip: !organizationId }
  );

  const requirements = useMemo(() => data?.data ?? [], [data]);
  const totalRecords = data?.meta?.totalRecords ?? requirements.length;
  const counts = data?.meta?.typeCounts ?? {};

  const getTypeCount = useCallback(
    (typeValue) => {
      if (typeValue === 'all') {
        const sum = TYPE_OPTIONS.filter((o) => o.value !== 'all').reduce(
          (acc, o) => acc + (Number(counts[o.value]) || 0),
          0
        );
        return sum || totalRecords;
      }
      return counts[typeValue] ?? 0;
    },
    [counts, totalRecords]
  );

  // Filter toolbar — search only (type is handled by tabs)
  const toolbarFilterFields = useMemo(
    () => [createFilterField.search({ placeholder: 'Search requirements...' })],
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

  const handleOpenCreate = useCallback(() => {
    setSelectedRequirement(null);
    reqDialog.onTrue();
  }, [reqDialog]);

  const handleOpenEdit = useCallback(
    (req) => {
      setSelectedRequirement(req);
      reqDialog.onTrue();
    },
    [reqDialog]
  );

  // Table head labels
  const tableHeadLabels = useMemo(
    () => [...BASE_HEAD_LABELS, ACTIONS_HEAD_LABEL],
    []
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Requirements"
        links={[
          { name: 'Dashboard', href: dashboardHref },
          { name: 'Supervision & Appraisal' },
          { name: 'Requirements' },
        ]}
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleOpenCreate}
          >
            Add requirement
          </Button>
        }
        sx={{ mb: 3 }}
      />

      <TeamDevelopmentTabs />

      {/* Requirements Table Card */}
      <Card sx={{ mt: 3 }}>
        <StatusTabsFilterWrapper
          filterField={TYPE_FILTER_FIELD}
          value={filters.state.type}
          onChange={handleFilterChange}
          getCount={getTypeCount}
        />

        <FlexibleTableToolbar
          filterFields={toolbarFilterFields}
          filterValues={filters.state}
          onSearchChange={handleSearchChange}
        />

        <Box sx={{ position: 'relative' }}>
          <TableContainer>
            <Scrollbar>
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom headLabel={tableHeadLabels} />

                <TableBody>
                  {isLoading || isFetching ? (
                    <TableBodySkeleton
                      rowCount={table.rowsPerPage}
                      cellCount={tableHeadLabels.length}
                      dense={table.dense}
                    />
                  ) : (
                    <>
                      {requirements.map((row, index) => (
                        <ComplianTableRow
                          key={row._id}
                          row={row}
                          serialNumber={table.page * table.rowsPerPage + index + 1}
                          onEditRow={() => handleOpenEdit(row)}
                          onAssignRow={() => handleOpenAssign(row)}
                        />
                      ))}

                      <TableNoData notFound={requirements.length === 0} />
                    </>
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
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

      {/* Add / Edit Requirement Modal */}
      <RequirementNewEditDialog
        open={reqDialog.value}
        onClose={reqDialog.onFalse}
        organizationId={organizationId}
        currentRequirement={selectedRequirement}
        isSiteManager={isSiteManager}
        siteManagerBranchId={user?.branchId || user?.branch?._id}
      />

      {/* Assign Staff Modal */}
      {assignRequirement && (
        <AssignStaffDialog
          open={Boolean(assignRequirement)}
          onClose={handleCloseAssign}
          requirement={assignRequirement}
          organizationId={organizationId}
          isSiteManager={isSiteManager}
          siteManagerBranchId={user?.branchId || user?.branch?._id}
        />
      )}
    </DashboardContent>
  );
}

export default RequirementsListView;