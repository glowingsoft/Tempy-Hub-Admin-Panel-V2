// Mock organization-level dashboard data for the Organization Owner.
// Replace with real queries (e.g. GET /owner/dashboard/stats) when available.

import { PEEP_LEVELS } from 'src/sections/active-sections/peen-floor-plan/mocks/data';

export const ownerDashboardSummary = {
  totalStaff: 148,
  totalResidents: 121,
  totalContractors: 23,
  totalProfessionals: 22,
  onLeaveToday: 9,
  todayVisitors: 25,
  attendanceRate: 92, // %
  openShifts: 6,
  pendingLeaveRequests: 4,
};

export const attendanceTrend = {
  categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  series: [
    { name: 'Present', data: [132, 138, 129, 141, 136, 88, 74] },
    { name: 'Absent', data: [16, 10, 19, 7, 12, 9, 6] },
  ],
};

export const leaveBreakdown = [
  { label: 'Annual leave', value: 18 },
  { label: 'Sick leave', value: 7 },
  { label: 'Unpaid leave', value: 3 },
  { label: 'Other', value: 2 },
];

export const staffByDepartment = {
  categories: ['Care', 'Nursing', 'Kitchen', 'Housekeeping', 'Admin', 'Maintenance'],
  series: [{ name: 'Staff', data: [64, 22, 16, 18, 20, 8] }],
};

export const workforceOverview = {
  categories: ['Attendance', 'Compliance', 'Training', 'Retention', 'Utilization', 'Satisfaction'],
  series: [{ name: 'This month', data: [91, 84, 76, 88, 72, 80] }],
};

// Residents' PEEP (Personal Emergency Evacuation Plan) risk levels, org-wide.
// Reuses the label/colour source of truth from the PEEP & Floor Plan module
// (src/sections/active-sections/peen-floor-plan/mocks/data) so both stay in sync.
const PEEP_RISK_TOTALS = { high: 14, medium: 38, low: 65 };

export const residentEvacuationRisk = [
  ...['high', 'medium', 'low'].map((level) => ({
    level,
    label: `${PEEP_LEVELS[level].label} PEEP`,
    total: PEEP_RISK_TOTALS[level],
    color: PEEP_LEVELS[level].color,
  })),
  { level: 'notSet', label: 'Not set', total: 4, color: 'default' },
];

// Modules the organization is currently entitled to. Greyed-out entries are
// part of the platform catalog but not yet purchased for this organization.
export const activeModulesSnapshot = [
  { slug: 'scheduling', label: 'Scheduling', enabled: true },
  { slug: 'leaveShiftBidding', label: 'Leave & Shift Bidding', enabled: true },
  { slug: 'complianceTraining', label: 'Compliance & Training', enabled: true },
  { slug: 'commsDocuments', label: 'Comms & Documents', enabled: true },
  { slug: 'onboarding', label: 'Onboarding', enabled: false },
  { slug: 'payroll', label: 'Payroll', enabled: false },
];

// Fire drill activity, org-wide, this quarter.
export const fireDrillsSnapshot = {
  completed: 11,
  overdueSites: 1,
};

// ----------------------------------------------------------------------
// Organization-level Compliance, Training, Supervision & Open Shifts
// ----------------------------------------------------------------------

export const ownerCompliance = {
  score: 91,
  list: [
    { id: 'org-comp-1', name: 'Fire Risk Assessment — Oakridge Haven pending' },
    { id: 'org-comp-2', name: 'CQC Fundamental Standards Audit — In progress' },
    { id: 'org-comp-3', name: 'Data Protection Review — Due in 12 days' },
  ],
};

export const ownerTraining = {
  score: 76,
  list: [
    { id: 'org-train-1', name: 'Safeguarding Adults (Level 3) — 8 carers due' },
    { id: 'org-train-2', name: 'Moving & Handling Practical — 14 staff due' },
    { id: 'org-train-3', name: 'Infection Prevention & Control — Refresher open' },
  ],
};

export const ownerSupervision = {
  score: 88,
  list: [
    { id: 'org-sup-1', name: 'Q3 Care Worker 1:1 Supervisions — 12 pending' },
    { id: 'org-sup-2', name: 'Annual Nurse Appraisals — 4 due this month' },
    { id: 'org-sup-3', name: 'Senior Carer Reviews — 2 awaiting sign-off' },
  ],
};

const ownerNow = new Date();
const ownerAddHours = (d, h) => new Date(d.getTime() + h * 60 * 60 * 1000);

export const ownerOpenShifts = [
  {
    id: 'org-shift-1',
    type: 'order5',
    title: 'Fri 25 Sep · Sunset Care Home · 08:00–16:00 · Urgent Cover',
    time: ownerAddHours(ownerNow, 18),
  },
  {
    id: 'org-shift-2',
    type: 'order2',
    title: 'Sat 26 Sep · Oakridge Haven · 14:00–22:00 · Senior Carer',
    time: ownerAddHours(ownerNow, 42),
  },
  {
    id: 'org-shift-3',
    type: 'order1',
    title: 'Sun 27 Sep · Meadow View Site · 08:00–20:00 · Long Day',
    time: ownerAddHours(ownerNow, 66),
  },
];


