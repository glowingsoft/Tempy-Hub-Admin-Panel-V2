// Mock shift claims data — shape mirrors:
//   GET  /admin/organizations/:organizationId/shift-claims
//   GET  /admin/shift-claims/:shiftClaimId
// Replace the reads in the views with the RTK Query hooks (see
// src/store/Reducer/shift-claims-api.js) once the endpoints are available.
//
// A shift claim is a record for covering a shift. Kept separate from Shifts.

import { mockBranches } from 'src/sections/branch/mocks/data';
import { mockStaffProfiles } from 'src/sections/staff-profile/mocks/data';
import { mockOrganizations } from 'src/sections/organization/mocks/data';

// ----------------------------------------------------------------------

// TODO: confirm the real shift-claim status enum. The API sample only showed
// "open" and "scheduled" — modelled here as: open = awaiting approval,
// scheduled = approved/confirmed, rejected = declined.
export const SHIFT_CLAIM_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'approved', label: 'Approved', color: 'success' },
  { value: 'rejected', label: 'Rejected', color: 'error' },
  { value: 'withdrawn', label: 'Withdrawn', color: 'default' },
];

export const getShiftClaimStatusMeta = (value) =>
  SHIFT_CLAIM_STATUS_OPTIONS.find((option) => option.value === value) || {
    value,
    label: value || '—',
    color: 'default',
  };

export const SHIFT_CLAIM_VISIBILITY_OPTIONS = [
  { value: 'branch', label: 'Site' },
  { value: 'organization', label: 'Organization' },
];

export const getShiftClaimVisibilityLabel = (value) =>
  SHIFT_CLAIM_VISIBILITY_OPTIONS.find((option) => option.value === value)?.label || value || '—';

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

// Claim staff shape from the API sample: { _id, employeeCode, name, email }
const staffRef = (id, employeeCode) => {
  if (!id) return null;
  const profile = mockStaffProfiles.find((p) => p._id === id);
  if (!profile) return null;
  return {
    _id: profile._id,
    employeeCode: employeeCode || `EMP-${profile._id.slice(-4).toUpperCase()}`,
    name: profile.user?.name || null,
    email: profile.user?.email || null,
  };
};

const ORG_A = mockOrganizations[0]?._id;
const ORG_B = mockOrganizations[1]?._id;

const daysFromNow = (days, hour = 9) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
};

export const mockShiftClaimsResponse = {
  message: 'Data fetched successfully',
  data: [
    {
      _id: '6a96c2e62b10d20977b513b9',
      organizationId: ORG_A,
      branchId: '6a98c1000000000000000001',
      staffId: '6ac1d1000000000000000002',
      startsAt: daysFromNow(2, 9),
      endsAt: daysFromNow(2, 17),
      status: 'open',
      visibility: 'branch',
      urgentCover: false,
      openedAt: daysFromNow(-1, 12),
      filledAt: null,
      filledByClaimId: null,
      createdAt: daysFromNow(-1, 12),
      updatedAt: daysFromNow(-1, 12),
      __v: 0,
      branch: branchRef('6a98c1000000000000000001'),
      staff: staffRef('6ac1d1000000000000000002'),
    },
    {
      _id: '6a993a10fc813b0b9e92d909',
      organizationId: ORG_A,
      branchId: '6a98c1000000000000000002',
      staffId: '6ac1d1000000000000000003',
      startsAt: daysFromNow(6, 9),
      endsAt: daysFromNow(6, 17),
      status: 'open',
      visibility: 'organization',
      urgentCover: true,
      openedAt: daysFromNow(0, 9),
      filledAt: null,
      filledByClaimId: null,
      createdAt: daysFromNow(0, 9),
      updatedAt: daysFromNow(0, 9),
      __v: 0,
      branch: branchRef('6a98c1000000000000000002'),
      staff: staffRef('6ac1d1000000000000000003'),
    },
    {
      _id: '6a993b93fc813b0b9e92d91f',
      organizationId: ORG_A,
      branchId: '6a98c1000000000000000001',
      staffId: '6ac1d1000000000000000001',
      startsAt: daysFromNow(6, 9),
      endsAt: daysFromNow(6, 17),
      status: 'scheduled',
      visibility: 'branch',
      urgentCover: false,
      openedAt: daysFromNow(-2, 9),
      filledAt: daysFromNow(-1, 15),
      filledByClaimId: '6a993b93fc813b0b9e92d91f',
      createdAt: daysFromNow(-2, 9),
      updatedAt: daysFromNow(-1, 15),
      __v: 0,
      branch: branchRef('6a98c1000000000000000001'),
      staff: staffRef('6ac1d1000000000000000001'),
    },
    {
      _id: '6a993cd1fc813b0b9e92d940',
      organizationId: ORG_B,
      branchId: '6a98c1000000000000000003',
      staffId: '6ac1d1000000000000000004',
      startsAt: daysFromNow(-3, 9),
      endsAt: daysFromNow(-3, 17),
      status: 'rejected',
      visibility: 'branch',
      urgentCover: false,
      openedAt: daysFromNow(-8, 9),
      filledAt: null,
      filledByClaimId: null,
      createdAt: daysFromNow(-8, 9),
      updatedAt: daysFromNow(-5, 10),
      __v: 0,
      branch: branchRef('6a98c1000000000000000003'),
      staff: staffRef('6ac1d1000000000000000004'),
    },
  ],
  meta: { currentPage: 1, totalPages: 1, totalRecords: 4, limit: 10 },
};

export const mockShiftClaims = mockShiftClaimsResponse.data;

export const getMockShiftClaimById = (id) =>
  mockShiftClaims.find((claim) => claim._id === id) ?? null;

// ----------------------------------------------------------------------
// Prototype helper — no backend yet, so mutate the in-memory list so the
// list / detail screens reflect the approval.
// ----------------------------------------------------------------------

export function approveMockShiftClaim(id) {
  const claim = mockShiftClaims.find((c) => c._id === id);
  if (!claim) return null;

  const now = new Date().toISOString();
  claim.status = 'scheduled';
  claim.filledAt = now;
  claim.filledByClaimId = claim._id;
  claim.updatedAt = now;

  return claim;
}
