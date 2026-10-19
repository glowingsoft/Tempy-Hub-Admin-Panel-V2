// Mock leave requests data — shape mirrors:
//   GET  /admin/organizations/:organizationId/leave-requests
//   PUT  /admin/organizations/:organizationId/leave-entitlements
//   POST /admin/leave-approvals/:leaveRequestId/approve
//   POST /admin/leave-approvals/:leaveRequestId/reject
// SINGLE SOURCE OF TRUTH for both the Owner Dashboard and the Line Manager
// "Leave Approval" screens — both render <LeaveRequestListView />, so the tables
// are always aligned. Swap the reads for the RTK Query hooks (see
// src/store/Reducer/leave-requests-api.js) once the endpoints are available.

import { mockOrganizations } from 'src/sections/organization/mocks/data';

// ----------------------------------------------------------------------

export const LEAVE_REQUEST_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'approved', label: 'Approved', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'error' },
  { value: 'cancelled', label: 'Cancelled', color: 'default' },
  { value: 'closed', label: 'Closed', color: 'info' },
];

export const getLeaveRequestStatusMeta = (value) =>
  LEAVE_REQUEST_STATUS_OPTIONS.find((option) => option.value === value) || {
    value,
    label: value || '—',
    color: 'default',
  };

// TODO: confirm the real leave-type enum (sample only showed "annual").
export const LEAVE_TYPE_OPTIONS = [
  { value: 'annual', label: 'Annual Leave (Holiday)' },
  { value: 'sick', label: 'Sickness' },
  { value: 'timeoff', label: 'Time Off (Absent)' },
];

export const getLeaveTypeLabel = (value) => {
  if (value === 'unpaid' || value === 'absent') return 'Time Off (Absent)';
  return LEAVE_TYPE_OPTIONS.find((option) => option.value === value)?.label || value || '—';
};

// Entitlement year keys ("2026-2027" in the sample).
export const LEAVE_ENTITLEMENT_YEAR_OPTIONS = ['2025-2026', '2026-2027', '2027-2028'].map(
  (value) => ({ value, label: value })
);

// ----------------------------------------------------------------------

// Scope the mock rows to the owner's organization so the Owner Dashboard filters
// them in; the Line Manager surface has no org id on the user, so it sees all.
const ORG_A = mockOrganizations[0]?._id;

const SMOKE_BRANCH = { _id: '6a966660a84bca033b0d34d6', name: 'Smoke Site', code: 'BR-RGDYKV', status: 'active' };

const stamp = (days, hour = 10) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

const dayAt = (days) => stamp(days, 0);

export const mockLeaveRequestsResponse = {
  message: 'Data fetched successfully',
  data: [
    {
      _id: '6a995a14fc813b0b9e92da56',
      organizationId: ORG_A,
      staffId: '6a966660a84bca033b0d34fc',
      branchId: '6a966660a84bca033b0d34d6',
      leaveType: 'annual',
      startDate: '2026-09-10T00:00:00.000Z',
      endDate: '2026-09-12T00:00:00.000Z',
      totalDays: 1,
      reason: 'Holiday',
      attachmentUrl: '',
      status: 'approved',
      decidedBy: '6a9576de4f38edb8df16408d',
      decidedAt: '2026-09-03T11:37:07.138Z',
      decisionNote: '',
      source: 'staffRequest',
      recordedByUserId: null,
      createdBy: '6a9576de4f38edb8df16408d',
      createdAt: '2026-09-03T11:29:24.945Z',
      updatedAt: '2026-09-03T11:37:07.139Z',
      __v: 0,
      staff: { _id: '6a966660a84bca033b0d34fc', employeeCode: 'EMP-85S6', name: 'Demo Owner', email: 'owner@tempyhub.com' },
      branch: SMOKE_BRANCH,
    },
    {
      _id: '6a9963b9841eecaf60913377',
      organizationId: ORG_A,
      staffId: '6a9963b8841eecaf60913331',
      branchId: '6a966660a84bca033b0d34d6',
      leaveType: 'annual',
      startDate: '2026-09-04T00:00:00.000Z',
      endDate: '2026-09-04T00:00:00.000Z',
      totalDays: 1,
      reason: 'Seeded demo leave request',
      attachmentUrl: '',
      status: 'pending',
      decidedBy: null,
      decidedAt: null,
      decisionNote: '',
      source: 'staffRequest',
      recordedByUserId: null,
      createdBy: '6a9963b8841eecaf6091332a',
      createdAt: '2026-09-03T12:10:33.560Z',
      updatedAt: '2026-09-03T12:10:33.560Z',
      __v: 0,
      staff: { _id: '6a9963b8841eecaf60913331', employeeCode: 'EMP-SEED1', name: 'Amina Carer', email: 'carer1.smoke@tempyhub.com' },
      branch: SMOKE_BRANCH,
    },
    {
      _id: '6a9963b9841eecaf60913378',
      organizationId: ORG_A,
      staffId: '6a9963b8841eecaf60913332',
      branchId: '6a966660a84bca033b0d34d6',
      leaveType: 'sick',
      startDate: dayAt(-2),
      endDate: dayAt(-1),
      totalDays: 2,
      reason: 'Flu — GP note attached',
      attachmentUrl: '',
      status: 'pending',
      decidedBy: null,
      decidedAt: null,
      decisionNote: '',
      source: 'staffRequest',
      recordedByUserId: null,
      createdBy: '6a9963b8841eecaf6091332a',
      createdAt: stamp(-3),
      updatedAt: stamp(-3),
      __v: 0,
      staff: { _id: '6a9963b8841eecaf60913332', employeeCode: 'EMP-SEED2', name: 'Ben Carer', email: 'carer2.smoke@tempyhub.com' },
      branch: SMOKE_BRANCH,
    },
    {
      _id: '6a9963b9841eecaf60913379',
      organizationId: ORG_A,
      staffId: '6a9963b8841eecaf60913333',
      branchId: '6a966660a84bca033b0d34d6',
      leaveType: 'unpaid',
      startDate: dayAt(-30),
      endDate: dayAt(-28),
      totalDays: 3,
      reason: 'Personal matter',
      attachmentUrl: '',
      status: 'rejected',
      decidedBy: '6a9576de4f38edb8df16408d',
      decidedAt: stamp(-33),
      decisionNote: 'Insufficient notice / no cover available',
      source: 'staffRequest',
      recordedByUserId: null,
      createdBy: '6a9963b8841eecaf6091332a',
      createdAt: stamp(-35),
      updatedAt: stamp(-33),
      __v: 0,
      staff: { _id: '6a9963b8841eecaf60913333', employeeCode: 'EMP-SEED3', name: 'Grace Carer', email: 'carer3.smoke@tempyhub.com' },
      branch: SMOKE_BRANCH,
    },
  ],
  meta: { currentPage: 1, totalPages: 1, totalRecords: 4, limit: 10 },
};

export const mockLeaveRequests = mockLeaveRequestsResponse.data;

export const getMockLeaveRequestById = (id) =>
  mockLeaveRequests.find((request) => request._id === id) ?? null;

// In-memory store of the most recent entitlement set per staff/year/leaveType key.
export const mockLeaveEntitlements = {};

const entitlementKey = ({ staffId, year, leaveType }) => `${staffId}::${year}::${leaveType}`;

// ----------------------------------------------------------------------
// Prototype helpers — no backend yet, so mutate the in-memory data so the
// list / detail screens reflect the change.
// ----------------------------------------------------------------------

const APPROVER_USER_ID = '6a9576de4f38edb8df16408d';

export function approveMockLeaveRequest(id) {
  const request = mockLeaveRequests.find((r) => r._id === id);
  if (!request) return null;

  const now = new Date().toISOString();
  request.status = 'approved';
  request.decidedBy = APPROVER_USER_ID;
  request.decidedAt = now;
  request.decisionNote = '';
  request.updatedAt = now;

  return request;
}

export function rejectMockLeaveRequest(id, decisionNote = '') {
  const request = mockLeaveRequests.find((r) => r._id === id);
  if (!request) return null;

  const now = new Date().toISOString();
  request.status = 'rejected';
  request.decidedBy = APPROVER_USER_ID;
  request.decidedAt = now;
  request.decisionNote = decisionNote || '';
  request.updatedAt = now;

  return request;
}

export function setMockLeaveEntitlement({ staffId, year, leaveType, entitlementDays } = {}) {
  const now = new Date().toISOString();
  const key = entitlementKey({ staffId, year, leaveType });
  const days = Number(entitlementDays) || 0;

  const entitlement = {
    _id: mockLeaveEntitlements[key]?._id || `mock-ent-${Math.random().toString(36).slice(2, 10)}`,
    staffId,
    branchId: SMOKE_BRANCH._id,
    year,
    leaveType,
    entitlementDays: days,
    carriedOverDays: mockLeaveEntitlements[key]?.carriedOverDays || 0,
    takenDays: mockLeaveEntitlements[key]?.takenDays || 0,
    pendingDays: mockLeaveEntitlements[key]?.pendingDays || 0,
    createdAt: mockLeaveEntitlements[key]?.createdAt || now,
    updatedAt: now,
    __v: 0,
    remainingDays: days - (mockLeaveEntitlements[key]?.takenDays || 0),
  };

  mockLeaveEntitlements[key] = entitlement;
  return entitlement;
}
