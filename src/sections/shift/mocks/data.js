// Mock shifts data — shape mirrors:
//   GET  /admin/organizations/:organizationId/shifts
//   GET  /admin/shifts/:shiftId
// Replace the reads in the views with the RTK Query hooks (see
// src/store/Reducer/shifts-api.js) once the endpoints are available.
//
// A shift belongs to an organization and a branch, and may be assigned to a
// staff member or left open / unassigned. Kept separate from Shift Claims.

import { mockBranches } from 'src/sections/branch/mocks/data';
import { mockStaffProfiles } from 'src/sections/staff-profile/mocks/data';
import { mockOrganizations } from 'src/sections/organization/mocks/data';

// ----------------------------------------------------------------------

export const SHIFT_STATUS_OPTIONS = [
  { value: 'open', label: 'Open', color: 'warning' },
  { value: 'scheduled', label: 'Scheduled', color: 'success' },
  { value: 'cancelled', label: 'Cancelled', color: 'error' },
  { value: 'completed', label: 'Completed', color: 'info' },
];

export const getShiftStatusMeta = (value) =>
  SHIFT_STATUS_OPTIONS.find((option) => option.value === value) || {
    value,
    label: value || '—',
    color: 'default',
  };

// Visibility enum (`visibility: "branch"` in the API sample).
// Placeholder — align with the backend when known.
export const SHIFT_VISIBILITY_OPTIONS = [
  { value: 'branch', label: 'Site' },
  { value: 'organization', label: 'Organization' },
];

export const getShiftVisibilityLabel = (value) =>
  SHIFT_VISIBILITY_OPTIONS.find((option) => option.value === value)?.label || value || '—';

// ----------------------------------------------------------------------

const orgRef = (id) => {
  const org = mockOrganizations.find((o) => o._id === id);
  return org ? { _id: org._id, name: org.name } : null;
};

const branchRef = (id) => {
  if (!id) return null;
  const branch = mockBranches.find((b) => b._id === id);
  return branch
    ? { _id: branch._id, name: branch.name, code: branch.code, status: branch.status }
    : null;
};

const staffRef = (id) => {
  if (!id) return null;
  const profile = mockStaffProfiles.find((p) => p._id === id);
  return profile
    ? { _id: profile._id, name: profile.user?.name || null, user: profile.user || null }
    : null;
};

const ORG_A = mockOrganizations[0]?._id;
const ORG_B = mockOrganizations[1]?._id;

const daysFromNow = (days, hour = 9) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

export const mockShiftsResponse = {
  message: 'Data fetched successfully',
  data: [
    {
      _id: '6ad1e1000000000000000001',
      organizationId: ORG_A,
      branchId: '6a98c1000000000000000001',
      staffId: null,
      startsAt: daysFromNow(1, 9),
      endsAt: daysFromNow(1, 17),
      status: 'open',
      visibility: 'branch',
      urgentCover: false,
      openedAt: daysFromNow(-1, 12),
      filledAt: null,
      filledByClaimId: null,
      createdAt: daysFromNow(-1, 12),
      updatedAt: daysFromNow(-1, 12),
      branch: branchRef('6a98c1000000000000000001'),
      staff: null,
    },
    {
      _id: '6ad1e1000000000000000002',
      organizationId: ORG_A,
      branchId: '6a98c1000000000000000001',
      staffId: '6ac1d1000000000000000001',
      startsAt: daysFromNow(2, 8),
      endsAt: daysFromNow(2, 16),
      status: 'filled',
      visibility: 'branch',
      urgentCover: false,
      openedAt: daysFromNow(-3, 10),
      filledAt: daysFromNow(-2, 9),
      filledByClaimId: '6ae1f1000000000000000001',
      createdAt: daysFromNow(-3, 10),
      updatedAt: daysFromNow(-2, 9),
      branch: branchRef('6a98c1000000000000000001'),
      staff: staffRef('6ac1d1000000000000000001'),
    },
    {
      _id: '6ad1e1000000000000000003',
      organizationId: ORG_A,
      branchId: '6a98c1000000000000000002',
      staffId: null,
      startsAt: daysFromNow(0, 20),
      endsAt: daysFromNow(1, 4),
      status: 'open',
      visibility: 'organization',
      urgentCover: true,
      openedAt: daysFromNow(0, 8),
      filledAt: null,
      filledByClaimId: null,
      createdAt: daysFromNow(0, 8),
      updatedAt: daysFromNow(0, 8),
      branch: branchRef('6a98c1000000000000000002'),
      staff: null,
    },
    {
      _id: '6ad1e1000000000000000004',
      organizationId: ORG_B,
      branchId: '6a98c1000000000000000003',
      staffId: '6ac1d1000000000000000004',
      startsAt: daysFromNow(-2, 9),
      endsAt: daysFromNow(-2, 17),
      status: 'cancelled',
      visibility: 'branch',
      urgentCover: false,
      openedAt: daysFromNow(-6, 11),
      filledAt: null,
      filledByClaimId: null,
      createdAt: daysFromNow(-6, 11),
      updatedAt: daysFromNow(-4, 14),
      branch: branchRef('6a98c1000000000000000003'),
      staff: staffRef('6ac1d1000000000000000004'),
    },
  ],
  meta: { currentPage: 1, totalPages: 1, totalRecords: 4, limit: 10 },
};

export const mockShifts = mockShiftsResponse.data;

export const getMockShiftById = (id) => mockShifts.find((shift) => shift._id === id) ?? null;

// ----------------------------------------------------------------------
// Prototype helpers — no backend yet, so mutate the in-memory list so the
// list / detail screens reflect changes.
// ----------------------------------------------------------------------

export function createMockShift({ organizationId, branchId, staffId, startsAt, endsAt } = {}) {
  const now = new Date().toISOString();
  const rand = Math.random().toString(36).slice(2, 10);
  const id = `mock-shift-${rand}`;

  const shift = {
    _id: id,
    organizationId,
    branchId: branchId || null,
    staffId: staffId || null,
    startsAt: startsAt || null,
    endsAt: endsAt || null,
    status: staffId ? 'filled' : 'open',
    visibility: 'branch',
    urgentCover: false,
    openedAt: now,
    filledAt: staffId ? now : null,
    filledByClaimId: null,
    createdAt: now,
    updatedAt: now,
    branch: branchRef(branchId),
    staff: staffRef(staffId),
  };

  mockShifts.unshift(shift);
  mockShiftsResponse.meta.totalRecords = mockShifts.length;

  return shift;
}

export function updateMockShift(id, patch = {}) {
  const shift = mockShifts.find((s) => s._id === id);
  if (!shift) return null;

  if (patch.startsAt !== undefined) shift.startsAt = patch.startsAt;
  if (patch.endsAt !== undefined) shift.endsAt = patch.endsAt;

  if (patch.branchId !== undefined) {
    shift.branchId = patch.branchId || null;
    shift.branch = branchRef(patch.branchId);
  }
  if (patch.staffId !== undefined) {
    shift.staffId = patch.staffId || null;
    shift.staff = staffRef(patch.staffId);
    if (patch.staffId && shift.status === 'open') {
      shift.status = 'filled';
      shift.filledAt = new Date().toISOString();
    }
    if (!patch.staffId && shift.status === 'filled') {
      shift.status = 'open';
      shift.filledAt = null;
    }
  }

  shift.updatedAt = new Date().toISOString();
  return shift;
}
