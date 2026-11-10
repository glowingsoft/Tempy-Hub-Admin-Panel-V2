import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isoWeek);

// ----------------------------------------------------------------------

const TEAM_COLORS = ['#FF5630', '#212B36', '#00A76F', '#00B8D9', '#7928CA', '#FFAB00'];

export function capitalizeWords(str) {
  if (!str) return '';
  return String(str)
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
    .join(' ')
    .trim();
}

export function formatTime12h(isoOrTimeStr) {
  if (!isoOrTimeStr) return '';
  const str = String(isoOrTimeStr).trim();

  // If ISO 8601 string (e.g. 2026-11-04T09:00:00.000Z)
  if (str.includes('T')) {
    const d = dayjs(str);
    if (d.isValid()) {
      return d.format('h:mm A');
    }
  }

  // If already contains AM / PM
  if (/am|pm/i.test(str)) {
    return str.replace(/([ap])m?/i, (_, p) => ` ${p.toUpperCase()}M`).trim();
  }

  // If "09:00" or "09:00:00"
  if (str.includes(':')) {
    const parts = str.split(':');
    const h = Number(parts[0]);
    const m = Number(parts[1] || 0);
    if (!Number.isNaN(h)) {
      const period = h >= 12 ? 'PM' : 'AM';
      const displayHours = h % 12 || 12;
      const displayMins = m < 10 ? `0${m}` : `${m}`;
      return `${displayHours}:${displayMins} ${period}`;
    }
  }

  return str;
}

export function getDateRangeForPeriod(period = 'Fortnight', anchorDate = dayjs()) {
  const norm = (period || 'Fortnight').toLowerCase();
  let from;
  let to;

  if (norm === 'week') {
    from = anchorDate.startOf('isoWeek');
    to = anchorDate.endOf('isoWeek');
  } else if (norm === 'month') {
    from = anchorDate.startOf('month');
    to = anchorDate.endOf('month');
  } else {
    // Fortnight (14 days from start of isoWeek)
    from = anchorDate.startOf('isoWeek');
    to = from.add(13, 'day');
  }

  const rangeLabel = `${from.format('D MMM')} – ${to.format('D MMM YYYY')}`;

  return {
    from: from.format('YYYY-MM-DD'),
    to: to.format('YYYY-MM-DD'),
    rangeLabel,
  };
}

export function generateDaysForRange(fromStr, toStr) {
  const start = dayjs(fromStr);
  const end = dayjs(toStr);
  const days = [];
  const todayStr = dayjs().format('YYYY-MM-DD');

  let curr = start;
  while (curr.isBefore(end) || curr.isSame(end, 'day')) {
    const dateStr = curr.format('YYYY-MM-DD');
    days.push({
      date: dateStr,
      weekday: curr.format('ddd'),
      label: curr.format('ddd D MMM'),
      isToday: dateStr === todayStr,
      weather: 'cloud',
      hours: '',
    });
    curr = curr.add(1, 'day');
  }

  return days;
}

export function mapRotaBoardFromApi(apiData, options = {}) {
  const { from, to, defaultPermissions = { canBookShift: true, canRecordLeave: true } } = options;

  if (!apiData || (!apiData.teams && !apiData.days && !apiData.unassigned)) {
    const days = from && to ? generateDaysForRange(from, to) : [];
    return {
      days,
      teams: [],
      summary: { totalHours: 0, totalShifts: 0, staffCount: 0, unassignedCount: 0 },
      permissions: defaultPermissions,
    };
  }

  // 1. Days mapping
  let days = [];
  if (Array.isArray(apiData.days) && apiData.days.length > 0) {
    const todayStr = apiData.range?.today || dayjs().format('YYYY-MM-DD');
    days = apiData.days.map((d) => {
      const parsed = dayjs(d.date);
      const weekday = d.weekday || (parsed.isValid() ? parsed.format('ddd') : '');
      const label = parsed.isValid() ? `${weekday} ${parsed.format('D MMM')}` : d.label || d.date;

      return {
        date: d.date,
        weekday,
        label,
        isToday: Boolean(d.isToday || d.date === todayStr),
        weather: d.weather || 'cloud',
        hours: d.hours || '',
      };
    });
  } else if (apiData.range?.from && apiData.range?.to) {
    days = generateDaysForRange(apiData.range.from, apiData.range.to);
  } else if (from && to) {
    days = generateDaysForRange(from, to);
  }

  // 2. Teams and Staff mapping
  const rawTeams = Array.isArray(apiData.teams) ? apiData.teams : [];
  const teams = rawTeams.map((team, tIdx) => {
    const teamId = team.departmentId || team._id || team.id || `team-${tIdx}`;
    const staffList = (team.staff || []).map((member, mIdx) => {
      const staffId = member.staffId || member._id || member.id || `staff-${tIdx}-${mIdx}`;

      // Convert cells array to { [date]: [shift1, shift2] } mapping
      let shiftsByDate = {};
      if (Array.isArray(member.cells)) {
        member.cells.forEach((cell) => {
          if (!cell.date) return;
          const shifts = (cell.shifts || []).map((sh, sIdx) => {
            const shiftType =
              sh.type ||
              (sh.status === 'open'
                ? 'open'
                : sh.kind === 'leave' || sh.status === 'leave'
                  ? 'leave'
                  : sh.shiftType === 'sleepover'
                    ? 'sleepover'
                    : 'default');

            return {
              id: sh.shiftId || sh._id || sh.id || `sh-${sIdx}`,
              shiftId: sh.shiftId || sh._id || sh.id || `sh-${sIdx}`,
              start: sh.start || formatTime12h(sh.startsAt),
              end: sh.end || formatTime12h(sh.endsAt),
              type: shiftType,
              status: sh.status || 'scheduled',
              label:
                sh.label ||
                (shiftType === 'leave' ? sh.leaveType || 'Leave' : undefined),
              raw: sh,
            };
          });
          shiftsByDate[cell.date] = shifts;
        });
      } else if (member.shifts && typeof member.shifts === 'object') {
        shiftsByDate = member.shifts;
      }

      const totalHours =
        member.totalMinutes != null
          ? `${Math.round((member.totalMinutes / 60) * 10) / 10}h`
          : member.totalHours || '0h';

      return {
        id: staffId,
        staffId,
        name: member.name ? capitalizeWords(member.name) : 'Staff Member',
        email: member.email || member.userId?.email || member.user?.email || '',
        employeeCode: member.employeeCode || '',
        photoUrl: member.photoUrl || '',
        role: member.role || 'Staff',
        hourlyRate: member.hourlyRate || 12.5,
        totalHours,
        vacant: Boolean(member.vacant),
        shifts: shiftsByDate,
      };
    });

    const totalHoursTeam =
      team.totalMinutes != null
        ? `${Math.round(team.totalMinutes / 60)}h`
        : team.stats?.hours || '0h';

    return {
      id: teamId,
      name: team.name || 'Team',
      color: team.color || TEAM_COLORS[tIdx % TEAM_COLORS.length],
      stats: {
        staff: staffList.length,
        teams: team.stats?.teams || 0,
        breaks: team.stats?.breaks || 0,
        hours: totalHoursTeam,
      },
      staff: staffList,
    };
  });

  // 3. Unassigned shifts row (if present and non-empty)
  if (apiData.unassigned && Array.isArray(apiData.unassigned.cells)) {
    const unassignedShiftsByDate = {};
    let hasUnassigned = false;

    apiData.unassigned.cells.forEach((cell) => {
      if (!cell.date || !Array.isArray(cell.shifts) || !cell.shifts.length) return;
      hasUnassigned = true;
      unassignedShiftsByDate[cell.date] = cell.shifts.map((sh, sIdx) => ({
        id: sh.shiftId || sh._id || sh.id || `open-sh-${sIdx}`,
        shiftId: sh.shiftId || sh._id || sh.id,
        start: sh.start || formatTime12h(sh.startsAt),
        end: sh.end || formatTime12h(sh.endsAt),
        type: 'open',
        status: 'open',
        label:
          sh.label ||
          (sh.startsAt && sh.endsAt
            ? `Open ${formatTime12h(sh.startsAt)}–${formatTime12h(sh.endsAt)}`
            : 'Open shift'),
        raw: sh,
      }));
    });

    if (hasUnassigned) {
      teams.push({
        id: 'team-unassigned',
        name: 'Unassigned Shifts',
        color: '#00B8D9',
        stats: {
          staff: 1,
          teams: 0,
          breaks: 0,
          hours: `${apiData.summary?.unassignedCount || Object.keys(unassignedShiftsByDate).length} open`,
        },
        staff: [
          {
            id: 'staff-unassigned',
            staffId: 'staff-unassigned',
            name: 'Unassigned',
            vacant: false,
            role: 'Open Shifts',
            totalHours: '',
            shifts: unassignedShiftsByDate,
          },
        ],
      });
    }
  }

  // 4. Summary mapping
  const summary = {
    totalMinutes:
      apiData.summary?.totalMinutes != null
        ? Number(apiData.summary.totalMinutes)
        : 0,
    totalHours:
      apiData.summary?.totalMinutes != null
        ? Math.round((apiData.summary.totalMinutes / 60) * 10) / 10
        : 0,
    totalShifts:
      apiData.summary?.shiftCount != null
        ? Number(apiData.summary.shiftCount)
        : 0,
    staffCount: apiData.summary?.staffCount != null ? Number(apiData.summary.staffCount) : 0,
    unassignedCount:
      apiData.summary?.unassignedCount != null ? Number(apiData.summary.unassignedCount) : 0,
  };

  // 5. Permissions
  const permissions = {
    canBookShift: apiData.permissions?.canBookShift !== undefined
      ? Boolean(apiData.permissions.canBookShift)
      : defaultPermissions.canBookShift ?? true,
    canRecordLeave: apiData.permissions?.canRecordLeave !== undefined
      ? Boolean(apiData.permissions.canRecordLeave)
      : defaultPermissions.canRecordLeave ?? true,
  };

  return {
    days,
    teams,
    summary,
    permissions,
  };
}
