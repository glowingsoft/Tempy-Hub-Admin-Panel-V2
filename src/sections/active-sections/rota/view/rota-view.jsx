import { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';

import {
  ROTA_ACCESS,
  ROTA_DAYS,
  ROTA_LOCATIONS,
  ROTA_SCOPE_OPTIONS_BY_PERMISSION,
  ROTA_SUMMARY,
  ROTA_TEAMS,
} from '../mocks/data';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { toast } from 'src/components/snackbar';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { DashboardContent } from 'src/layouts/dashboard';
import { paths } from 'src/routes/paths';
import { OwnerBranchFilterActions, useOwnerBranchFilter } from 'src/sections/branch/owner-branch-select';
import { TempyConnectCard } from 'src/sections/tempy-connection/tempy-connect-card';
import { selectUser } from 'src/store/slices/userSlice';

import RotaScheduleGrid from '../rota-schedule-grid';
import RotaStaffDetailPanel from '../rota-staff-detail-panel';
import RotaSummaryBar from '../rota-summary-bar';
import RotaToolbar from '../rota-toolbar';
import RotaCellActionPopover from '../rota-cell-action-popover';
import RotaBookShiftDialog from '../rota-book-shift-dialog';
import RotaCreateLeaveDialog from '../rota-create-leave-dialog';

// ----------------------------------------------------------------------

const defaultValues = {
  period: 'Fortnight',
  filter: 'current',
  groupBy: 'team',
};

export default function RotaView({ ownerDashboard = false, showTempyConnect = false }) {
  const user = useSelector(selectUser);
  const { branchId, onBranchChange } = useOwnerBranchFilter();

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [teamsData, setTeamsData] = useState(ROTA_TEAMS);
  const [selectedTeamId, setSelectedTeamId] = useState('all');

  const { state, setState } = useSetState(defaultValues);
  const locked = useBoolean();

  const rangeLabel = `${ROTA_DAYS[0].label.split(' ')[1]} ${ROTA_DAYS[0].label.split(' ')[2]} - ${ROTA_DAYS[ROTA_DAYS.length - 1].label.split(' ')[1]
    } ${ROTA_DAYS[ROTA_DAYS.length - 1].label.split(' ')[2]}`;

  const isStaff = user?.accountState?.userType === 'staff';

  // Client feedback: "myself" vs "team(s) I'm in or manage", gated by
  // permission — a line manager/site manager/owner can switch, a staff
  // member is locked to their own rota (see ROTA_SCOPE_OPTIONS_BY_PERMISSION).
  const scopeOptions = ROTA_SCOPE_OPTIONS_BY_PERMISSION[user?.permission] || ROTA_SCOPE_OPTIONS_BY_PERMISSION[5];
  const [scope, setScope] = useState(scopeOptions[scopeOptions.length - 1].value);

  // Managed teams list (teams the manager belongs to or manages)
  const managedTeams = useMemo(
    () => teamsData.filter((team) => ROTA_ACCESS.managedTeamIds.includes(team.id)),
    [teamsData]
  );

  const visibleTeams = useMemo(() => {
    if (scope === 'personal') {
      return teamsData
        .map((team) => ({
          ...team,
          staff: team.staff.filter((member) => member.id === ROTA_ACCESS.ownStaffId),
        }))
        .filter((team) => team.staff.length > 0);
    }
    if (scope === 'managed') {
      const managed = teamsData.filter((team) => ROTA_ACCESS.managedTeamIds.includes(team.id));
      if (selectedTeamId && selectedTeamId !== 'all') {
        return managed.filter((team) => team.id === selectedTeamId);
      }
      return managed;
    }
    return teamsData;
  }, [scope, selectedTeamId, teamsData]);

  const totalStaffShown = visibleTeams.reduce((sum, team) => sum + team.staff.length, 0);

  // Unfiltered by the managed-team dropdown, so the toolbar can show
  // "X of Y shown" when a single team is selected out of several managed.
  const scopedTeams = useMemo(() => {
    if (scope === 'personal') {
      return teamsData
        .map((team) => ({
          ...team,
          staff: team.staff.filter((member) => member.id === ROTA_ACCESS.ownStaffId),
        }))
        .filter((team) => team.staff.length > 0);
    }
    if (scope === 'managed') {
      return teamsData.filter((team) => ROTA_ACCESS.managedTeamIds.includes(team.id));
    }
    return teamsData;
  }, [scope, teamsData]);

  const totalStaffInScope = scopedTeams.reduce((sum, team) => sum + team.staff.length, 0);

  // Scoped Total Hours and Shifts derived reactively from visible teams
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

  // Money Earnt — only for your own rota, and only when a rate is set
  const ownStaff = scope === 'personal' ? visibleTeams[0]?.staff[0] : null;
  const personalEarnings = ownStaff?.hourlyRate
    ? (parseFloat(ownStaff.totalHours) || 0) * ownStaff.hourlyRate
    : null;

  // Date cell interactive selection states
  const [cellPopoverAnchor, setCellPopoverAnchor] = useState(null);
  const [selectedCellData, setSelectedCellData] = useState(null);
  const [bookShiftOpen, setBookShiftOpen] = useState(false);
  const [createLeaveOpen, setCreateLeaveOpen] = useState(false);

  const handleCellClick = useCallback(({ staff, day, target }) => {
    setCellPopoverAnchor(target);
    setSelectedCellData({ staff, day });
  }, []);

  const handleOpenBookShift = useCallback((data) => {
    setSelectedCellData(data);
    setBookShiftOpen(true);
  }, []);

  const handleOpenCreateLeave = useCallback((data) => {
    setSelectedCellData(data);
    setCreateLeaveOpen(true);
  }, []);

  const handleBookShiftSubmit = useCallback(
    ({ staffId, date, shift }) => {
      setTeamsData((prevTeams) =>
        prevTeams.map((team) => {
          const hasStaff = team.staff.some((s) => s.id === staffId);
          if (!hasStaff) return team;

          const updatedStaff = team.staff.map((member) => {
            if (member.id !== staffId) return member;

            const currentShifts = member.shifts?.[date] || [];
            const updatedShifts = [...currentShifts, shift];
            const newHours = (parseFloat(member.totalHours) || 0) + (shift.hours || 8);

            return {
              ...member,
              totalHours: `${newHours}h`,
              shifts: {
                ...member.shifts,
                [date]: updatedShifts,
              },
            };
          });

          return {
            ...team,
            staff: updatedStaff,
          };
        })
      );

      const staffName = selectedCellData?.staff?.name || 'Staff member';
      toast.success(`Shift booked for ${staffName} on ${date}!`);
    },
    [selectedCellData]
  );

  const handleCreateLeaveSubmit = useCallback(
    (payload) => {
      const { staffId, startDate, endDate, leaveType, reason } = payload;
      const start = dayjs(startDate);
      const end = dayjs(endDate);

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
    },
    [selectedCellData]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={ownerDashboard ? 'Rota Management' : scope === 'personal' ? 'My Rota' : 'Rota'}
        links={[
          {
            name: 'Dashboard',
            href: ownerDashboard ? paths.owner.root : isStaff ? paths.staff.dashboard : paths.lineManager.root,
          },
          { name: ownerDashboard ? 'Rota Management' : scope === 'personal' ? 'My Rota' : 'Rota' },
        ]}
        action={ownerDashboard ? <OwnerBranchFilterActions value={branchId} onChange={onBranchChange} /> : null}
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
          filter={state.filter}
          groupBy={state.groupBy}
          locked={locked.value}
          onToggleLock={locked.onToggle}
          scope={scope}
          scopeOptions={scopeOptions}
          onScopeChange={(value) => {
            setScope(value);
            setSelectedStaff(null);
          }}
          managedTeams={managedTeams}
          selectedTeamId={selectedTeamId}
          onSelectTeamId={setSelectedTeamId}
          shownCount={totalStaffShown}
          totalCount={totalStaffInScope}
          onPeriodChange={(value) => setState({ period: value })}
          onFilterChange={(value) => setState({ filter: value })}
          onGroupByChange={(value) => setState({ groupBy: value })}
          onPrev={() => console.log('prev range')}
          onNext={() => console.log('next range')}
          onRefresh={() => console.log('refresh rota')}
        />

        {/* Compact Total Summary Bar: removes vertical dead space */}
        <RotaSummaryBar
          totalHours={scopedTotalHours}
          totalShifts={scopedTotalShifts}
          totalCost={ROTA_SUMMARY.totalCost}
          showTotalCost={!isStaff && scope === 'all'}
          earnings={personalEarnings}
        />

        {/* Full-width schedule grid */}
        <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
          <RotaScheduleGrid
            teams={visibleTeams}
            days={ROTA_DAYS}
            selectedStaffId={selectedStaff?.id}
            onSelectStaff={setSelectedStaff}
            onCellClick={handleCellClick}
          />
        </Box>
      </Card>

      {/* Slide-over right drawer for Staff details and quick actions */}
      <Drawer
        anchor="right"
        open={Boolean(selectedStaff)}
        onClose={() => setSelectedStaff(null)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 340 },
            p: 2.5,
          },
        }}
      >
        <RotaStaffDetailPanel
          staff={selectedStaff}
          onBack={() => setSelectedStaff(null)}
          onAction={(actionKey, staff) => {
            console.log(actionKey, staff);
          }}
        />
      </Drawer>

      {/* Date Cell Contextual Popover */}
      <RotaCellActionPopover
        open={Boolean(cellPopoverAnchor)}
        anchorEl={cellPopoverAnchor}
        onClose={() => setCellPopoverAnchor(null)}
        cellData={selectedCellData}
        onBookShift={handleOpenBookShift}
        onCreateLeave={handleOpenCreateLeave}
      />

      {/* Book Shift Dialog */}
      <RotaBookShiftDialog
        open={bookShiftOpen}
        onClose={() => setBookShiftOpen(false)}
        cellData={selectedCellData}
        onSubmit={handleBookShiftSubmit}
      />

      {/* Create Leave Dialog */}
      <RotaCreateLeaveDialog
        open={createLeaveOpen}
        onClose={() => setCreateLeaveOpen(false)}
        cellData={selectedCellData}
        onSubmit={handleCreateLeaveSubmit}
      />
    </DashboardContent>
  );
}
