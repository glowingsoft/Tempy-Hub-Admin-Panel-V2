import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';

import { useCanManage } from 'src/auth/hooks';
import { ModuleSlug } from 'src/auth/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import { InfiniteAutocomplete } from 'src/components/infinite-autocomplete';
import { toast } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { useCurrentOrganization } from 'src/hooks/use-current-organization';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { usePathname } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { LeaveEntitlementModal } from 'src/sections/leave-request/leave-entitlement-modal';
import { getAssignedBranch } from 'src/sections/org-rollup/utils';
import { TempyConnectCard } from 'src/sections/tempy-connection/tempy-connect-card';
import { useGetBranchesQuery } from 'src/store/Reducer/branches-api';
import {
  useBookRotaShiftMutation,
  useGetRotaBoardQuery,
  useRecordRotaLeaveMutation,
} from 'src/store/Reducer/rota-api';
import { selectUser } from 'src/store/slices/userSlice';

import { getDateRangeForPeriod, mapRotaBoardFromApi } from '../rota-mappers';
import RotaBookShiftDialog from '../rota-book-shift-dialog';
import RotaCellActionPopover from '../rota-cell-action-popover';
import RotaCreateLeaveDialog from '../rota-create-leave-dialog';
import RotaScheduleGrid from '../rota-schedule-grid';
import { RotaGridSkeleton } from '../rota-skeleton';
import RotaSummaryBar from '../rota-summary-bar';
import RotaToolbar from '../rota-toolbar';

// ----------------------------------------------------------------------

const defaultValues = {
  period: 'Fortnight',
};

const ALL_SCOPE_OPTIONS = [
  { value: 'personal', label: 'My Rota' },
  { value: 'managed', label: 'My Team(s)' },
  { value: 'all', label: 'All Teams' },
];

const LM_SCOPE_OPTIONS = [
  { value: 'personal', label: 'My Rota' },
  { value: 'managed', label: 'My Team(s)' },
];

export default function RotaView({ ownerDashboard = false, showTempyConnect = false }) {
  const user = useSelector(selectUser);
  const { organizationId, isOwner: orgIsOwner } = useCurrentOrganization();

  const pathname = usePathname();
  const isStaffRoute = Boolean(pathname?.startsWith('/staff') || pathname?.includes('/staff'));

  // Role detection: Owner, Site Manager (sm), Line Manager (lm), Staff
  const isOwner =
    !isStaffRoute &&
    (ownerDashboard ||
      orgIsOwner ||
      user?.role === 'owner' ||
      user?.role === 'Organization Owner' ||
      user?.permission === 1 ||
      user?.permission === 4);

  const isSiteManager =
    !isStaffRoute &&
    !isOwner &&
    (user?.permission === 2 || user?.role === 'site-manager' || user?.role === 'Site Manager');

  const isLineManager =
    !isStaffRoute &&
    !isOwner &&
    !isSiteManager &&
    (user?.permission === 3 || user?.role === 'line-manager' || user?.role === 'Line Manager');

  const isStaff =
    isStaffRoute ||
    (!isOwner &&
      !isSiteManager &&
      !isLineManager &&
      (user?.permission === 5 ||
        user?.accountState?.userType === 'staff' ||
        user?.role?.toLowerCase() === 'staff'));

  const canManageRota = useCanManage(ModuleSlug.ROTA_SCHEDULING);
  const canManageLeave = useCanManage(ModuleSlug.LEAVE);

  // Role-specific scope configuration
  const scopeOptions = useMemo(() => {
    if (isStaff) return []; // Staff is locked to personal
    if (isOwner || isSiteManager) return ALL_SCOPE_OPTIONS;
    if (isLineManager) return LM_SCOPE_OPTIONS;
    return [];
  }, [isStaff, isOwner, isSiteManager, isLineManager]);

  const initialScope = useMemo(() => {
    if (isStaff) return 'personal';
    if (isOwner || isSiteManager) return 'all';
    if (isLineManager) return 'managed';
    return 'personal';
  }, [isStaff, isOwner, isSiteManager, isLineManager]);

  const [scope, setScope] = useState(initialScope);
  const [selectedTeamId, setSelectedTeamId] = useState('all');

  // Site / Branch selection (Enabled for Owner via InfiniteAutocomplete, auto-scoped for Site Manager)
  const [selectedBranchOption, setSelectedBranchOption] = useState(null);
  const branchId = selectedBranchOption?.value;

  const assignedBranch = useMemo(
    () => (!isOwner ? getAssignedBranch(user, organizationId) : null),
    [isOwner, user, organizationId]
  );

  const { data: branchesResponse } = useGetBranchesQuery(
    { organizationId, page: 1, limit: 100 },
    { skip: !organizationId }
  );

  // Auto-select or sync site when branches load:
  // - For Owner: auto-select first/top site if none is selected
  // - For Site Manager / Line Manager: match assigned branch or pick accessible branch
  useEffect(() => {
    const branches = branchesResponse?.data || [];

    if (isOwner) {
      if (branches.length > 0 && (!selectedBranchOption || selectedBranchOption.value === 'all')) {
        const topSite = branches[0];
        setSelectedBranchOption({
          value: topSite._id || topSite.id,
          label: topSite.name,
          timezone: topSite.timezone || 'Europe/London',
        });
      }
    } else {
      const branchIdToMatch = assignedBranch?.id || selectedBranchOption?.value;
      const matched = branchIdToMatch
        ? branches.find((b) => (b._id || b.id) === branchIdToMatch)
        : null;
      const effectiveSite = matched || branches[0];

      if (effectiveSite) {
        const nextId = effectiveSite._id || effectiveSite.id;
        if (
          selectedBranchOption?.value !== nextId ||
          selectedBranchOption?.label !== effectiveSite.name
        ) {
          setSelectedBranchOption({
            value: nextId,
            label: effectiveSite.name,
            timezone: effectiveSite.timezone || 'Europe/London',
          });
        }
      } else if (
        assignedBranch?.id &&
        (!selectedBranchOption || selectedBranchOption.value !== assignedBranch.id)
      ) {
        setSelectedBranchOption({
          value: assignedBranch.id,
          label: assignedBranch.name || 'Site',
          timezone: 'Europe/London',
        });
      }
    }
  }, [isOwner, branchesResponse, selectedBranchOption, assignedBranch]);

  const facilityTimezone = useMemo(() => {
    return selectedBranchOption?.timezone || 'Europe/London';
  }, [selectedBranchOption]);

  const handleBranchChange = useCallback((arg1, arg2) => {
    const selected =
      arg2 && typeof arg2 === 'object' && ('value' in arg2 || 'label' in arg2)
        ? arg2
        : arg1 && typeof arg1 === 'object' && ('value' in arg1 || 'label' in arg1)
          ? arg1
          : null;

    if (selected && selected.value !== 'all') {
      setSelectedBranchOption(selected);
    }
  }, []);

  // Period and date navigation
  const { state, setState } = useSetState(defaultValues);
  const [anchorDate, setAnchorDate] = useState(dayjs());
  const locked = useBoolean();

  const { from, to, rangeLabel } = useMemo(
    () => getDateRangeForPeriod(state.period, anchorDate),
    [state.period, anchorDate]
  );

  const handlePrevRange = useCallback(() => {
    setAnchorDate((prev) => {
      const p = state.period.toLowerCase();
      if (p === 'week') return prev.subtract(1, 'week');
      if (p === 'month') return prev.subtract(1, 'month');
      return prev.subtract(14, 'day');
    });
  }, [state.period]);

  const handleNextRange = useCallback(() => {
    setAnchorDate((prev) => {
      const p = state.period.toLowerCase();
      if (p === 'week') return prev.add(1, 'week');
      if (p === 'month') return prev.add(1, 'month');
      return prev.add(14, 'day');
    });
  }, [state.period]);

  // Rota Board API Query
  const queryArgs = useMemo(() => {
    return {
      organizationId,
      branchId: isOwner ? (branchId || undefined) : undefined,
      scope: isStaff ? 'personal' : scope,
      period: state.period.toLowerCase(),
      from,
      to,
      timezone: facilityTimezone,
      departmentId:
        scope === 'managed' && selectedTeamId !== 'all' ? selectedTeamId : undefined,
    };
  }, [organizationId, isOwner, branchId, isStaff, scope, state.period, from, to, facilityTimezone, selectedTeamId]);

  const {
    data: apiRotaData,
    isLoading: isRotaLoading,
    isFetching: isRotaFetching,
    isSuccess: isRotaSuccess,
    refetch: refetchRota,
  } = useGetRotaBoardQuery(queryArgs, {
    skip: !organizationId || (isOwner && !branchId),
  });

  // Map API response to UI shape (strictly without static mock data)
  const mappedBoard = useMemo(() => {
    return mapRotaBoardFromApi(apiRotaData, {
      from,
      to,
      defaultPermissions: {
        canBookShift: !isStaff && canManageRota,
        canRecordLeave: !isStaff && canManageLeave,
      },
    });
  }, [apiRotaData, from, to, isStaff, canManageRota, canManageLeave]);

  // Working state for teams (allows optimistic local updates)
  const [teamsData, setTeamsData] = useState([]);
  const [hasInitializedRotaData, setHasInitializedRotaData] = useState(false);

  useEffect(() => {
    setTeamsData(mappedBoard.teams || []);
    if (isRotaSuccess) {
      setHasInitializedRotaData(true);
    }
  }, [mappedBoard.teams, isRotaSuccess]);

  // Effective permissions from API or role rules
  const effectivePermissions = useMemo(() => {
    if (locked.value) {
      return {
        canBookShift: false,
        canRecordLeave: false,
      };
    }
    return {
      canBookShift: Boolean(
        (mappedBoard.permissions?.canBookShift ?? !isStaff) && canManageRota
      ),
      canRecordLeave: Boolean(
        (mappedBoard.permissions?.canRecordLeave ?? !isStaff) && canManageLeave
      ),
    };
  }, [mappedBoard.permissions, isStaff, locked.value]);

  // Available managed teams for the team dropdown filter
  const managedTeams = useMemo(() => {
    if (scope !== 'managed') return [];
    return teamsData.filter((team) => team.id !== 'team-unassigned');
  }, [teamsData, scope]);

  // Filtered visible teams based on active scope & team dropdown
  const visibleTeams = useMemo(() => {
    if (scope === 'personal') {
      const ownId = user?._id || user?.id || user?.staffProfileId || user?.staffId;
      return teamsData
        .map((team) => ({
          ...team,
          staff: team.staff.filter((m) => !ownId || m.id === ownId || m.staffId === ownId),
        }))
        .filter((team) => team.staff.length > 0);
    }

    if (scope === 'managed') {
      if (selectedTeamId && selectedTeamId !== 'all') {
        return teamsData.filter((team) => team.id === selectedTeamId);
      }
      return teamsData.filter((team) => team.id !== 'team-unassigned');
    }

    return teamsData;
  }, [scope, selectedTeamId, teamsData, user]);

  const totalStaffShown = visibleTeams.reduce(
    (sum, team) => sum + (team.id === 'team-unassigned' ? 0 : team.staff.length),
    0
  );

  const scopedTeams = useMemo(() => {
    if (scope === 'personal') {
      const ownId = user?._id || user?.id || user?.staffProfileId || user?.staffId;
      return teamsData
        .map((team) => ({
          ...team,
          staff: team.staff.filter((m) => !ownId || m.id === ownId || m.staffId === ownId),
        }))
        .filter((team) => team.staff.length > 0);
    }
    return teamsData;
  }, [scope, teamsData, user]);

  const totalStaffInScope = scopedTeams.reduce(
    (sum, team) => sum + (team.id === 'team-unassigned' ? 0 : team.staff.length),
    0
  );

  // Scoped summary stats
  const scopedTotalHours = useMemo(() => {
    return visibleTeams.reduce(
      (sum, team) =>
        sum +
        team.staff.reduce((s, member) => s + (parseFloat(member.totalHours) || 0), 0),
      0
    );
  }, [visibleTeams]);

  const scopedTotalShifts = useMemo(() => {
    return visibleTeams.reduce(
      (sum, team) =>
        sum +
        team.staff.reduce(
          (s, member) =>
            s +
            Object.values(member.shifts || {}).reduce(
              (n, dayShifts) => n + dayShifts.filter((sh) => sh.type !== 'leave').length,
              0
            ),
          0
        ),
      0
    );
  }, [visibleTeams]);

  // Derived summary numbers preferring API summary when unfiltered
  const summaryStaffCount = useMemo(() => {
    if (mappedBoard.summary?.staffCount != null && selectedTeamId === 'all' && scope !== 'personal') {
      return mappedBoard.summary.staffCount;
    }
    return totalStaffShown;
  }, [mappedBoard.summary?.staffCount, selectedTeamId, scope, totalStaffShown]);

  const summaryTotalMinutes = useMemo(() => {
    if (mappedBoard.summary?.totalMinutes != null && selectedTeamId === 'all' && scope !== 'personal') {
      return mappedBoard.summary.totalMinutes;
    }
    return Math.round(scopedTotalHours * 60);
  }, [mappedBoard.summary?.totalMinutes, selectedTeamId, scope, scopedTotalHours]);

  const summaryTotalShifts = useMemo(() => {
    if (mappedBoard.summary?.totalShifts != null && selectedTeamId === 'all' && scope !== 'personal') {
      return mappedBoard.summary.totalShifts;
    }
    return scopedTotalShifts;
  }, [mappedBoard.summary?.totalShifts, selectedTeamId, scope, scopedTotalShifts]);

  const summaryUnassignedCount = useMemo(() => {
    if (mappedBoard.summary?.unassignedCount != null && selectedTeamId === 'all' && scope !== 'personal') {
      return mappedBoard.summary.unassignedCount;
    }
    const unassignedTeam = teamsData.find((t) => t.id === 'team-unassigned');
    if (!unassignedTeam) return 0;
    return unassignedTeam.staff.reduce(
      (sum, s) =>
        sum +
        Object.values(s.shifts || {}).reduce((sub, shifts) => sub + shifts.length, 0),
      0
    );
  }, [mappedBoard.summary?.unassignedCount, selectedTeamId, scope, teamsData]);

  // Date cell interactive selection states
  const [cellPopoverAnchor, setCellPopoverAnchor] = useState(null);
  const [selectedCellData, setSelectedCellData] = useState(null);
  const [bookShiftOpen, setBookShiftOpen] = useState(false);
  const [createLeaveOpen, setCreateLeaveOpen] = useState(false);
  const [entitlementOpen, setEntitlementOpen] = useState(false);
  const [selectedEntitlementStaffId, setSelectedEntitlementStaffId] = useState(null);

  // RTK Query Mutations
  const [bookRotaShift] = useBookRotaShiftMutation();
  const [recordRotaLeave] = useRecordRotaLeaveMutation();

  // Distinct staff list across all teams for general dialog selectors
  const allStaffList = useMemo(() => {
    const map = new Map();
    teamsData.forEach((team) => {
      team.staff.forEach((s) => {
        if (!map.has(s.id)) {
          map.set(s.id, {
            id: s.id,
            name: s.name,
            role: s.role,
          });
        }
      });
    });
    return Array.from(map.values());
  }, [teamsData]);

  // Cell Click: respect role permissions
  const handleCellClick = useCallback(
    (arg1, arg2) => {
      if (isStaff || locked.value) {
        // View-only for staff or when locked
        return;
      }

      const data = arg2 || arg1 || {};
      const target = arg1?.currentTarget || data.target || (arg1?.target ? arg1.target : null);

      setCellPopoverAnchor(target);
      setSelectedCellData({
        staff: data.staff,
        day: data.day,
        shifts: data.shifts || (data.staff?.shifts?.[data.day?.date]) || [],
        team: data.team,
      });
    },
    [isStaff, locked.value]
  );

  const handleOpenBookShift = useCallback((data) => {
    if (data) {
      setSelectedCellData((prev) => ({ ...prev, ...data }));
    }
    setBookShiftOpen(true);
  }, []);

  const handleOpenCreateLeave = useCallback((data) => {
    setSelectedCellData(data);
    setCreateLeaveOpen(true);
  }, []);

  const handleOpenSetEntitlement = useCallback((data) => {
    setSelectedEntitlementStaffId(data?.staff?.id || data?.staff?.staffId || null);
    setEntitlementOpen(true);
  }, []);

  // Book Shift action handler
  const handleBookShiftSubmit = useCallback(
    async (payload) => {
      try {
        if (organizationId) {
          await bookRotaShift({
            organizationId,
            branchId: payload.branchId || branchId,
            startsAt: payload.startsAt,
            endsAt: payload.endsAt,
            ...(payload.staffId ? { staffId: payload.staffId } : {}),
          }).unwrap();
        }

        refetchRota();
        toast.success('Shift created successfully!');
      } catch (err) {
        console.error('Failed to book shift:', err);
        toast.error(err?.data?.message || err?.message || 'Failed to create shift');
      }
    },
    [organizationId, branchId, bookRotaShift, refetchRota]
  );

  // Record Leave action handler
  const handleCreateLeaveSubmit = useCallback(
    async (payload) => {
      const { staffId, startDate, endDate, leaveType, reason, totalDays, timezone } = payload;
      const start = dayjs(startDate);
      const end = dayjs(endDate);

      try {
        if (organizationId) {
          await recordRotaLeave({
            organizationId,
            staffId,
            branchId: isOwner ? (branchId || undefined) : undefined,
            startDate,
            endDate,
            leaveType,
            reason,
            totalDays,
            timezone: timezone || facilityTimezone,
          }).unwrap();
        }

        // Optimistic UI update
        setTeamsData((prevTeams) =>
          prevTeams.map((team) => {
            const hasStaff = team.staff.some((s) => s.id === staffId);
            if (!hasStaff) return team;

            const updatedStaff = team.staff.map((member) => {
              if (member.id !== staffId) return member;

              const updatedShifts = { ...(member.shifts || {}) };
              let curr = start;
              const leaveLabel =
                leaveType === 'sick'
                  ? 'Sick Leave'
                  : leaveType === 'compassionate'
                    ? 'Compassionate'
                    : 'Annual Leave';

              while (curr.isBefore(end) || curr.isSame(end, 'day')) {
                const dateStr = curr.format('YYYY-MM-DD');
                const dayShifts = updatedShifts[dateStr] || [];
                updatedShifts[dateStr] = [
                  ...dayShifts,
                  {
                    type: 'leave',
                    label: leaveLabel,
                    reason,
                  },
                ];
                curr = curr.add(1, 'day');
              }

              return {
                ...member,
                shifts: updatedShifts,
              };
            });

            return {
              ...team,
              staff: updatedStaff,
            };
          })
        );

        const staffName = selectedCellData?.staff?.name || 'Staff member';
        toast.success(`Leave recorded for ${staffName}!`);
      } catch (err) {
        console.error('Failed to record leave:', err);
        toast.error(err?.data?.message || err?.message || 'Failed to record leave');
      }
    },
    [organizationId, isOwner, branchId, facilityTimezone, recordRotaLeave, selectedCellData]
  );

  // Dynamic headings and breadcrumb links per role
  const pageTitle = isOwner
    ? 'Rota Management'
    : scope === 'personal'
      ? 'My Rota'
      : 'Rota';

  const dashboardHref = isOwner
    ? paths.owner.root
    : isSiteManager
      ? paths.siteManager.root
      : isLineManager
        ? paths.lineManager.root
        : paths.staff.dashboard;

  const isInitialLoading =
    isRotaLoading ||
    (!apiRotaData && isRotaFetching) ||
    (isRotaSuccess && !hasInitializedRotaData) ||
    (isOwner && !selectedBranchOption);

  const daysCount =
    mappedBoard.days?.length ||
    (state.period.toLowerCase() === 'week' ? 7 : state.period.toLowerCase() === 'month' ? 30 : 14);

  const handleToggleLock = useCallback(() => {
    locked.onToggle();
    setCellPopoverAnchor(null);
    setBookShiftOpen(false);
    setCreateLeaveOpen(false);
    setEntitlementOpen(false);
  }, [locked]);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={pageTitle}
        links={[{ name: 'Dashboard', href: dashboardHref }, { name: pageTitle }]}
        action={
          isOwner ? (
            <Box sx={{ minWidth: { xs: 1, sm: 260 } }}>
              <InfiniteAutocomplete
                size="small"
                label="Site"
                placeholder="Search site..."
                value={selectedBranchOption}
                onChange={handleBranchChange}
                useQuery={useGetBranchesQuery}
                queryArgs={{ organizationId }}
                enabled={Boolean(organizationId)}
                disableClearable
                mapOption={(branch) => ({
                  value: branch._id || branch.id,
                  label: branch.name,
                  timezone: branch.timezone || 'Europe/London',
                })}
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
            </Box>
          ) : null
        }
        sx={{ mb: { xs: 2.5, md: 3 } }}
      />

      {showTempyConnect ? (
        <TempyConnectCard usagePath={paths.lineManager.tempyConnection} sx={{ mb: 3 }} />
      ) : null}

      <Card sx={{ display: 'flex', flexDirection: 'column', height: '78vh', overflow: 'hidden' }}>
        {/* Top: View toggles & filters */}
        <RotaToolbar
          rangeLabel={rangeLabel}
          period={state.period}
          locked={locked.value}
          onToggleLock={handleToggleLock}
          canLock={!isStaff}
          scope={scope}
          scopeOptions={scopeOptions}
          onScopeChange={(value) => {
            setScope(value);
          }}
          managedTeams={managedTeams}
          selectedTeamId={selectedTeamId}
          onSelectTeamId={setSelectedTeamId}
          onPeriodChange={(value) => setState({ period: value })}
          onPrev={handlePrevRange}
          onNext={handleNextRange}
          onRefresh={refetchRota}
        />

        {isRotaFetching && !isInitialLoading && <LinearProgress sx={{ height: 2 }} />}

        {/* Compact Total Summary Bar */}
        <RotaSummaryBar
          staffCount={summaryStaffCount}
          totalMinutes={summaryTotalMinutes}
          totalShifts={summaryTotalShifts}
          unassignedCount={summaryUnassignedCount}
          showUnassigned={scope !== 'personal'}
          scope={scope}
        />

        {/* Schedule grid or Skeleton loader */}
        <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
          {isInitialLoading ? (
            <RotaGridSkeleton daysCount={daysCount} teamsCount={3} staffPerTeam={3} />
          ) : (
            <RotaScheduleGrid
              teams={visibleTeams}
              days={mappedBoard.days}
              onCellClick={isStaff ? undefined : handleCellClick}
              locked={locked.value}
              readOnly={isStaff}
            />
          )}
        </Box>
      </Card>

      {/* Date Cell Contextual Popover */}
      {!isStaff && (
        <RotaCellActionPopover
          open={Boolean(cellPopoverAnchor)}
          anchorEl={cellPopoverAnchor}
          onClose={() => setCellPopoverAnchor(null)}
          cellData={selectedCellData}
          onBookShift={handleOpenBookShift}
          onSetEntitlement={handleOpenSetEntitlement}
          canBookShift={effectivePermissions.canBookShift}
          canSetEntitlement={!isStaff}
        />
      )}

      {/* Book Shift Dialog */}
      <RotaBookShiftDialog
        open={bookShiftOpen}
        onClose={() => setBookShiftOpen(false)}
        cellData={selectedCellData}
        organizationId={organizationId}
        branchId={branchId}
        selectedBranch={selectedBranchOption}
        branches={branchesResponse?.data || []}
        disabledSite={isOwner || isSiteManager}
        onSubmit={handleBookShiftSubmit}
      />

      {/* Create Leave Dialog */}
      <RotaCreateLeaveDialog
        open={createLeaveOpen}
        onClose={() => setCreateLeaveOpen(false)}
        cellData={selectedCellData}
        staffList={allStaffList}
        timezone={facilityTimezone}
        onSubmit={handleCreateLeaveSubmit}
      />

      {/* Set Leave Entitlement Modal */}
      <LeaveEntitlementModal
        open={entitlementOpen}
        onClose={() => {
          setEntitlementOpen(false);
          setSelectedEntitlementStaffId(null);
        }}
        organizationId={organizationId}
        initialStaffId={selectedEntitlementStaffId}
        onSuccess={() => {
          refetchRota();
        }}
      />
    </DashboardContent>
  );
}
