// Mock invitations / memberships data — shape mirrors:
//   GET  /admin/organizations/:organizationId/invitations
//   GET  /admin/invitations/:invitationId
// Replace the reads in the views with the RTK Query hooks (see
// src/store/Reducer/invitations-api.js) once the endpoints are available.

import { mockBranches } from 'src/sections/branch/mocks/data';
import { mockJobTitles } from 'src/sections/job-title/mocks/data';
import { mockDepartments } from 'src/sections/department/mocks/data';
import { mockOrganizations } from 'src/sections/organization/mocks/data';

// ----------------------------------------------------------------------

export const MEMBERSHIP_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending', color: 'warning' },
  { value: 'accepted', label: 'Accepted', color: 'success' },
  { value: 'revoked', label: 'Revoked', color: 'error' },
  { value: 'expired', label: 'Expired', color: 'default' },
];

export const getMembershipStatusMeta = (value) =>
  MEMBERSHIP_STATUS_OPTIONS.find((option) => option.value === value) || {
    value,
    label: value || '—',
    color: 'default',
  };

// Fixed role enum for an invitation (`role: "staff"` in the API sample).
// Placeholder — align with the backend when known.
export const MEMBERSHIP_ROLE_OPTIONS = [
  { value: 'siteManager', label: 'Site Manager' },
  { value: 'lineManager', label: 'Line Manager' },
  { value: 'staff', label: 'Staff' },
];

export const getRoleLabel = (value) =>
  MEMBERSHIP_ROLE_OPTIONS.find((option) => option.value === value)?.label || value || '—';

// Available permissions (`permissions: ["leave.approve"]` in the API sample).
// Placeholder set — replace with the org's real permission catalog.
export const MEMBERSHIP_PERMISSION_OPTIONS = [
  { value: 'leave.approve', label: 'Approve leave' },
  { value: 'leave.view', label: 'View leave' },
  { value: 'rota.manage', label: 'Manage rota' },
  { value: 'rota.view', label: 'View rota' },
  { value: 'attendance.manage', label: 'Manage attendance' },
  { value: 'documents.manage', label: 'Manage documents' },
  { value: 'reports.view', label: 'View reports' },
];

export const getPermissionLabels = (values = []) =>
  values.map(
    (value) =>
      MEMBERSHIP_PERMISSION_OPTIONS.find((option) => option.value === value)?.label || value
  );

// ----------------------------------------------------------------------

const orgRef = (id) => {
  const org = mockOrganizations.find((o) => o._id === id);
  return org ? { _id: org._id, name: org.name } : null;
};

const branchRef = (id) => {
  if (!id) return null;
  const branch = mockBranches.find((b) => b._id === id);
  return branch ? { _id: branch._id, name: branch.name } : null;
};

const jobTitleRef = (id) => {
  if (!id) return null;
  const jobTitle = mockJobTitles.find((jt) => jt._id === id);
  return jobTitle ? { _id: jobTitle._id, name: jobTitle.name } : null;
};

const departmentRefs = (ids = []) =>
  ids
    .map((id) => {
      const department = mockDepartments.find((d) => d._id === id);
      return department ? { _id: department._id, name: department.name } : null;
    })
    .filter(Boolean);

const ORG_A = mockOrganizations[0]?._id;
const ORG_B = mockOrganizations[1]?._id;

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export const mockInvitationsResponse = {
  message: 'Data fetched successfully',
  data: [
    {
      _id: '6a99d1000000000000000001',
      organizationId: ORG_A,
      email: 'grace.owusu@example.com',
      name: 'Grace Owusu',
      role: 'staff',
      branchId: '6a98c1000000000000000001',
      branch: branchRef('6a98c1000000000000000001'),
      permissions: ['leave.view', 'rota.view'],
      jobTitleId: '6a97b5bd0000000000000003',
      jobTitle: jobTitleRef('6a97b5bd0000000000000003'),
      departmentIds: ['6aa1b1000000000000000002'],
      departments: departmentRefs(['6aa1b1000000000000000002']),
      startDate: daysFromNow(30),
      status: 'pending',
      expiresAt: daysFromNow(7),
      lastSentAt: daysFromNow(-1),
      sendCount: 1,
      acceptedAt: null,
      revokedAt: null,
      acceptUrl: 'https://app.tempyhub.example/invite/6a99d1000000000000000001',
      createdAt: daysFromNow(-1),
      updatedAt: daysFromNow(-1),
      __v: 0,
      organization: orgRef(ORG_A),
    },
    {
      _id: '6a99d1000000000000000002',
      organizationId: ORG_A,
      email: 'daniel.mensah@example.com',
      name: 'Daniel Mensah',
      role: 'lineManager',
      branchId: '6a98c1000000000000000001',
      branch: branchRef('6a98c1000000000000000001'),
      permissions: ['leave.approve', 'rota.manage', 'attendance.manage'],
      jobTitleId: '6a97b5bd0000000000000002',
      jobTitle: jobTitleRef('6a97b5bd0000000000000002'),
      departmentIds: ['6aa1b1000000000000000002', '6aa1b1000000000000000001'],
      departments: departmentRefs(['6aa1b1000000000000000002', '6aa1b1000000000000000001']),
      startDate: daysFromNow(-20),
      status: 'accepted',
      expiresAt: daysFromNow(-3),
      lastSentAt: daysFromNow(-10),
      sendCount: 2,
      acceptedAt: daysFromNow(-8),
      revokedAt: null,
      acceptUrl: 'https://app.tempyhub.example/invite/6a99d1000000000000000002',
      createdAt: daysFromNow(-10),
      updatedAt: daysFromNow(-8),
      __v: 0,
      organization: orgRef(ORG_A),
    },
    {
      _id: '6a99d1000000000000000003',
      organizationId: ORG_A,
      email: 'sophie.clark@example.com',
      name: 'Sophie Clark',
      role: 'staff',
      branchId: '6a98c1000000000000000002',
      branch: branchRef('6a98c1000000000000000002'),
      permissions: [],
      jobTitleId: '6a97b5bd0000000000000001',
      jobTitle: jobTitleRef('6a97b5bd0000000000000001'),
      departmentIds: [],
      departments: [],
      startDate: daysFromNow(-40),
      status: 'revoked',
      expiresAt: daysFromNow(-25),
      lastSentAt: daysFromNow(-30),
      sendCount: 1,
      acceptedAt: null,
      revokedAt: daysFromNow(-26),
      acceptUrl: null,
      createdAt: daysFromNow(-30),
      updatedAt: daysFromNow(-26),
      __v: 0,
      organization: orgRef(ORG_A),
    },
    {
      _id: '6a99d1000000000000000004',
      organizationId: ORG_B,
      email: 'omar.haddad@example.com',
      name: 'Omar Haddad',
      role: 'siteManager',
      branchId: '6a98c1000000000000000003',
      branch: branchRef('6a98c1000000000000000003'),
      permissions: ['reports.view'],
      jobTitleId: '6a97b5bd0000000000000004',
      jobTitle: jobTitleRef('6a97b5bd0000000000000004'),
      departmentIds: ['6aa1b1000000000000000005'],
      departments: departmentRefs(['6aa1b1000000000000000005']),
      startDate: daysFromNow(14),
      status: 'pending',
      expiresAt: daysFromNow(5),
      lastSentAt: daysFromNow(-2),
      sendCount: 1,
      acceptedAt: null,
      revokedAt: null,
      acceptUrl: 'https://app.tempyhub.example/invite/6a99d1000000000000000004',
      createdAt: daysFromNow(-2),
      updatedAt: daysFromNow(-2),
      __v: 0,
      organization: orgRef(ORG_B),
    },
  ],
  meta: { currentPage: 1, totalPages: 1, totalRecords: 4, limit: 10 },
};

export const mockInvitations = mockInvitationsResponse.data;

export const getMockInvitationById = (id) =>
  mockInvitations.find((invitation) => invitation._id === id) ?? null;

// ----------------------------------------------------------------------
// Prototype helpers — no backend yet, so mutate the in-memory list so the
// list / detail screens reflect changes.
// ----------------------------------------------------------------------

export function createMockInvitation({
  organizationId,
  email,
  name,
  role,
  branchId,
  permissions = [],
  jobTitleId,
  departmentIds = [],
  startDate,
} = {}) {
  const now = new Date().toISOString();
  const rand = Math.random().toString(36).slice(2, 10);
  const id = `mock-inv-${rand}`;

  const invitation = {
    _id: id,
    organizationId,
    email,
    name,
    role,
    branchId: branchId || null,
    branch: branchRef(branchId),
    permissions,
    jobTitleId: jobTitleId || null,
    jobTitle: jobTitleRef(jobTitleId),
    departmentIds,
    departments: departmentRefs(departmentIds),
    startDate: startDate || null,
    status: 'pending',
    expiresAt: daysFromNow(7),
    lastSentAt: now,
    sendCount: 1,
    acceptedAt: null,
    revokedAt: null,
    acceptUrl: `https://app.tempyhub.example/invite/${id}`,
    createdAt: now,
    updatedAt: now,
    __v: 0,
    organization: orgRef(organizationId),
  };

  mockInvitations.unshift(invitation);
  mockInvitationsResponse.meta.totalRecords = mockInvitations.length;

  return invitation;
}

export function updateMockInvitation(id, patch = {}) {
  const invitation = mockInvitations.find((inv) => inv._id === id);
  if (!invitation) return null;

  ['email', 'name', 'role', 'permissions', 'startDate'].forEach((key) => {
    if (patch[key] !== undefined) invitation[key] = patch[key];
  });

  if (patch.branchId !== undefined) {
    invitation.branchId = patch.branchId || null;
    invitation.branch = branchRef(patch.branchId);
  }
  if (patch.jobTitleId !== undefined) {
    invitation.jobTitleId = patch.jobTitleId || null;
    invitation.jobTitle = jobTitleRef(patch.jobTitleId);
  }
  if (patch.departmentIds !== undefined) {
    invitation.departmentIds = patch.departmentIds;
    invitation.departments = departmentRefs(patch.departmentIds);
  }

  invitation.updatedAt = new Date().toISOString();
  return invitation;
}

export function resendMockInvitation(id) {
  const invitation = mockInvitations.find((inv) => inv._id === id);
  if (!invitation) return null;

  const now = new Date().toISOString();
  invitation.lastSentAt = now;
  invitation.sendCount = (invitation.sendCount || 0) + 1;
  invitation.expiresAt = daysFromNow(7);
  invitation.acceptUrl = `https://app.tempyhub.example/invite/${id}?s=${invitation.sendCount}`;
  invitation.updatedAt = now;

  return invitation;
}

export function revokeMockInvitation(id) {
  const invitation = mockInvitations.find((inv) => inv._id === id);
  if (!invitation) return null;

  const now = new Date().toISOString();
  invitation.status = 'revoked';
  invitation.revokedAt = now;
  invitation.acceptUrl = null;
  invitation.updatedAt = now;

  return invitation;
}

export function deleteMockInvitation(id) {
  const index = mockInvitations.findIndex((inv) => inv._id === id);
  if (index === -1) return false;

  mockInvitations.splice(index, 1);
  mockInvitationsResponse.meta.totalRecords = mockInvitations.length;
  return true;
}
