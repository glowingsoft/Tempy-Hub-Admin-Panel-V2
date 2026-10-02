// Mock data for the Staff (Employee) Dashboard.
//
// Single source of truth for the staff-facing dashboard while there is no
// backend. Where a shared mock already exists for a concept (leave requests,
// shift claims) we read from it and filter to the signed-in employee, so the
// staff view stays aligned with the Owner / Line Manager screens. The rest
// (today's shift, live clock state, compliance items, notifications, the
// evacuation drill, the chart series) is held locally here.
//
// TODOs for wiring the real endpoints:
//   - Today's / upcoming shifts    -> GET /admin/staff/me/shifts (assumed)
//   - Clock in/out/break           -> POST /admin/attendance/clock-in|out|break
//   - Weekly hours / attendance    -> GET /admin/staff/me/attendance-summary (assumed)
//   - Compliance snapshot          -> GET /admin/staff/me/compliance (assumed)
//   - Notifications                -> GET /admin/staff/me/notifications (assumed)
//   - Evacuation state             -> GET /admin/branches/:branchId/evacuation/active
//   - Module access                -> GET /admin/organizations/:id/module-access

import { mockOrganizations } from 'src/sections/organization/mocks/data';
import { mockShiftClaimsResponse } from 'src/sections/shift-claim/mocks/data';
import { mockLeaveRequestsResponse } from 'src/sections/leave-request/mocks/data';

// ----------------------------------------------------------------------
// Signed-in employee. Chosen to line up with the shared attendance + leave
// mocks ("Ben Carer" / EMP-SEED2), so their leave rows are real records from
// src/sections/leave-request/mocks/data.js.
// ----------------------------------------------------------------------

export const staffMember = {
  _id: '6a9963b9841eecaf6091333e',
  staffId: '6a9963b9841eecaf6091333e',
  name: 'Ben Carer',
  email: 'carer2.smoke@tempyhub.com',
  employeeCode: 'EMP-SEED2',
  jobTitle: 'Care Assistant',
  // Optional — set on the owner's Staff Profile record for this employee
  // (src/sections/staff-profile/). Drives the "Earned today" / "Earned this
  // week" cards on the dashboard; hidden entirely when not set.
  // TODO: once the dashboard reads a real staffId, source this from the
  // matching GET /admin/staff-profiles/:id response instead of duplicating it.
  hourlyRate: 12.5,
};

// "Select Business Name" options for the attendance bar — the businesses the
// employee can clock in against.
export const staffBusinesses = mockOrganizations
  .slice(0, 2)
  .map((org) => ({ value: org._id, label: org.name }));

// The employee's home site. `settings.allowPhoneCheckIn` drives whether the
// quick clock-in/out button is offered on the dashboard; `settings.enableBreaks`
// drives whether the Break In/Out button is offered at all (client feedback:
// some organizations don't use breaks). When breaks are on and unpaid,
// `breakRules` says how much unpaid break a shift of a given length earns —
// same shape as the Site settings form (src/sections/branch/mocks/data.js).
export const staffSite = {
  _id: '6a966660a84bca033b0d34d6',
  name: 'Smoke Site',
  code: 'BR-RGDYKV',
  timezone: 'Europe/London',
  assemblyPoint: 'Front car park',
  settings: {
    enableBreaks: true,
    lateGraceMinutes: 5,
    allowPhoneCheckIn: true,
    breaksPaid: false,
    breakRules: [
      { minHours: 12, unpaidMinutes: 60 },
      { minHours: 6, unpaidMinutes: 30 },
    ],
  },
};

// ----------------------------------------------------------------------
// Module access for the employee's organization. Mirrors the enabled flags
// from GET /admin/organizations/:id/module-access.
// ----------------------------------------------------------------------

export const staffModuleAccess = {
  signInAttendance: true,
  leave: true,
  shiftBidding: true,
  competencySupervisionAppraisal: true,
  fireDrillEvacuation: true,
};

export const isStaffModuleActive = (slug) => !!staffModuleAccess[slug];

// ----------------------------------------------------------------------
// Owner-configurable staff-dashboard cards. Separate from `staffModuleAccess`
// above (that's the organization's module *entitlement* — a platform/
// subscription concern managed on the Dashboard's Organizations screen).
// This is a display preference the owner sets for their own staff's home
// screen — managed on the Owner Dashboard's "Staff Dashboard Settings" page
// (src/sections/staff-dashboard-settings/).
//
// TODO: PUT /admin/organizations/:organizationId/staff-dashboard-settings
// ----------------------------------------------------------------------

export const STAFF_DASHBOARD_WIDGET_CATALOG = [
  {
    key: 'checkIn',
    label: 'Check In',
    description: "Today's Attendance card with Check In / Break / Check Out.",
  },
  {
    key: 'pendingLeave',
    label: 'Pending Leave',
    description: 'Pending leave requests count card.',
  },
];

export const staffDashboardWidgetSettings = {
  checkIn: true,
  pendingLeave: true,
};

export const isStaffDashboardWidgetVisible = (key) => staffDashboardWidgetSettings[key] !== false;

export function setStaffDashboardWidgetVisibility(key, visible) {
  staffDashboardWidgetSettings[key] = visible;
  return staffDashboardWidgetSettings;
}

// ----------------------------------------------------------------------
// Date helpers
// ----------------------------------------------------------------------

const at = (dayOffset, hour, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

// ----------------------------------------------------------------------
// Today's shift
// ----------------------------------------------------------------------

export const staffTodayShift = {
  _id: 'shift-today-001',
  startsAt: at(0, 8, 0),
  endsAt: at(0, 16, 0),
  location: `${staffSite.name} · Ground floor`,
  role: staffMember.jobTitle,
  breakMinutes: 30,
};

// ----------------------------------------------------------------------
// Live clock state — mutated in place by the helpers below.
//   status: 'notStarted' | 'onSite' | 'onBreak' | 'checkedOut'
// ----------------------------------------------------------------------

export const staffClockState = {
  status: 'notStarted',
  clockInAt: null,
  clockOutAt: null,
  breaks: [], // { startedAt, endedAt }
};

export function clockInMock() {
  if (staffClockState.status !== 'notStarted') return staffClockState;
  staffClockState.status = 'onSite';
  staffClockState.clockInAt = new Date().toISOString();
  staffClockState.clockOutAt = null;
  return staffClockState;
}

export function clockOutMock() {
  if (staffClockState.status === 'notStarted' || staffClockState.status === 'checkedOut') {
    return staffClockState;
  }
  const openBreak = staffClockState.breaks.find((b) => !b.endedAt);
  if (openBreak) openBreak.endedAt = new Date().toISOString();

  staffClockState.status = 'checkedOut';
  staffClockState.clockOutAt = new Date().toISOString();
  return staffClockState;
}

export function startBreakMock() {
  if (staffClockState.status !== 'onSite') return staffClockState;
  staffClockState.status = 'onBreak';
  staffClockState.breaks.push({ startedAt: new Date().toISOString(), endedAt: null });
  return staffClockState;
}

export function endBreakMock() {
  if (staffClockState.status !== 'onBreak') return staffClockState;
  const openBreak = staffClockState.breaks.find((b) => !b.endedAt);
  if (openBreak) openBreak.endedAt = new Date().toISOString();
  staffClockState.status = 'onSite';
  return staffClockState;
}

// ----------------------------------------------------------------------
// Upcoming shifts — next few days at a glance
// ----------------------------------------------------------------------

export const staffUpcomingShifts = [
  { _id: 'shift-up-001', startsAt: at(1, 8, 0), endsAt: at(1, 16, 0), location: 'Ground floor' },
  { _id: 'shift-up-002', startsAt: at(2, 14, 0), endsAt: at(2, 22, 0), location: 'First floor' },
  { _id: 'shift-up-003', startsAt: at(4, 8, 0), endsAt: at(4, 16, 0), location: 'Ground floor' },
  { _id: 'shift-up-004', startsAt: at(5, 20, 0), endsAt: at(6, 8, 0), location: 'Nights' },
];

// ----------------------------------------------------------------------
// Compliance snapshot — items that need action (Due Soon / Overdue).
// Client feedback: split into distinct categories rather than one mixed
// "competency" bucket, so the dashboard can list each separately.
//   type: 'compliance' | 'training' | 'supervision'   urgency: 'overdue' | 'dueSoon'
// ----------------------------------------------------------------------

export const staffComplianceItems = [
  { _id: 'comp-001', type: 'compliance', title: 'Fire Safety', urgency: 'overdue', dueDate: at(-42, 9) },
  { _id: 'comp-002', type: 'supervision', title: '1:1 Supervision', urgency: 'overdue', dueDate: at(-22, 9) },
  { _id: 'comp-003', type: 'training', title: 'Moving & Handling', urgency: 'dueSoon', dueDate: at(9, 9) },
  { _id: 'comp-004', type: 'compliance', title: 'Safeguarding Adults', urgency: 'dueSoon', dueDate: at(13, 9) },
];

// Client feedback: Compliance and Training should each show a compliance
// score (% up to date), not just the items needing action. `staffComplianceItems`
// above only ever holds items that need attention, so it has no denominator
// on its own — this is the total number of required items per category.
// TODO: source from GET /admin/staff/me/compliance (assumed) once available —
// it should return every required item with a status, not just the ones due.
export const staffComplianceTotals = {
  compliance: 6,
  training: 5,
};

// ----------------------------------------------------------------------
// Leave — read the shared leave-request mock, filtered to this employee so the
// status matches the manager-side screens.
// ----------------------------------------------------------------------

const myLeaveRequests = mockLeaveRequestsResponse.data.filter(
  (request) => request.staff?.email === staffMember.email
);

export const staffLeaveRequests = myLeaveRequests.length
  ? myLeaveRequests.map((request) => ({ ...request, staffId: staffMember._id }))
  : [
    {
      _id: 'staff-leave-001',
      staffId: staffMember._id,
      leaveType: 'annual',
      startDate: '2026-09-10T00:00:00.000Z',
      endDate: '2026-09-12T00:00:00.000Z',
      totalDays: 3,
      reason: 'Holiday',
      status: 'pending',
      branch: { _id: staffSite._id, name: staffSite.name },
      createdAt: '2026-09-03T11:29:24.945Z',
    },
    {
      _id: 'staff-leave-002',
      staffId: staffMember._id,
      leaveType: 'sick',
      startDate: '2026-09-02T00:00:00.000Z',
      endDate: '2026-09-02T00:00:00.000Z',
      totalDays: 1,
      reason: 'Medical appointment',
      status: 'approved',
      branch: { _id: staffSite._id, name: staffSite.name },
      createdAt: '2026-08-28T09:00:00.000Z',
    },
    {
      _id: 'staff-leave-003',
      staffId: staffMember._id,
      leaveType: 'annual',
      startDate: '2026-07-20T00:00:00.000Z',
      endDate: '2026-07-22T00:00:00.000Z',
      totalDays: 3,
      reason: 'Family trip',
      status: 'approved',
      branch: { _id: staffSite._id, name: staffSite.name },
      createdAt: '2026-07-01T09:00:00.000Z',
    },
  ];

// ----------------------------------------------------------------------
// Open shifts to claim — read from the shared shift-claim mock (status "open").
// Gated by the `shiftBidding` module in the view.
// ----------------------------------------------------------------------

export const staffOpenShifts = mockShiftClaimsResponse.data
  .filter((claim) => claim.status === 'open')
  .map((claim) => ({
    _id: claim._id,
    startsAt: claim.startsAt,
    endsAt: claim.endsAt,
    siteName: claim.branch?.name || staffSite.name,
    urgentCover: claim.urgentCover,
  }));

// ----------------------------------------------------------------------
// Notifications — recent announcements, approvals, reminders.
//   type: 'announcement' | 'approval' | 'reminder'
// ----------------------------------------------------------------------

export const staffNotifications = [
  {
    _id: 'ntf-001',
    type: 'approval',
    title: 'Leave request approved',
    body: 'Your annual leave for next month was approved by your line manager.',
    createdAt: at(0, 7, 45),
  },
  {
    _id: 'ntf-002',
    type: 'announcement',
    title: 'Updated medication policy',
    body: 'A new version of the medication policy is ready to read and sign.',
    createdAt: at(-1, 16, 10),
  },
  {
    _id: 'ntf-003',
    type: 'reminder',
    title: 'Fire Safety training overdue',
    body: 'Please complete your Fire Safety refresher as soon as possible.',
    createdAt: at(-2, 9, 0),
  },
  {
    _id: 'ntf-004',
    type: 'announcement',
    title: 'Team meeting Friday 3pm',
    body: 'Monthly team meeting in the staff room. Agenda shared by email.',
    createdAt: at(-3, 12, 30),
  },
  {
    _id: 'ntf-005',
    type: 'reminder',
    title: 'Confirm your shift for Saturday',
    body: 'Tap to acknowledge your night shift starting 20:00.',
    createdAt: at(-4, 8, 15),
  },
];

// ----------------------------------------------------------------------
// Chart series
// ----------------------------------------------------------------------

// My weekly hours — worked vs target (AnalyticsWebsiteVisits).
export const staffWeeklyHours = {
  categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  series: [
    { name: 'Worked', data: [8, 7.5, 8, 6, 8, 0, 0] },
    { name: 'Target', data: [8, 8, 8, 8, 8, 0, 0] },
  ],
};

export const staffHoursThisWeek = staffWeeklyHours.series[0].data.reduce((sum, n) => sum + n, 0);

// ----------------------------------------------------------------------
// Headline counts (CourseWidgetSummary)
// ----------------------------------------------------------------------

export const staffCounts = {
  hoursThisWeek: staffHoursThisWeek,
  upcomingShifts: staffUpcomingShifts.length,
  pendingLeave: staffLeaveRequests.filter((request) => request.status === 'pending').length,
  complianceDue: staffComplianceItems.length,
};

// ----------------------------------------------------------------------
// Evacuation — only surfaced when a drill / emergency is live. Off by default;
// the dashboard view can force it on with ?evac=1 for a demo.
//   mode: 'drill' | 'emergency'
// ----------------------------------------------------------------------

export const staffEvacuation = {
  active: false,
  mode: 'drill',
  siteName: staffSite.name,
  assemblyPoint: staffSite.assemblyPoint,
  startedAt: at(0, 10, 15),
  instruction:
    'Leave the building by the nearest safe exit and go to the assembly point. Do not use the lifts.',
};
