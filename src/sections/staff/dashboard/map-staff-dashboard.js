import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import { fDurationFromMinutes } from '../utils';

const TIMELINE_TYPES = ['order1', 'order2', 'order3', 'order4', 'order5'];

const NOTIFICATION_COLOR = {
  approval: 'success',
  reminder: 'error',
  announcement: 'info',
};

const STATUS_LABEL = {
  pending: 'Pending',
  overdue: 'Overdue',
  dueSoon: 'Due soon',
  completed: 'Completed',
  onTrack: 'On track',
  notYetDue: 'Not yet due',
};

function statusLabel(status) {
  if (!status) return '';
  return STATUS_LABEL[status] || status.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

function formatHours(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const numeric = Number(value);
  return Number.isInteger(numeric) ? numeric : Math.round(numeric * 10) / 10;
}

function formatMoney(value) {
  if (value == null || Number.isNaN(Number(value))) return null;
  return fCurrency(value, { code: 'en-GB', currency: 'GBP' });
}

function dueCell(dueAt) {
  return dueAt ? fDate(dueAt, 'DD MMM') : '—';
}

export function mapStaffDashboard(data = {}) {
  const summary = data.summary || {};
  const quickActions = data.quickActions || {};
  const weeklyHours = data.weeklyHours || {};
  const nextShifts = data.nextShifts || {};
  const communication = data.communication || [];
  const compliance = data.compliance || {};
  const training = data.training || {};
  const supervisionAppraisal = data.supervisionAppraisal || {};
  const openShifts = data.openShifts || [];
  const days = weeklyHours.days || [];
  const nextShiftDays = nextShifts.days || [];

  const hoursThisWeek = formatHours(summary.hoursThisWeek ?? weeklyHours.workedHours);
  const hourlyRate = summary.hourlyRate;
  const earnedFromApi = formatMoney(summary.earnedThisWeek);
  const earnedFromRate =
    hourlyRate != null && summary.hoursThisWeek != null
      ? formatMoney(Number(hourlyRate) * Number(summary.hoursThisWeek))
      : null;
  const earnedThisWeek = earnedFromApi || earnedFromRate;
  const hasHourlyRate = hourlyRate != null || summary.earnedThisWeek != null;

  const calendarShifts = nextShiftDays.flatMap((day, dayIndex) =>
    (day.shifts || []).map((shift, shiftIndex) => ({
      _id: `${day.date || dayIndex}-${shiftIndex}`,
      startsAt: shift.startsAt,
      endsAt: shift.endsAt,
      location: shift.location || shift.siteName || '',
    }))
  );

  return {
    summary: {
      onSiteTodayMinutes: summary.onSiteTodayMinutes,
      hoursThisWeek,
      hourlyRate,
      hasHourlyRate,
      earnedThisWeek,
      earnedThisWeekTitle:
        hourlyRate != null
          ? `Earned this week · ${formatMoney(hourlyRate)}/hr`
          : 'Earned this week',
      pendingLeave: summary.pendingLeave ?? 0,
      complianceDue: summary.complianceDue ?? 0,
    },
    quickActionCounts: {
      shiftClaims: quickActions.shiftClaims || 0,
      documents: quickActions.documents || 0,
      myAttendance: quickActions.myAttendance || 0,
    },
    weeklyHours: {
      categories: days.map((day) => day.day),
      series: [
        { name: 'Worked', data: days.map((day) => day.workedHours ?? 0) },
        { name: 'Target', data: days.map((day) => day.targetHours ?? 0) },
      ],
      workedHours: formatHours(weeklyHours.workedHours ?? summary.hoursThisWeek),
      targetHours: formatHours(weeklyHours.targetHours),
      hasData: days.length > 0,
    },
    nextShifts: {
      from: nextShifts.from,
      to: nextShifts.to,
      scheduledHours: nextShifts.scheduledHours,
      calendarShifts,
      hasData: calendarShifts.length > 0,
    },
    communication: communication.map((item, index) => ({
      id: item._id || item.id || `comm-${index}`,
      title: item.title || item.subject || item.name || 'Update',
      description: item.body || item.message || item.description || '',
      postedAt: item.createdAt || item.postedAt || item.sentAt,
      color: NOTIFICATION_COLOR[item.type] || 'info',
    })),
    compliance: {
      percent: compliance.compliantPercent,
      columns: [
        { id: 'name', label: 'Name' },
        { id: 'status', label: 'Status', align: 'center' },
        { id: 'due', label: 'Due', align: 'right' },
      ],
      rows: (compliance.items || []).map((item, index) => ({
        id: item.assignmentId || item._id || `compliance-${index}`,
        name: item.name || '—',
        status: statusLabel(item.status) || '—',
        due: dueCell(item.dueAt),
      })),
    },
    training: {
      percent: training.trainingPercent,
      columns: [
        { id: 'name', label: 'Training' },
        { id: 'status', label: 'Status', align: 'center' },
        { id: 'due', label: 'Due', align: 'right' },
      ],
      rows: (training.items || []).map((item, index) => ({
        id: item.assignmentId || item._id || `training-${index}`,
        name: item.name || '—',
        status: statusLabel(item.status) || '—',
        due: dueCell(item.dueAt),
      })),
    },
    supervisionAppraisal: {
      percent: supervisionAppraisal.supervisionAppraisalPercent,
      columns: [
        { id: 'name', label: 'Item' },
        { id: 'progress', label: 'Progress', align: 'center' },
        { id: 'status', label: 'Status', align: 'center' },
      ],
      rows: (supervisionAppraisal.items || []).map((item, index) => ({
        id: item.assignmentId || item._id || `supervision-${index}`,
        name: item.name || '—',
        progress:
          item.completed != null && item.expected != null
            ? `${item.completed}/${item.expected}`
            : '—',
        status: statusLabel(item.status) || '—',
      })),
    },
    openShifts: openShifts.map((shift, index) => ({
      id: shift._id || shift.id || `open-shift-${index}`,
      type: shift.urgentCover ? 'order5' : TIMELINE_TYPES[index % TIMELINE_TYPES.length],
      title: `${fDate(shift.startsAt, 'ddd DD MMM')} · ${shift.siteName || 'Site'} · ${fTime(shift.startsAt)}–${fTime(shift.endsAt)}${shift.urgentCover ? ' · Urgent' : ''}`,
      time: shift.openedAt || shift.startsAt,
    })),
  };
}

export function formatOnSiteToday(apiMinutes, liveMinutes, isClockedIn) {
  if (isClockedIn) return fDurationFromMinutes(liveMinutes);
  if (apiMinutes == null) return '—';
  return fDurationFromMinutes(apiMinutes);
}

export function scoreLabel(percent, fallbackNoun = 'compliant') {
  if (percent == null || Number.isNaN(Number(percent))) return undefined;
  return `${percent}% ${fallbackNoun}`;
}
