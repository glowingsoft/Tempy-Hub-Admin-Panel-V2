import { useCallback, useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Unstable_Grid2';
import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Stack from '@mui/material/Stack';
import InputAdornment from '@mui/material/InputAdornment';

import { useCanManage } from 'src/auth/hooks';
import { ModuleSlug } from 'src/auth/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
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
import { toast } from 'src/components/snackbar';
import { getListStatusTabCount } from 'src/utils/table-utils';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { ALL_BRANCHES_VALUE } from 'src/sections/branch/owner-branch-select';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useOrganizationLookups } from 'src/hooks/use-organization-lookups';
import { getUserBranchId } from 'src/utils/organization';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import {
  useGetOnSiteSummaryQuery,
  useGetActiveEvacuationQuery,
  useGetEvacuationsQuery,
  useStartEvacuationMutation,
  useGetEvacuationChecksQuery,
  useUpsertEvacuationCheckMutation,
  useCloseEvacuationMutation,
  useGetMyActiveEvacuationQuery,
  useGetMyEvacuationDrillsQuery,
  useCheckInMyEvacuationMutation,
} from 'src/store/Reducer/evacuations-api';

import { CONFIG } from 'src/config-global';
import { CourseWidgetSummary } from 'src/sections/overview/course/course-widget-summary';
import { ActiveEvacuationBanner } from '../active-evacuation-banner';
import { EvacuationDetailDrawer } from '../evacuation-detail-drawer';
import EvacuationTableRow from '../evacuation-table-row';
import { OnSiteSummary } from '../on-site-summary';
import { StaffActiveEvacuationCard } from '../staff-active-evacuation-card';
import { StartEvacuationDialog } from '../start-evacuation-dialog';

// ----------------------------------------------------------------------

export const EVACUATION_TYPE_OPTIONS = [
  { value: 'mock', label: 'Mock drill', color: 'info' },
  { value: 'real', label: 'Real emergency', color: 'error' },
];

export const EVACUATION_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'closed', label: 'Closed', color: 'error' },
];

export const EVAC_CHECK_STATUS = {
  safe: { label: 'Safe', color: 'success' },
  missing: { label: 'Missing', color: 'error' },
  unknown: { label: 'Not yet', color: 'warning' },
};

export const getEvacuationTypeMeta = (type) =>
  EVACUATION_TYPE_OPTIONS.find((o) => o.value === type) || {
    value: type,
    label: type || '—',
    color: 'default',
  };

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

const STAFF_TABLE_HEAD = [
  { id: 'sr', label: 'Sr#', width: 50 },
  { id: 'site', label: 'Site', width: 130 },
  { id: 'type', label: 'Type', width: 125 },
  { id: 'locationLabel', label: 'Location', width: 140 },
  { id: 'startedAt', label: 'Started at', width: 175, minWidth: 175 },
  { id: 'duration', label: 'Duration', width: 150, align: 'center' },
  { id: 'checkStatus', label: 'My Check-in', width: 120, align: 'center' },
  { id: 'status', label: 'Status', width: 100, align: 'center' },
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

function isPermissionDenied(error) {
  return error?.status === 401 || error?.status === 403;
}

const mapBranchOption = (item) => ({
  value: item._id,
  label: item.name,
});

const EXTRA_BRANCH_OPTIONS = [{ value: ALL_BRANCHES_VALUE, label: 'All sites' }];

export function FireDrillsView({ rootPath, showSiteFilter = false, staffDashboard = false }) {
  const canManageFire = useCanManage(ModuleSlug.FIRE_DRILL_EVACUATION);
  const table = useTable({ defaultDense: true });
  const startDialog = useBoolean();
  const detailDrawer = useBoolean();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const filters = useSetState({ name: '', status: 'all' });

  const { organizationId, user } = useCurrentOrganization();
  const [branchId, setBranchId] = useState(ALL_BRANCHES_VALUE);

  const handleBranchChange = useCallback(
    (option) => {
      const nextId = option?.value || ALL_BRANCHES_VALUE;
      setBranchId(nextId);
      table.onResetPage();
    },
    [table]
  );

  const branchQueryArgs = useMemo(() => ({ organizationId }), [organizationId]);

  const selectedBranchOption = useMemo(() => {
    if (!branchId || branchId === ALL_BRANCHES_VALUE) {
      return { value: ALL_BRANCHES_VALUE, label: 'All sites' };
    }
    return { value: branchId, label: 'Selected site' };
  }, [branchId]);

  const scopedBranchId =
    showSiteFilter && branchId !== ALL_BRANCHES_VALUE ? branchId : null;

  const { membersMap } = useOrganizationLookups({
    organizationId,
    branches: false,
    members: false,
    jobTitles: false,
    departments: false,
  });


  const userAssignedBranchId = useMemo(
    () =>
      getUserBranchId(user, organizationId) ||
      user?.branchId ||
      (typeof user?.branch === 'object' ? user?.branch?._id : user?.branch) ||
      user?.access?.memberships?.[0]?.branchId ||
      null,
    [user, organizationId]
  );

  const isLineManager = useMemo(() => {
    if (user?.permission === 3) return true;
    if (user?.role === 'lineManager' || user?.role === 'line_manager') return true;
    const currentMembership = user?.access?.memberships?.find(
      (m) => String(m.organizationId?._id || m.organizationId) === String(organizationId)
    );
    if (currentMembership?.role === 'lineManager') return true;
    if (typeof rootPath === 'string' && rootPath.includes('line-manager')) return true;
    if (typeof window !== 'undefined' && window.location.pathname.includes('/line-manager')) return true;
    return false;
  }, [user, organizationId, rootPath]);

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

  const shouldSkipSummary = staffDashboard || !organizationId;

  // Real-time On-Site Headcount Query
  const {
    data: onSiteSummaryApiData,
    isLoading: isOnSiteSummaryLoading,
    isFetching: isOnSiteSummaryFetching,
    error: onSiteSummaryApiError,
  } = useGetOnSiteSummaryQuery(
    {
      organizationId,
      branchId: queryBranchId,
    },
    {
      skip: shouldSkipSummary,
    }
  );

  // Live Active Evacuation Query (active drills are site-specific or org-wide)
  const {
    data: activeEvacuationApiData,
    isLoading: isActiveEvacuationLoading,
    error: activeEvacuationApiError,
  } = useGetActiveEvacuationQuery(
    {
      organizationId,
      branchId: queryBranchId,
    },
    {
      skip: shouldSkipSummary,
    }
  );

  // Dedicated active evacuation query (guarantees active card persists across table pagination/filtering)
  const { data: activeListApiData } = useGetEvacuationsQuery(
    {
      organizationId,
      branchId: queryBranchId,
      status: 'active',
      page: 1,
      limit: 1,
    },
    {
      skip: shouldSkipSummary,
    }
  );

  const [startEvacuationMutation, { isLoading: isStartingEvacuation }] =
    useStartEvacuationMutation();

  const {
    data: adminEvacuationsApiData,
    isLoading: isAdminEvacuationsLoading,
    isFetching: isAdminEvacuationsFetching,
    error: adminEvacuationsApiError,
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
      skip: staffDashboard || !organizationId,
    }
  );

  const { data: myActiveEvacuationData } = useGetMyActiveEvacuationQuery(
    { organizationId },
    { skip: !staffDashboard || !organizationId }
  );

  const {
    data: myEvacuationsApiData,
    isLoading: isMyEvacuationsLoading,
    isFetching: isMyEvacuationsFetching,
    error: myEvacuationsApiError,
  } = useGetMyEvacuationDrillsQuery(
    {
      organizationId,
      page: table.page + 1,
      limit: table.rowsPerPage,
      status: filters.state.status,
      search: filters.state.name,
    },
    {
      skip: !staffDashboard || !organizationId,
    }
  );

  const evacuationsApiData = staffDashboard ? myEvacuationsApiData : adminEvacuationsApiData;
  const isEvacuationsLoading = staffDashboard ? isMyEvacuationsLoading : isAdminEvacuationsLoading;
  const isEvacuationsFetching = staffDashboard
    ? isMyEvacuationsFetching
    : isAdminEvacuationsFetching;
  const evacuationsApiError = staffDashboard ? myEvacuationsApiError : adminEvacuationsApiError;

  const hasPermissionDenied = [
    onSiteSummaryApiError,
    activeEvacuationApiError,
    evacuationsApiError,
  ].some(isPermissionDenied);

  const onSiteSummary = onSiteSummaryApiData || null;
  const isSummaryLoading =
    (isOnSiteSummaryLoading || isOnSiteSummaryFetching) && !onSiteSummaryApiData;

  const loading = isEvacuationsLoading || isEvacuationsFetching;
  const error = [
    evacuationsApiError,
    onSiteSummaryApiError,
    activeEvacuationApiError,
  ]
    .filter((queryError) => queryError && !isPermissionDenied(queryError))
    .map((queryError) => queryError.data?.message || queryError.message)
    .find(Boolean);

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

    if (!raw && activeListApiData?.data?.[0]?._id) {
      raw = activeListApiData.data[0];
    }

    if (!raw && Array.isArray(rawEvacuationsList)) {
      raw = rawEvacuationsList.find((row) => row.status === 'active') || null;
    }

    if (!raw || !raw._id) return null;

    const rollcallData =
      raw.rollcall || raw.rollcallStats || raw.stats || { total: 0, safe: 0, missing: 0, unknown: 0 };

    return {
      ...raw,
      branchName: raw.branch?.name || raw.branchName || '',
      assemblyPoint: raw.branch?.assemblyPoint || raw.assemblyPoint || '',
      startedByUserId: raw.startedByUserId || null,
      startedByName: resolveStartedByName(raw, membersMap, user),
      stats: rollcallData,
      rollcall: rollcallData,
    };
  }, [activeEvacuationApiData, activeListApiData, rawEvacuationsList, membersMap, user]);

  const evacuations = useMemo(() => {
    if (!rawEvacuationsList) {
      return [];
    }

    const rows = rawEvacuationsList.map((row) => {
      const rollcallData =
        row.rollcall || row.rollcallStats || row.stats || { total: 0, safe: 0, missing: 0, unknown: 0 };
      return {
        ...row,
        branchName: row.branch?.name || row.branchName || '—',
        assemblyPoint: row.branch?.assemblyPoint || row.assemblyPoint || '',
        startedByUserId: row.startedByUserId || null,
        startedByName: resolveStartedByName(row, membersMap, user),
        rollcall: rollcallData,
        stats: rollcallData,
      };
    });

    const search = filters.state.name.trim().toLowerCase();
    if (!search) return rows;
    return rows.filter(
      (row) =>
        row.branchName?.toLowerCase().includes(search) ||
        row.startedByName?.toLowerCase().includes(search) ||
        row.locationLabel?.toLowerCase().includes(search)
    );
  }, [
    rawEvacuationsList,
    filters.state.name,
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
          return getListStatusTabCount(
            counts,
            'all',
            meta.total ?? meta.totalRecords ?? meta.totalDocs ?? totalCount
          );
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

      return 0;
    },
    [evacuationsApiData, rawEvacuationsList, totalCount, evacuations]
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
      filters.setState({ name: event.target.value });
    },
    [filters, table]
  );

  const handleStart = async ({
    branchId: chosenBranchId,
    type,
    locationLabel,
    receptionIdentifier,
  }) => {
    const targetBranchId =
      chosenBranchId || scopedBranchId || onSiteSummary?.branchId || queryBranchId;

    if (!targetBranchId) {
      toast.error('Please select a site to start the evacuation.');
      return false;
    }

    if (!organizationId) {
      toast.error('Organization ID is missing');
      return false;
    }

    try {
      await startEvacuationMutation({
        organizationId,
        branchId: targetBranchId,
        type,
        locationLabel,
        receptionIdentifier,
      }).unwrap();
      toast.success('Evacuation started successfully');
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
  const [checkInMyEvacuationMutation, { isLoading: isCheckingInSelf }] =
    useCheckInMyEvacuationMutation();

  const {
    data: checksApiData,
    isLoading: isChecksLoading,
    error: checksApiError,
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
    if (!organizationId) {
      toast.error('Organization ID is missing');
      return;
    }
    try {
      await closeEvacuationMutation({
        evacuationEventId: event._id,
        organizationId,
      }).unwrap();
      toast.success('Evacuation closed successfully');
      if (selectedEvent?._id === event._id) {
        setSelectedEvent(null);
        detailDrawer.onFalse();
      }
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
    return [];
  }, [checksApiData]);

  const detailStats = useMemo(() => {
    if (hasPermissionDenied || isPermissionDenied(checksApiError)) return null;
    return checksApiData?.rollcallStats || selectedEvent?.rollcallStats || selectedEvent?.stats || null;
  }, [checksApiData, checksApiError, hasPermissionDenied, selectedEvent]);

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
      if (!organizationId) {
        toast.error('Organization ID is missing');
        return;
      }
      try {
        await upsertEvacuationCheckMutation({
          evacuationEventId: event._id,
          organizationId,
          personKind: payload.personKind,
          personId: payload.personId,
          status: payload.status,
          locationLabel: payload.locationLabel,
        }).unwrap();
        toast.success('Rollcall status updated');
      } catch (err) {
        console.error('Failed to update rollcall check', err);
        toast.error(err?.data?.message || err?.message || 'Failed to update rollcall check');
      }
    },
    [organizationId, upsertEvacuationCheckMutation]
  );

  const handleStaffSelfCheck = useCallback(
    async (row, status, selectedLocation) => {
      const targetBranchId =
        row?.branchId ||
        (typeof row?.branch === 'object' ? row?.branch?._id : row?.branch) ||
        userAssignedBranchId;

      if (!targetBranchId) {
        toast.error('Site (branchId) is missing for this drill.');
        return;
      }

      try {
        await checkInMyEvacuationMutation({
          organizationId,
          branchId: targetBranchId,
          status,
          locationLabel: selectedLocation || row?.locationLabel || row?.branch?.assemblyPoint || 'Car park',
          clientEventId: `evac-self-${row?.evacuationEventId || row?._id || Date.now()}-${status}-${Date.now()}`,
        }).unwrap();
        toast.success(
          status === 'offSite' ? 'Marked as Off-site successfully.' : 'Marked as Safe successfully.'
        );
      } catch (err) {
        console.error('Failed to check in evacuation status', err);
        toast.error(err?.data?.message || err?.message || 'Unable to update evacuation status.');
      }
    },
    [checkInMyEvacuationMutation, organizationId, userAssignedBranchId]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Fire Drills"
        links={[{ name: 'Dashboard', href: rootPath }, { name: 'Fire Drills' }]}
        action={
          staffDashboard ? null : showSiteFilter ? (
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <InfiniteAutocomplete
                value={selectedBranchOption}
                onChange={handleBranchChange}
                useQuery={useGetBranchesQuery}
                queryArgs={branchQueryArgs}
                mapOption={mapBranchOption}
                extraOptions={EXTRA_BRANCH_OPTIONS}
                label="Site"
                placeholder="Search site..."
                disabled={!organizationId}
                size="small"
                sx={{ minWidth: { xs: 1, sm: 260 } }}
                textFieldProps={{
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify
                          icon="solar:buildings-2-bold-duotone"
                          width={20}
                          sx={{ color: 'text.disabled' }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
              />
              <Button
                variant="contained"
                color="error"
                disabled={Boolean(activeEvent)}
                startIcon={<Iconify icon="solar:danger-triangle-bold" />}
                onClick={startDialog.onTrue}
              >
                Start evacuation
              </Button>
            </Stack>
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

      {staffDashboard && (
        <Box sx={{ mb: 3 }}>
          {loading && !evacuationsApiData?.meta?.fireDrills ? (
            <Grid container spacing={2.5}>
              {[1, 2, 3, 4].map((item) => (
                <Grid key={item} xs={12} sm={6} md={3}>
                  <Skeleton variant="rounded" height={124} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={2.5}>
              {[
                {
                  key: 'percent',
                  title: 'Completion Rate',
                  total: `${evacuationsApiData?.meta?.fireDrills?.percent ?? 0}%`,
                  color: 'primary',
                  icon: `${CONFIG.site.basePath}/assets/icons/navbar/ic-analytics.svg`,
                },
                {
                  key: 'done',
                  title: 'Drills Done',
                  total: evacuationsApiData?.meta?.fireDrills?.done ?? 0,
                  color: 'success',
                  icon: `${CONFIG.site.basePath}/assets/icons/navbar/ic-compliance.svg`,
                },
                {
                  key: 'expected',
                  title: 'Expected Drills',
                  total: evacuationsApiData?.meta?.fireDrills?.expected ?? 0,
                  color: 'warning',
                  icon: `${CONFIG.site.basePath}/assets/icons/navbar/ic-calendar.svg`,
                },
                {
                  key: 'windowMonths',
                  title: 'Window (Months)',
                  total: evacuationsApiData?.meta?.fireDrills?.windowMonths ?? 12,
                  color: 'info',
                  icon: `${CONFIG.site.basePath}/assets/icons/navbar/ic-clock.svg`,
                },
              ].map((item) => (
                <Grid key={item.key} xs={12} sm={6} md={3}>
                  <CourseWidgetSummary
                    title={item.title}
                    total={item.total}
                    color={item.color}
                    icon={item.icon}
                    sx={{
                      transition: (theme) => theme.transitions.create(['box-shadow', 'transform']),
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: (theme) => theme.customShadows?.z12 || 4,
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {staffDashboard && (
        <StaffActiveEvacuationCard
          event={myActiveEvacuationData}
          onCheckIn={handleStaffSelfCheck}
          loading={isCheckingInSelf}
        />
      )}

      {!staffDashboard && (
        <>
          <OnSiteSummary
            summary={onSiteSummaryApiData}
            loading={isSummaryLoading}
            hideSiteDetails={showSiteFilter && branchId === ALL_BRANCHES_VALUE}
          />

          <ActiveEvacuationBanner
            event={activeEvent}
            onViewRollcall={handleOpenDetail}
            onCloseEvacuation={handleCloseEvacuation}
            showCloseButton={!isLineManager}
          />
        </>
      )}

      <Card>
        {!staffDashboard && (
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
          <Scrollbar slotProps={{ content: { width: 1, minWidth: '100%' } }}>
            <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 1050 }}>
              <TableHeadCustom headLabel={staffDashboard ? STAFF_TABLE_HEAD : TABLE_HEAD} />

              <TableBody>
                {loading ? (
                  <TableBodySkeleton
                    rowCount={table.rowsPerPage}
                    cellCount={(staffDashboard ? STAFF_TABLE_HEAD : TABLE_HEAD).length}
                    dense={table.dense}
                  />
                ) : (
                  <>
                    {paginatedRows.map((row, index) => (
                      <EvacuationTableRow
                        key={row._id || row.evacuationEventId || index}
                        row={row}
                        serialNumber={table.page * table.rowsPerPage + index + 1}
                        onOpen={handleOpenDetail}
                        staffDashboard={staffDashboard}
                        onStaffCheck={handleStaffSelfCheck}
                        isCheckingIn={isCheckingInSelf}
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

      {!staffDashboard && (
        <>
          <StartEvacuationDialog
            open={startDialog.value}
            onClose={startDialog.onFalse}
            onStart={handleStart}
            branchLabel={onSiteSummary?.branchName}
            onSiteTotal={onSiteSummary?.counts?.total ?? 0}
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
            canClose={!isLineManager}
          />
        </>
      )}
    </DashboardContent>
  );
}