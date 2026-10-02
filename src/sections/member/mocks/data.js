// Mock members / memberships data — shape mirrors:
//   GET  /admin/organizations/:organizationId/members
//   GET  /admin/memberships/:membershipId
// Replace the reads in the views with the RTK Query hooks (see
// src/store/Reducer/members-api.js) once the endpoints are available.
//
// A "member" is a user who has accepted an invitation. This is a SEPARATE
// resource from an invitation — the two flows do not share data or APIs.

import { mockBranches } from 'src/sections/branch/mocks/data';
import { mockJobTitles } from 'src/sections/job-title/mocks/data';
import { mockDepartments } from 'src/sections/department/mocks/data';
import { mockOrganizations } from 'src/sections/organization/mocks/data';

// ----------------------------------------------------------------------

export const MEMBER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'default' },
];

export const getMemberStatusMeta = (value) =>
  MEMBER_STATUS_OPTIONS.find((option) => option.value === value) || {
    value,
    label: value || '—',
    color: 'default',
  };

// Role enum — placeholder, align with the backend when known.
export const MEMBER_ROLE_OPTIONS = [
  { value: 'siteManager', label: 'Site Manager' },
  { value: 'lineManager', label: 'Line Manager' },
  { value: 'staff', label: 'Staff' },
];

export const getMemberRoleLabel = (value) =>
  MEMBER_ROLE_OPTIONS.find((option) => option.value === value)?.label || value || '—';

// Permission catalog — placeholder set, replace with the org's real catalog.
export const MEMBER_PERMISSION_OPTIONS = [
  { value: 'leave.approve', label: 'Approve leave' },
  { value: 'leave.view', label: 'View leave' },
  { value: 'rota.manage', label: 'Manage rota' },
  { value: 'rota.view', label: 'View rota' },
  { value: 'attendance.manage', label: 'Manage attendance' },
  { value: 'documents.manage', label: 'Manage documents' },
  { value: 'reports.view', label: 'View reports' },
];

export const getMemberPermissionLabels = (values = []) =>
  values.map(
    (value) => MEMBER_PERMISSION_OPTIONS.find((option) => option.value === value)?.label || value
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

export const mockMembersResponse = {
  message: 'Data fetched successfully',
  data: [
    {
      _id: '6aab01000000000000000001',
      membershipId: '6aab01000000000000000001',
      organizationId: ORG_A,
      userId: '6ac0aa000000000000000001',
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
      status: 'active',
      deactivatedAt: null,
      createdAt: daysFromNow(-8),
      updatedAt: daysFromNow(-8),
      __v: 0,
      organization: orgRef(ORG_A),
    },
    {
      _id: '6aab01000000000000000002',
      membershipId: '6aab01000000000000000002',
      organizationId: ORG_A,
      userId: '6ac0aa000000000000000002',
      email: 'amara.silva@example.com',
      name: 'Amara Silva',
      role: 'staff',
      branchId: '6a98c1000000000000000001',
      branch: branchRef('6a98c1000000000000000001'),
      permissions: ['leave.view', 'rota.view'],
      jobTitleId: '6a97b5bd0000000000000003',
      jobTitle: jobTitleRef('6a97b5bd0000000000000003'),
      departmentIds: ['6aa1b1000000000000000002'],
      departments: departmentRefs(['6aa1b1000000000000000002']),
      startDate: daysFromNow(-60),
      status: 'active',
      deactivatedAt: null,
      createdAt: daysFromNow(-55),
      updatedAt: daysFromNow(-4),
      __v: 0,
      organization: orgRef(ORG_A),
    },
    {
      _id: '6aab01000000000000000003',
      membershipId: '6aab01000000000000000003',
      organizationId: ORG_A,
      userId: '6ac0aa000000000000000003',
      email: 'oliver.bennett@example.com',
      name: 'Oliver Bennett',
      role: 'staff',
      branchId: '6a98c1000000000000000002',
      branch: branchRef('6a98c1000000000000000002'),
      permissions: [],
      jobTitleId: '6a97b5bd0000000000000001',
      jobTitle: jobTitleRef('6a97b5bd0000000000000001'),
      departmentIds: [],
      departments: [],
      startDate: daysFromNow(-120),
      status: 'inactive',
      deactivatedAt: daysFromNow(-10),
      createdAt: daysFromNow(-115),
      updatedAt: daysFromNow(-10),
      __v: 0,
      organization: orgRef(ORG_A),
    },
    {
      _id: '6aab01000000000000000004',
      membershipId: '6aab01000000000000000004',
      organizationId: ORG_B,
      userId: '6ac0aa000000000000000004',
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
      startDate: daysFromNow(-30),
      status: 'active',
      deactivatedAt: null,
      createdAt: daysFromNow(-25),
      updatedAt: daysFromNow(-25),
      __v: 0,
      organization: orgRef(ORG_B),
    },
  ],
  meta: { currentPage: 1, totalPages: 1, totalRecords: 4, limit: 10 },
};

export const mockMembers = mockMembersResponse.data;

export const getMockMemberById = (id) =>
  mockMembers.find((member) => member._id === id || member.membershipId === id) ?? null;

// ----------------------------------------------------------------------
// Prototype helpers — no backend yet, so mutate the in-memory list so the
// list / detail screens reflect changes.
// ----------------------------------------------------------------------

export function updateMockMember(id, patch = {}) {
  const member = mockMembers.find((m) => m._id === id || m.membershipId === id);
  if (!member) return null;

  ['name', 'role', 'permissions', 'startDate'].forEach((key) => {
    if (patch[key] !== undefined) member[key] = patch[key];
  });

  if (patch.branchId !== undefined) {
    member.branchId = patch.branchId || null;
    member.branch = branchRef(patch.branchId);
  }
  if (patch.jobTitleId !== undefined) {
    member.jobTitleId = patch.jobTitleId || null;
    member.jobTitle = jobTitleRef(patch.jobTitleId);
  }
  if (patch.departmentIds !== undefined) {
    member.departmentIds = patch.departmentIds;
    member.departments = departmentRefs(patch.departmentIds);
  }

  member.updatedAt = new Date().toISOString();
  return member;
}

export function deactivateMockMember(id) {
  const member = mockMembers.find((m) => m._id === id || m.membershipId === id);
  if (!member) return null;

  const now = new Date().toISOString();
  member.status = 'inactive';
  member.deactivatedAt = now;
  member.updatedAt = now;

  return member;
}
