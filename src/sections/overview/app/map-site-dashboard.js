import { fDate, fTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

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

function toSnakeStatus(status = '') {
  return String(status)
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[\s-]+/g, '_')
    .toLowerCase();
}

function activityColor(type = '') {
  if (type.includes('out') || type.includes('check_out') || type.includes('denied')) return 'error';
  if (type.includes('in') || type.includes('approved')) return 'success';
  return 'grey';
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

function formatMinutes(value) {
  if (value == null || Number.isNaN(Number(value))) return '—';
  const total = Math.max(0, Math.round(Number(value)));
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function mapSiteDashboard(data = {}) {
  const summary = data.summary || {};
  const peopleOnSite = data.peopleOnSite || {};
  const people = peopleOnSite.people || [];
  const activityFeed = data.activityFeed || [];
  const activity = data.visitorAndContractorActivity || {};
  const compliance = data.compliance || {};
  const training = data.staffTraining || {};
  const supervision = data.supervisionAppraisal || {};
  const openShifts = data.openShifts || [];

  const compliancePercent = compliance.percentage ?? compliance.compliantPercent;
  const trainingPercent = training.percentage ?? training.compliantPercent;
  const supervisionPercent = supervision.percentage ?? supervision.compliantPercent;

  return {
    summary: {
      visitorsOnSite: summary.visitorsOnSite ?? 0,
      staffOnSite: summary.staffOnSite ?? 0,
      residentsPresent: summary.residentsPresent ?? 0,
      pendingApprovals: summary.pendingApprovals ?? 0,
      contractorsOnSite: summary.contractorsOnSite ?? 0,
      professionalsOnSite: summary.professionalsOnSite ?? 0,
      residentsOutOfHome: summary.residentsOutOfHome == null ? '—' : summary.residentsOutOfHome,
    },
    peopleTotal: peopleOnSite.total ?? people.length,
    people: people.map((item, index) => ({
      _id: item._id || item.id || `${item.email || 'person'}-${item.checkInAt || index}`,
      name: item.name,
      email: item.email,
      image: item.photoUrl || item.image,
      type: (item.type || '').toLowerCase(),
      status: toSnakeStatus(item.status || 'on_site'),
      checkedInAt: item.checkInAt || item.checkedInAt,
    })),
    activityFeed: activityFeed.map((item, index) => ({
      id: `${item._id || item.id || 'activity'}-${item.occurredAt || index}-${item.type || index}`,
      title: item.title,
      description: item.subtitle || '',
      postedAt: item.occurredAt,
      color: activityColor(item.type),
    })),
    visitorActivity: {
      visitorVisits: activity.visitorVisits ?? 0,
      contractorVisits: activity.contractorProfessionalVisits ?? 0,
      avgDuration: formatMinutes(activity.averageVisitMinutes),
      topReasons: (activity.topReasons || []).map((item) => ({
        label: item.reason || item.label,
        count: item.count ?? 0,
      })),
    },
    compliance: {
      scoreLabel: formatPercent(compliancePercent),
      columns: [
        { id: 'name', label: 'Name' },
        { id: 'complete', label: 'Complete', align: 'center' },
        { id: 'due', label: 'Due', align: 'right' },
      ],
      rows: (compliance.items || []).map((item, index) => ({
        id: `compliance-${item.name || index}`,
        name: item.name || '—',
        complete: item.complete == null ? '—' : `${item.complete}%`,
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
      rows: (training.items || []).map((item, index) => ({
        id: item.assignmentId || `training-${index}`,
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
      rows: (supervision.items || []).map((item, index) => ({
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
    openShifts: openShifts.map((item, index) => ({
      id: item.id || item._id || `shift-${index}`,
      type: item.urgentCover ? 'order5' : 'order1',
      title: [
        item.urgentCover ? 'Urgent cover' : 'Open shift',
        item.startsAt ? `${fDate(item.startsAt, 'ddd DD MMM')} · ${fTime(item.startsAt)}–${fTime(item.endsAt)}` : null,
      ]
        .filter(Boolean)
        .join(' · '),
      time: item.openedAt || item.startsAt,
    })),
    hasPeople: people.length > 0,
    hasActivity: activityFeed.length > 0,
    hasVisitorActivity: Boolean(
      activity.visitorVisits ||
        activity.contractorProfessionalVisits ||
        activity.averageVisitMinutes ||
        (activity.topReasons || []).length
    ),
    hasCompliance: (compliance.items || []).length > 0,
    hasTraining: (training.items || []).length > 0,
    hasSupervision: (supervision.items || []).length > 0,
    hasOpenShifts: openShifts.length > 0,
  };
}
