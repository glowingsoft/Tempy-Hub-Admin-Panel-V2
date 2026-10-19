import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { createFilterField } from 'src/components/generic-table/table-filter-fields';
import { FlexibleTableToolbar } from 'src/components/generic-table/table-toolbar';
import { StatusTabsFilterWrapper } from 'src/components/generic-table/tabs-filter-wrapper';
import { Scrollbar } from 'src/components/scrollbar';
import { TableHeadCustom, TableNoData, TablePaginationCustom, TableSkeleton, useTable } from 'src/components/table';
import { toast } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import {
  ALL_BRANCHES_VALUE,
  OwnerBranchFilterActions,
  useOwnerBranchFilter,
} from 'src/sections/branch/owner-branch-select';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';
import {
  useGetOnSiteSummaryQuery,
  useGetActiveEvacuationQuery,
  useGetEvacuationsQuery,
  useStartEvacuationMutation,
  useGetEvacuationChecksQuery,
  useUpsertEvacuationCheckMutation,
  useCloseEvacuationMutation,
} from 'src/store/Reducer/evacuations-api';

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

const TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 50 },
  { id: 'site', label: 'Site', width: 140 },
  { id: 'type', label: 'Type', width: 125 },
  { id: 'startedAt', label: 'Started at', width: 175, minWidth: 175 },
  { id: 'startedBy', label: 'Started by', width: 175, minWidth: 175 },
  { id: 'safeTotal', label: 'Safe / total', width: 120, align: 'center' },
  { id: 'duration', label: 'Duration', width: 110, align: 'center' },
  { id: 'status', label: 'Status', width: 110, align: 'center' },
  { id: 'actions', label: 'Action', width: 80, align: 'center' },
];

const FILTER_FIELDS = [
  createFilterField.status({ options: STATUS_OPTIONS, showCounts: true }),
  createFilterField.search({ placeholder: 'Search site or started by...' }),
];

// ----------------------------------------------------------------------

export function resolveStartedByName(row, membersMap = {}, currentUser = null) {
  if (
    row?.startedByName &&
    typeof row.startedByName === 'string' &&
    row.startedByName.trim() &&
    !/^[0-9a-fA-F]{24}$/.test(row.startedByName.trim())
  ) {
    return row.startedByName;
  }

  const started = row?.startedBy || row?.startedByUser || row?.createdBy || row?.user;
  if (started && typeof started === 'object') {
    const directName = started.name || started.fullName || started.displayName;
    if (directName) return directName;
    const combined = `${started.firstName || ''} ${started.lastName || ''}`.trim();
    if (combined) return combined;
    if (started.username) return started.username;
    if (started.email) return started.email;
  }

  const starterId =
    row?.startedByUserId ||
    (typeof started === 'string' ? started : started?._id) ||
    row?.startedById ||
    row?.userId;

  if (starterId) {
    const currentUserId =
      currentUser?._id ||
      currentUser?.id ||
      currentUser?.userId ||
      currentUser?.basicInfo?._id;

    if (currentUserId && String(currentUserId) === String(starterId)) {
      return (
        currentUser?.displayName ||
        currentUser?.name ||
        currentUser?.basicInfo?.name ||
        `${currentUser?.firstName || ''} ${currentUser?.lastName || ''}`.trim() ||
        'You'
      );
    }

    const member =
      membersMap[starterId] ||
      Object.values(membersMap).find(
        (m) =>
          String(m.userId) === String(starterId) ||
          String(m.user?._id) === String(starterId) ||
          String(m._id) === String(starterId)
      );

    if (member) {
      const memberName =
        member.name ||
        member.fullName ||
        member.user?.name ||
        member.user?.displayName ||
        `${member.firstName || ''} ${member.lastName || ''}`.trim() ||
        member.username ||
        member.email ||
        member.user?.email;
      if (memberName) return memberName;
    }
  }

  if (typeof started === 'string' && !/^[0-9a-fA-F]{24}$/.test(started.trim())) {
    return started;
  }

  if (row?.kioskId) {
    return 'Kiosk';
  }

  return '—';
}

// ----------------------------------------------------------------------

export function FireDrillsView({ rootPath, showSiteFilter = false }) {
  const table = useTable();
  const startDialog = useBoolean();
  const detailDrawer = useBoolean();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const filters = useSetState({ name: '', status: 'all' });
  const [reloadKey, setReloadKey] = useState(0);

  const { organizationId, user } = useCurrentOrganization();
  const { branchId, onBranchChange } = useOwnerBranchFilter();

  const scopedBranchId =
    showSiteFilter && branchId !== ALL_BRANCHES_VALUE ? branchId : null;

  const { branches, membersMap } = useOrganizationLookups({
    organizationId,
    branches: Boolean(organizationId && showSiteFilter && startDialog.value && !scopedBranchId),
    members: false,
    jobTitles: false,
    departments: false,
  });


  const userAssignedBranchId = useMemo(
    () =>
      user?.branchId ||
      (typeof user?.branch === 'object' ? user?.branch?._id : user?.branch) ||
      user?.access?.memberships?.[0]?.branchId ||
      null,
    [user]
  );


  // Branch resolution logic:
  // - Line Manager / Site Manager (showSiteFilter = false):
  //   Always locked to user's assigned branch.
  // - Owner Dashboard (showSiteFilter = true):
  //   If a specific site is chosen from the site dropdown, use it.
  //   If "All sites" (ALL_BRANCHES_VALUE) is selected, queryBranchId is undefined
  //   which invokes GET /admin/organizations/:orgId/evacuations/on-site-summary without branchId
  //   to get the overall organization headcount.
  const queryBranchId = useMemo(() => {
    if (showSiteFilter) {
      return scopedBranchId || undefined;
    }
    return userAssignedBranchId || undefined;
  }, [showSiteFilter, scopedBranchId, userAssignedBranchId]);

  // Skip condition:
  // - Always skip if no organizationId
  // - For Site/Line Manager: skip if user's assigned branch is not yet resolved
  const shouldSkipSummary = !organizationId || (!showSiteFilter && !userAssignedBranchId);

  // Real-time On-Site Headcount Query
  const {
    data: onSiteSummaryApiData,
    isLoading: isOnSiteSummaryLoading,
    isFetching: isOnSiteSummaryFetching,
  } = useGetOnSiteSummaryQuery(
    {
      organizationId,
      branchId: queryBranchId,
    },
    {
      skip: shouldSkipSummary,
    }
  );

  // Live Active Evacuation Query (active drills are site-specific)
  const {
    data: activeEvacuationApiData,
    isLoading: isActiveEvacuationLoading,
  } = useGetActiveEvacuationQuery(
    {
      organizationId,
      branchId: queryBranchId,
    },
    {
      skip: !organizationId || !queryBranchId,
    }
  );

  const [startEvacuationMutation, { isLoading: isStartingEvacuation }] =
    useStartEvacuationMutation();

  const {
    data: evacuationsApiData,
    isLoading: isEvacuationsLoading,
    isFetching: isEvacuationsFetching,
    error: evacuationsApiError,
  } = useGetEvacuationsQuery(
    {
      organizationId,
      branchId: queryBranchId,
      status: filters.state.status,
      search: filters.state.name,
      page: table.page + 1,
      limit: table.rowsPerPage,
    },
    {
      skip: !organizationId,
    }
  );

  const onSiteSummary =
    onSiteSummaryApiData || getMockOnSiteSummary(queryBranchId);
  const isSummaryLoading =
    (isOnSiteSummaryLoading || isOnSiteSummaryFetching) && !onSiteSummaryApiData;

  const loading = isEvacuationsLoading || isEvacuationsFetching;
  const error = evacuationsApiError?.data?.message || evacuationsApiError?.message || null;

  const statusFilterField = useMemo(() => FILTER_FIELDS.find((f) => f.type === 'status'), []);
  const toolbarFilterFields = useMemo(() => FILTER_FIELDS.filter((f) => f.type !== 'status'), []);

  const rawEvacuationsList = useMemo(() => {
    if (Array.isArray(evacuationsApiData?.data)) {
      return evacuationsApiData.data;
    }
    if (Array.isArray(evacuationsApiData?.data?.evacuations)) {
      return evacuationsApiData.data.evacuations;
    }
    if (Array.isArray(evacuationsApiData?.evacuations)) {
      return evacuationsApiData.evacuations;
    }
    if (Array.isArray(evacuationsApiData)) {
      return evacuationsApiData;
    }
    return null;
  }, [evacuationsApiData]);

  const activeEvent = useMemo(() => {
    let raw = activeEvacuationApiData?._id ? activeEvacuationApiData : null;

    if (!raw && rawEvacuationsList) {
      raw = rawEvacuationsList.find((row) => row.status === 'active') || null;
    }

    if (!raw && !organizationId) {
      raw = getMockActiveEvacuation(scopedBranchId || undefined);
    }

    if (!raw || !raw._id) return null;

    return {
      ...raw,
      branchName: raw.branch?.name || raw.branchName || '',
      assemblyPoint: raw.branch?.assemblyPoint || raw.assemblyPoint || '',
      startedByUserId: raw.startedByUserId || null,
      startedByName: resolveStartedByName(raw, membersMap, user),
      stats: raw.rollcallStats || raw.rollcall || raw.stats || { total: 0, safe: 0, missing: 0, unknown: 0 },
    };
  }, [activeEvacuationApiData, rawEvacuationsList, scopedBranchId, membersMap, user, reloadKey, organizationId]);

  const evacuations = useMemo(() => {
    let rows;
    if (rawEvacuationsList) {
      rows = rawEvacuationsList.map((row) => ({
        ...row,
        branchName: row.branch?.name || row.branchName || '—',
        assemblyPoint: row.branch?.assemblyPoint || row.assemblyPoint || '',
        startedByUserId: row.startedByUserId || null,
        startedByName: resolveStartedByName(row, membersMap, user),
        stats: row.rollcallStats || row.stats || { total: 0, safe: 0, missing: 0, unknown: 0 },
      }));
    } else {
      rows = getMockEvacuations({
        branchId: scopedBranchId || undefined,
        status: filters.state.status,
      }).map((row) => ({
        ...row,
        branchName: row.branch?.name || row.branchName || '—',
        startedByUserId: row.startedByUserId || null,
        startedByName: resolveStartedByName(row, membersMap, user),
      }));
    }

    const search = filters.state.name.trim().toLowerCase();
    if (!search) return rows;
    return rows.filter(
      (row) =>
        row.branchName?.toLowerCase().includes(search) ||
        row.startedByName?.toLowerCase().includes(search)
    );

  }, [
    rawEvacuationsList,
    scopedBranchId,
    filters.state.status,
    filters.state.name,
    reloadKey,
    membersMap,
    user,
  ]);

  const totalCount = useMemo(() => {
    const meta = evacuationsApiData?.meta;
    if (meta?.total != null) return meta.total;
    if (meta?.totalRecords != null) return meta.totalRecords;
    if (meta?.totalDocs != null) return meta.totalDocs;
    if (evacuationsApiData?.pagination?.total != null) return evacuationsApiData.pagination.total;
    return evacuations.length;
  }, [evacuationsApiData, evacuations.length]);

  const paginatedRows = useMemo(() => {
    if (rawEvacuationsList) {
      return evacuations;
    }
    const start = table.page * table.rowsPerPage;
    return evacuations.slice(start, start + table.rowsPerPage);
  }, [rawEvacuationsList, evacuations, table.page, table.rowsPerPage]);

  const getStatusCount = useCallback(
    (status) => {
      const meta = evacuationsApiData?.meta;
      const counts = meta?.counts;

      if (counts && typeof counts === 'object') {
        if (status === 'all') {
          if (counts.active != null || counts.closed != null) {
            return Object.values(counts).reduce((sum, n) => sum + (Number(n) || 0), 0);
          }
          return meta.total ?? meta.totalRecords ?? meta.totalDocs ?? totalCount;
        }
        if (counts[status] != null) {
          return counts[status];
        }
      }

      if (rawEvacuationsList) {
        if (status === 'all') {
          return totalCount;
        }
        return evacuations.filter((row) => row.status === status).length;
      }

      const base = getMockEvacuations({ branchId: scopedBranchId || undefined, status: 'all' });
      if (status === 'all') return base.length;
      return base.filter((row) => row.status === status).length;
    },
    [evacuationsApiData, rawEvacuationsList, totalCount, evacuations, scopedBranchId]
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

  const handleStart = async ({ branchId: chosenBranchId, type }) => {
    const targetBranchId =
      chosenBranchId || scopedBranchId || onSiteSummary?.branchId || queryBranchId;

    if (!targetBranchId) {
      toast.error('Please select a site to start the evacuation.');
      return false;
    }

    try {
      if (organizationId) {
        await startEvacuationMutation({
          organizationId,
          branchId: targetBranchId,
          type,
        }).unwrap();
        toast.success('Evacuation started successfully');
        return true;
      }

      mockStartEvacuation({
        branchId: targetBranchId,
        type,
      });
      bump();
      toast.success('Evacuation started (mock)');
      return true;
    } catch (err) {
      console.error('Failed to start evacuation', err);
      toast.error(err?.data?.message || err?.message || 'Failed to start evacuation');
      return false;
    }
  };

  const [closeEvacuationMutation, { isLoading: isClosingEvacuation }] =
    useCloseEvacuationMutation();
  const [upsertEvacuationCheckMutation] = useUpsertEvacuationCheckMutation();

  const {
    data: checksApiData,
    isLoading: isChecksLoading,
  } = useGetEvacuationChecksQuery(
    {
      evacuationEventId: selectedEvent?._id,
      organizationId,
      unaccountedOnly: false,
    },
    {
      skip:
        !selectedEvent?._id ||
        !organizationId ||
        !/^[0-9a-fA-F]{24}$/.test(String(selectedEvent._id)),
    }
  );

  /** POST /admin/evacuations/:id/close */
  const handleCloseEvacuation = async (event) => {
    if (!event?._id) return;
    try {
      if (organizationId) {
        await closeEvacuationMutation({
          evacuationEventId: event._id,
          organizationId,
        }).unwrap();
        toast.success('Evacuation closed successfully');
      } else {
        mockCloseEvacuation(event._id);
        toast.success('Evacuation closed (mock)');
      }
      if (selectedEvent?._id === event._id) {
        setSelectedEvent(null);
        detailDrawer.onFalse();
      }
      bump();
    } catch (err) {
      console.error('Failed to close evacuation', err);
      toast.error(err?.data?.message || err?.message || 'Failed to close evacuation');
    }
  };

  const detailChecks = useMemo(() => {
    if (checksApiData) {
      if (Array.isArray(checksApiData.checks)) return checksApiData.checks;
      if (Array.isArray(checksApiData.data)) return checksApiData.data;
      if (Array.isArray(checksApiData)) return checksApiData;
    }
    return selectedEvent ? mockEvacChecksByEventId[selectedEvent._id] || [] : [];
  }, [checksApiData, selectedEvent]);

  const detailStats = useMemo(() => {
    return (
      checksApiData?.rollcallStats ||
      selectedEvent?.rollcallStats ||
      selectedEvent?.stats ||
      null
    );
  }, [checksApiData, selectedEvent]);

  const handleOpenDetail = useCallback(
    (event) => {
      setSelectedEvent(event);
      detailDrawer.onTrue();
    },
    [detailDrawer]
  );

  const handleUpdateCheck = useCallback(
    async (event, payload) => {
      if (!event?._id) return;
      try {
        if (organizationId) {
          await upsertEvacuationCheckMutation({
            evacuationEventId: event._id,
            organizationId,
            personKind: payload.personKind,
            personId: payload.personId,
            status: payload.status,
            locationLabel: payload.locationLabel,
          }).unwrap();
          toast.success('Rollcall status updated');
        } else {
          mockUpsertEvacCheck(event._id, payload);
          toast.success('Rollcall status updated (mock)');
        }
        bump();
      } catch (err) {
        console.error('Failed to update rollcall check', err);
        toast.error(err?.data?.message || err?.message || 'Failed to update rollcall check');
      }
    },
    [organizationId, upsertEvacuationCheckMutation]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Fire Drills"
        links={[{ name: 'Dashboard', href: rootPath }, { name: 'Fire Drills' }]}
        action={
          showSiteFilter ? (
            <OwnerBranchFilterActions value={branchId} onChange={onBranchChange}>
              <Button
                variant="contained"
                color="error"
                disabled={Boolean(activeEvent)}
                startIcon={<Iconify icon="solar:danger-triangle-bold" />}
                onClick={startDialog.onTrue}
              >
                Start evacuation
              </Button>
            </OwnerBranchFilterActions>
          ) : (
            <Button
              variant="contained"
              color="error"
              disabled={Boolean(activeEvent)}
              startIcon={<Iconify icon="solar:danger-triangle-bold" />}
              onClick={startDialog.onTrue}
            >
              Start evacuation
            </Button>
          )
        }
        sx={{ mb: { xs: 2, md: 3 } }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <OnSiteSummary
        summary={onSiteSummary}
        loading={isSummaryLoading}
        hideSiteDetails={showSiteFilter && branchId === ALL_BRANCHES_VALUE}
      />

      <ActiveEvacuationBanner
        event={activeEvent}
        onViewRollcall={handleOpenDetail}
        onCloseEvacuation={handleCloseEvacuation}
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
          <Scrollbar slotProps={{ content: { width: 1, minWidth: '100%' } }}>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1050 }}>
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
              />

              <TableBody>
                {loading ? (
                  [...Array(table.rowsPerPage)].map((_, index) => (
                    <TableSkeleton key={index} />
                  ))
                ) : (
                  <>
                    {paginatedRows.map((row, index) => (
                      <EvacuationTableRow
                        key={row._id}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                        onOpen={handleOpenDetail}
                      />
                    ))}

                    <TableNoData notFound={!loading && !evacuations.length} title="No fire drills found" />
                  </>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Box>

        <TablePaginationCustom
          page={table.page}
          dense={table.dense}
          count={totalCount}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onChangeDense={table.onChangeDense}
          onRowsPerPageChange={table.onChangeRowsPerPage}
        />
      </Card>

      <StartEvacuationDialog
        open={startDialog.value}
        onClose={startDialog.onFalse}
        onStart={handleStart}
        branchLabel={onSiteSummary?.branchName}
        onSiteTotal={onSiteSummary?.counts?.total ?? 0}
        branches={branches || []}
        currentBranchId={queryBranchId}
        loading={isStartingEvacuation}
      />

      <EvacuationDetailDrawer
        open={detailDrawer.value}
        onClose={detailDrawer.onFalse}
        event={selectedEvent}
        checks={detailChecks}
        stats={detailStats}
        loadingChecks={isChecksLoading}
        closing={isClosingEvacuation}
        onUpdateCheck={handleUpdateCheck}
        onCloseEvacuation={handleCloseEvacuation}
      />
    </DashboardContent>
  );
}