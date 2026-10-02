// Mock staff profiles data — shape mirrors:
//   GET  /admin/organizations/:organizationId/staff-profiles
//   GET  /admin/staff-profiles/:staffProfileId
// Replace the reads in the views with the RTK Query hooks (see
// src/store/Reducer/staff-profiles-api.js) once the endpoints are available.
//
// A staff profile is its own resource — kept separate from members / invitations.

import { mockBranches } from 'src/sections/branch/mocks/data';
import { mockJobTitles } from 'src/sections/job-title/mocks/data';
import { mockDepartments } from 'src/sections/department/mocks/data';
import { mockOrganizations } from 'src/sections/organization/mocks/data';

// ----------------------------------------------------------------------
// User dropdown source.
// TODO: replace with the real org-users data source / endpoint once available
// (there is no organization-users API slice in the project yet). The Create
// screen needs a list of users that can be linked to a staff profile.
// ----------------------------------------------------------------------

const ORG_A = mockOrganizations[0]?._id;
const ORG_B = mockOrganizations[1]?._id;

export const mockStaffUsers = [
  { _id: '6ac0aa000000000000000001', name: 'Daniel Mensah', email: 'daniel.mensah@example.com', organizationId: ORG_A },
  { _id: '6ac0aa000000000000000002', name: 'Amara Silva', email: 'amara.silva@example.com', organizationId: ORG_A },
  { _id: '6ac0aa000000000000000003', name: 'Oliver Bennett', email: 'oliver.bennett@example.com', organizationId: ORG_A },
  { _id: '6ac0aa000000000000000005', name: 'Grace Owusu', email: 'grace.owusu@example.com', organizationId: ORG_A },
  { _id: '6ac0aa000000000000000006', name: 'Leah Thompson', email: 'leah.thompson@example.com', organizationId: ORG_A },
  { _id: '6ac0aa000000000000000004', name: 'Omar Haddad', email: 'omar.haddad@example.com', organizationId: ORG_B },
  { _id: '6ac0aa000000000000000007', name: 'Nadia Karim', email: 'nadia.karim@example.com', organizationId: ORG_B },
];

export const getStaffUserById = (id) => mockStaffUsers.find((u) => u._id === id) ?? null;

// ----------------------------------------------------------------------

const orgRef = (id) => {
  const org = mockOrganizations.find((o) => o._id === id);
  return org ? { _id: org._id, name: org.name } : null;
};

const userRef = (id) => {
  const user = getStaffUserById(id);
  return user ? { _id: user._id, name: user.name, email: user.email } : null;
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

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

export const mockStaffProfilesResponse = {
  message: 'Data fetched successfully',
  data: [
    {
      _id: '6ac1d1000000000000000001',
      organizationId: ORG_A,
      userId: '6ac0aa000000000000000001',
      user: userRef('6ac0aa000000000000000001'),
      branchId: '6a98c1000000000000000001',
      branch: branchRef('6a98c1000000000000000001'),
      jobTitleId: '6a97b5bd0000000000000002',
      jobTitle: jobTitleRef('6a97b5bd0000000000000002'),
      departmentIds: ['6aa1b1000000000000000002', '6aa1b1000000000000000001'],
      departments: departmentRefs(['6aa1b1000000000000000002', '6aa1b1000000000000000001']),
      startDate: daysFromNow(-20),
      pin: '4321',
      hourlyRate: 12.5,
      createdAt: daysFromNow(-18),
      updatedAt: daysFromNow(-18),
      __v: 0,
      organization: orgRef(ORG_A),
    },
    {
      _id: '6ac1d1000000000000000002',
      organizationId: ORG_A,
      userId: '6ac0aa000000000000000002',
      user: userRef('6ac0aa000000000000000002'),
      branchId: '6a98c1000000000000000001',
      branch: branchRef('6a98c1000000000000000001'),
      jobTitleId: '6a97b5bd0000000000000003',
      jobTitle: jobTitleRef('6a97b5bd0000000000000003'),
      departmentIds: ['6aa1b1000000000000000002'],
      departments: departmentRefs(['6aa1b1000000000000000002']),
      startDate: daysFromNow(-60),
      pin: '1180',
      hourlyRate: 14,
      createdAt: daysFromNow(-55),
      updatedAt: daysFromNow(-4),
      __v: 0,
      organization: orgRef(ORG_A),
    },
    {
      _id: '6ac1d1000000000000000003',
      organizationId: ORG_A,
      userId: '6ac0aa000000000000000006',
      user: userRef('6ac0aa000000000000000006'),
      branchId: '6a98c1000000000000000002',
      branch: branchRef('6a98c1000000000000000002'),
      jobTitleId: '6a97b5bd0000000000000001',
      jobTitle: jobTitleRef('6a97b5bd0000000000000001'),
      departmentIds: [],
      departments: [],
      startDate: daysFromNow(-120),
      pin: '5309',
      createdAt: daysFromNow(-115),
      updatedAt: daysFromNow(-30),
      __v: 0,
      organization: orgRef(ORG_A),
    },
    {
      _id: '6ac1d1000000000000000004',
      organizationId: ORG_B,
      userId: '6ac0aa000000000000000004',
      user: userRef('6ac0aa000000000000000004'),
      branchId: '6a98c1000000000000000003',
      branch: branchRef('6a98c1000000000000000003'),
      jobTitleId: '6a97b5bd0000000000000004',
      jobTitle: jobTitleRef('6a97b5bd0000000000000004'),
      departmentIds: ['6aa1b1000000000000000005'],
      departments: departmentRefs(['6aa1b1000000000000000005']),
      startDate: daysFromNow(-30),
      pin: '7788',
      createdAt: daysFromNow(-25),
      updatedAt: daysFromNow(-25),
      __v: 0,
      organization: orgRef(ORG_B),
    },
  ],
  meta: { currentPage: 1, totalPages: 1, totalRecords: 4, limit: 10 },
};

export const mockStaffProfiles = mockStaffProfilesResponse.data;

export const getMockStaffProfileById = (id) =>
  mockStaffProfiles.find((profile) => profile._id === id) ?? null;

// ----------------------------------------------------------------------
// Prototype helpers — no backend yet, so mutate the in-memory list so the
// list / detail screens reflect changes.
// ----------------------------------------------------------------------

export function createMockStaffProfile({
  organizationId,
  userId,
  branchId,
  jobTitleId,
  departmentIds = [],
  startDate,
  pin,
  hourlyRate,
} = {}) {
  const now = new Date().toISOString();
  const rand = Math.random().toString(36).slice(2, 10);
  const id = `mock-staff-${rand}`;

  const profile = {
    _id: id,
    organizationId,
    userId: userId || null,
    user: userRef(userId),
    branchId: branchId || null,
    branch: branchRef(branchId),
    jobTitleId: jobTitleId || null,
    jobTitle: jobTitleRef(jobTitleId),
    departmentIds,
    departments: departmentRefs(departmentIds),
    startDate: startDate || null,
    pin: pin || null,
    // Optional — used to show earnings alongside worked hours (Staff Dashboard).
    hourlyRate: hourlyRate ?? null,
    createdAt: now,
    updatedAt: now,
    __v: 0,
    organization: orgRef(organizationId),
  };

  mockStaffProfiles.unshift(profile);
  mockStaffProfilesResponse.meta.totalRecords = mockStaffProfiles.length;

  return profile;
}

export function updateMockStaffProfile(id, patch = {}) {
  const profile = mockStaffProfiles.find((p) => p._id === id);
  if (!profile) return null;

  if (patch.startDate !== undefined) profile.startDate = patch.startDate;
  if (patch.pin !== undefined) profile.pin = patch.pin;
  if (patch.hourlyRate !== undefined) profile.hourlyRate = patch.hourlyRate;

  if (patch.userId !== undefined) {
    profile.userId = patch.userId || null;
    profile.user = userRef(patch.userId);
  }
  if (patch.branchId !== undefined) {
    profile.branchId = patch.branchId || null;
    profile.branch = branchRef(patch.branchId);
  }
  if (patch.jobTitleId !== undefined) {
    profile.jobTitleId = patch.jobTitleId || null;
    profile.jobTitle = jobTitleRef(patch.jobTitleId);
  }
  if (patch.departmentIds !== undefined) {
    profile.departmentIds = patch.departmentIds;
    profile.departments = departmentRefs(patch.departmentIds);
  }

  profile.updatedAt = new Date().toISOString();
  return profile;
}
