import { PEEP_LEVELS } from 'src/sections/active-sections/peen-floor-plan/mocks/data';
import { fDate, fTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

const WORKFORCE_METRICS = [
  { key: 'attendance', label: 'Attendance' },
  { key: 'compliance', label: 'Compliance' },
  { key: 'training', label: 'Training' },
  { key: 'retention', label: 'Retention' },
  { key: 'utilization', label: 'Utilization' },
  { key: 'satisfaction', label: 'Satisfaction' },
];

const STATUS_LABEL = {
  pending: 'Pending',
  overdue: 'Overdue',
  dueSoon: 'Due soon',
  completed: 'Completed',
  onTrack: 'On track',
  notYetDue: 'Not yet due',
};

function formatPercent(value) {
  return value == null || Number.isNaN(Number(value)) ? '—' : `${value}%`;
}

function statusLabel(status) {
  if (!status) return '';
  return (
    STATUS_LABEL[status] ||
    status.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
  );
}

function titleCase(value = '') {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatPersonName(name) {
  if (!name || name === '—') return name || '—';
  return name.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function hasNumericValue(values) {
  return values.some((value) => value != null && Number.isFinite(Number(value)));
}

function hasPositiveValue(values) {
  return values.some((value) => Number(value) > 0);
}

export function mapOwnerDashboard(data = {}) {
  const summary = data.summary || {};
  const attendance = data.attendance || [];
  const leave = data.leaveBreakdown || [];
  const staffByDepartment = data.staffByDepartment || {};
  const workforce = data.workforceOverview || {};
  const evacuation = data.evacuationRisk || {};
  const modules = data.activeModules || {};
  const fireDrills = data.fireDrills || {};
  const compliance = data.compliance || {};
  const training = data.staffTraining || {};
  const supervision = data.supervisionAppraisal || {};
  const openShifts = data.openShifts || [];

  const departments = staffByDepartment.departments || [];
  const attendanceValues = attendance.flatMap((item) => [item.present, item.absent]);
  const leaveValues = leave.map((item) => item.percent ?? item.value);
  const workforceValues = WORKFORCE_METRICS.map((item) => workforce[item.key]);
  const evacuationValues = ['high', 'medium', 'low', 'notSet'].map((key) => evacuation[key]);
  const complianceItems = compliance.items || [];
  const trainingItems = training.items || [];
  const supervisionItems = supervision.items || [];
  const compliancePercent = compliance.percentage ?? compliance.compliantPercent;
  const trainingPercent = training.percentage ?? training.compliantPercent;
  const supervisionPercent = supervision.percentage ?? supervision.compliantPercent;

  return {
    summary: {
      totalStaff: summary.totalStaff ?? 0,
      totalResidents: summary.totalResidents ?? 0,
      todayVisitors: summary.todayVisitors ?? 0,
      totalContractors: summary.totalContractors ?? 0,
      totalProfessionals: summary.totalProfessionals ?? 0,
    },
    attendance: {
      categories: attendance.map((item) => item.day),
      series: [
        { name: 'Present', data: attendance.map((item) => item.present) },
        { name: 'Absent', data: attendance.map((item) => item.absent) },
      ],
    },
    leaveBreakdown: leave.map((item) => ({
      label: item.label,
      value: item.percent ?? item.value ?? 0,
    })),
    staffByDepartment: {
      total: staffByDepartment.totalStaff ?? summary.totalStaff ?? 0,
      categories: departments.map((item) => item.name),
      series: [{ name: 'Staff', data: departments.map((item) => item.count ?? 0) }],
    },
    workforceOverview: {
      categories: WORKFORCE_METRICS.map((item) => item.label),
      series: [
        {
          name: 'This month',
          data: WORKFORCE_METRICS.map((item) => workforce[item.key] ?? 0),
        },
      ],
    },
    evacuationRisk: [
      ...['high', 'medium', 'low'].map((level) => ({
        level,
        label: `${PEEP_LEVELS[level].label} PEEP`,
        total: evacuation[level] ?? 0,
        color: PEEP_LEVELS[level].color,
      })),
      { level: 'notSet', label: 'Not set', total: evacuation.notSet ?? 0, color: 'default' },
    ],
    activeModules: (modules.modules || []).map((item) => ({
      slug: item.slug,
      label: item.name,
      enabled: Boolean(item.active),
    })),
    fireDrills: {
      completed: fireDrills.completed ?? 0,
      overdueSites: fireDrills.overdueSites ?? 0,
    },
    compliance: {
      scoreLabel: formatPercent(compliancePercent),
      columns: [
        { id: 'name', label: 'Name' },
        { id: 'complete', label: 'Complete', align: 'center' },
        { id: 'due', label: 'Due', align: 'right' },
      ],
      rows: complianceItems.map((item, index) => ({
        id: item.assignmentId || item.id || `compliance-${item.name || index}`,
        name: item.name || '—',
        complete:
          item.complete != null
            ? `${item.complete}%`
            : statusLabel(item.status) || '—',
        due: item.dueAt ? fDate(item.dueAt) : '—',
      })),
    },
    training: {
      scoreLabel: formatPercent(trainingPercent),
      columns: [
        { id: 'staffName', label: 'Staff' },
        { id: 'name', label: 'Training' },
        { id: 'status', label: 'Status', align: 'center' },
      ],
      rows: trainingItems.map((item, index) => ({
        id: item.assignmentId || item.id || `training-${index}`,
        staffName: formatPersonName(item.staffName),
        name: item.name || '—',
        status: statusLabel(item.status) || '—',
      })),
    },
    supervision: {
      scoreLabel: formatPercent(supervisionPercent),
      columns: [
        { id: 'staffName', label: 'Staff' },
        { id: 'type', label: 'Type' },
        { id: 'status', label: 'Status', align: 'center' },
      ],
      rows: supervisionItems.map((item, index) => ({
        id: `${item.type || 'item'}-${item.staffName || index}-${index}`,
        staffName: formatPersonName(item.staffName),
        type: [
          titleCase(item.type || 'supervision'),
          item.completed != null && item.expected != null ? `${item.completed}/${item.expected}` : null,
        ]
          .filter(Boolean)
          .join(' · '),
        status: statusLabel(item.status) || '—',
      })),
    },
    hasAttendance: attendance.length > 0 && hasNumericValue(attendanceValues),
    hasLeave: leave.length > 0 && hasPositiveValue(leaveValues),
    hasStaffByDepartment: departments.length > 0,
    hasWorkforce: hasNumericValue(workforceValues),
    hasEvacuation: hasNumericValue(evacuationValues),
    hasModules: (modules.modules || []).length > 0,
    hasCompliance: complianceItems.length > 0,
    hasTraining: trainingItems.length > 0,
    hasSupervision: supervisionItems.length > 0,
    hasOpenShifts: openShifts.length > 0,
    openShifts: openShifts.map((item, index) => {
      const site = item.siteName || item.branchName || item.site || '';
      const range =
        item.startsAt
          ? `${fDate(item.startsAt, 'ddd DD MMM')} · ${fTime(item.startsAt)}–${fTime(item.endsAt)}`
          : item.timeRange || item.shiftTime || '';
      const role = item.role || item.jobTitle || '';
      const title =
        item.title ||
        [item.urgentCover ? 'Urgent cover' : 'Open shift', site, range, role].filter(Boolean).join(' · ') ||
        `Open shift ${index + 1}`;

      return {
        id: item.id || item._id || item.shiftId || `shift-${index}`,
        type: item.urgentCover ? 'order5' : item.type || 'order1',
        title,
        time: item.openedAt || item.startsAt || item.startAt || item.startTime || item.time || item.date,
      };
    }),
  };
}
