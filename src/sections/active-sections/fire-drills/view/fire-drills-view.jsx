import { useCallback, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom, TableNoData, TablePaginationCustom, useTable } from 'src/components/table';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  ALL_BRANCHES_VALUE,
  OwnerBranchFilterActions,
  useOwnerBranchFilter,
} from 'src/sections/branch/owner-branch-select';

import { ActiveEvacuationBanner } from '../active-evacuation-banner';
import { EvacuationDetailDrawer } from '../evacuation-detail-drawer';
import EvacuationTableRow from '../evacuation-table-row';
import {
  EVACUATION_STATUS_OPTIONS,
  getMockActiveEvacuation,
  getMockEvacuations,
  getMockOnSiteSummary,
  mockCloseEvacuation,
  mockEvacChecksByEventId,
  mockStartEvacuation,
  mockUpsertEvacCheck,
} from '../mocks/data';
import { OnSiteSummary } from '../on-site-summary';
import { StartEvacuationDialog } from '../start-evacuation-dialog';

// ----------------------------------------------------------------------
// Mock UI aligned to fireDrillEvacuation APIs. See mocks/api-endpoints.js.
// Replace mock* helpers with real GET/POST when wiring:
//   onSiteSummary | active | list | start | close | listChecks | upsertCheck
// ----------------------------------------------------------------------

const STATUS_OPTIONS = EVACUATION_STATUS_OPTIONS;

const FILTER_FIELDS = [
  createFilterField.status({ options: STATUS_OPTIONS, showCounts: true }),
  createFilterField.search({ placeholder: 'Search site or started by...' }),
];

// ----------------------------------------------------------------------

export function FireDrillsView({ rootPath, showSiteFilter = false }) {
  const table = useTable();
  const startDialog = useBoolean();
  const detailDrawer = useBoolean();
  const filters = useSetState({ name: '', status: 'all' });

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const { branchId, onBranchChange } = useOwnerBranchFilter();
  const scopedBranchId =
    showSiteFilter && branchId !== ALL_BRANCHES_VALUE ? branchId : null;

  const loading = false;
  const error = null;

  const statusFilterField = useMemo(() => FILTER_FIELDS.find((f) => f.type === 'status'), []);
  const toolbarFilterFields = useMemo(() => FILTER_FIELDS.filter((f) => f.type !== 'status'), []);

  const onSiteSummary = useMemo(
    () => getMockOnSiteSummary(scopedBranchId || undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scopedBranchId, reloadKey]
  );

  const activeEvent = useMemo(
    () => getMockActiveEvacuation(scopedBranchId || undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scopedBranchId, reloadKey]
  );

  const evacuations = useMemo(() => {
    const rows = getMockEvacuations({
      branchId: scopedBranchId || undefined,
      status: filters.state.status,
    });
    const search = filters.state.name.trim().toLowerCase();
    if (!search) return rows;
    return rows.filter(
      (row) =>
        row.branchName?.toLowerCase().includes(search) ||
        row.startedByName?.toLowerCase().includes(search)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopedBranchId, filters.state.status, filters.state.name, reloadKey]);

  const paginatedRows = useMemo(() => {
    const start = table.page * table.rowsPerPage;
    return evacuations.slice(start, start + table.rowsPerPage);
  }, [evacuations, table.page, table.rowsPerPage]);

  const detailChecks = selectedEvent
    ? mockEvacChecksByEventId[selectedEvent._id] || []
    : [];

  const getStatusCount = useCallback(
    (status) => {
      const base = getMockEvacuations({ branchId: scopedBranchId || undefined, status: 'all' });
      if (status === 'all') return base.length;
      return base.filter((row) => row.status === status).length;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scopedBranchId, reloadKey]
  );

  const bump = () => setReloadKey((k) => k + 1);

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
      filters.setState({ name: event.target.value });
    },
    [filters, table]
  );

  /** API later: POST /organizations/:orgId/evacuations */
  const handleStart = ({ type }) => {
    mockStartEvacuation({
      branchId: scopedBranchId || onSiteSummary.branchId,
      type,
    });
    bump();
  };

  /** API later: POST /evacuations/:id/close */
  const handleCloseEvacuation = (event) => {
    mockCloseEvacuation(event._id);
    if (selectedEvent?._id === event._id) {
      setSelectedEvent((prev) =>
        prev ? { ...prev, status: 'closed', closedAt: new Date().toISOString() } : null
      );
    }
    bump();
  };

  /** API later: GET /evacuations/:id + GET .../checks */
  const handleOpenDetail = (event) => {
    setSelectedEvent(event);
    detailDrawer.onTrue();
  };

  /** API later: POST /evacuations/:id/checks */
  const handleUpdateCheck = (event, payload) => {
    mockUpsertEvacCheck(event._id, payload);
    bump();
  };

  const tableHead = [
    { id: 'sr#', label: 'Sr#', width: 56 },
    { id: 'started', label: 'Started', minWidth: 140 },
    { id: 'type', label: 'Type', width: 130 },
    ...(showSiteFilter ? [{ id: 'site', label: 'Site', minWidth: 120 }] : []),
    { id: 'by', label: 'Started by', minWidth: 120 },
    { id: 'rollcall', label: 'Safe / total', align: 'center', width: 110 },
    { id: 'duration', label: 'Duration', width: 90 },
    { id: 'status', label: 'Status', align: 'center', width: 100 },
    { id: 'actions', label: '', align: 'center', width: 88 },
  ];

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Fire Drills"
        links={[{ name: 'Dashboard', href: rootPath }, { name: 'Fire Drills' }]}
        action={
          <Button
            variant="contained"
            color="error"
            disabled={Boolean(activeEvent)}
            startIcon={<Iconify icon="solar:danger-triangle-bold" />}
            onClick={startDialog.onTrue}
          >
            Start evacuation
          </Button>
        }
        sx={{ mb: { xs: 2, md: 3 } }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <OnSiteSummary summary={onSiteSummary} loading={loading} />

      <ActiveEvacuationBanner
        event={activeEvent}
        onViewRollcall={handleOpenDetail}
        onCloseEvacuation={handleCloseEvacuation}
      />

      <Card>
        {showSiteFilter && (
          <OwnerBranchFilterActions value={branchId} onChange={onBranchChange} />
        )}

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

        <TableContainer sx={{ position: 'relative' }}>
          <Scrollbar>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 880 }}>
              <TableHeadCustom headLabel={tableHead} />

              <TableBody>
                {paginatedRows.map((row, index) => (
                  <EvacuationTableRow
                    key={row._id}
                    row={row}
                    serialNumber={table.page * table.rowsPerPage + index + 1}
                    showSite={showSiteFilter}
                    onOpen={handleOpenDetail}
                  />
                ))}

                <TableNoData notFound={!loading && !evacuations.length} />
              </TableBody>
            </Table>
          </Scrollbar>

          <TablePaginationCustom
            page={table.page}
            count={evacuations.length}
            dense={table.dense}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onRowsPerPageChange={table.onChangeRowsPerPage}
            onChangeDense={table.onChangeDense}
          />
        </TableContainer>
      </Card>

      <StartEvacuationDialog
        open={startDialog.value}
        onClose={startDialog.onFalse}
        onStart={handleStart}
        branchLabel={onSiteSummary?.branchName}
        onSiteTotal={onSiteSummary?.counts?.total ?? 0}
      />

      <EvacuationDetailDrawer
        open={detailDrawer.value}
        onClose={detailDrawer.onFalse}
        event={selectedEvent}
        checks={detailChecks}
        onUpdateCheck={handleUpdateCheck}
        onCloseEvacuation={handleCloseEvacuation}
      />
    </DashboardContent>
  );
}
