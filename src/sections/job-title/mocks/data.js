// Mock job titles data — shape mirrors `GET /admin/organizations/:organizationId/job-titles`.
// Replace the reads in the views with `useGetJobTitlesQuery` (see
// src/store/Reducer/job-titles-api.js) once the endpoint is available.

import { mockBranches } from 'src/sections/branch/mocks/data';
import { mockDepartments } from 'src/sections/department/mocks/data';
import { mockOrganizations } from 'src/sections/organization/mocks/data';

// ----------------------------------------------------------------------

export const JOB_TITLE_STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'default' },
];

// `level` slugs (see the API sample: "siteManagement"). Placeholder set —
// align with the backend enum when known.
export const JOB_TITLE_LEVEL_OPTIONS = [
  { value: 'organizationManagement', label: 'Organization Management' },
  { value: 'siteManagement', label: 'Site Management' },
  { value: 'lineManagement', label: 'Line Management' },
  { value: 'staff', label: 'Staff' },
];

export const getJobTitleLevelLabel = (value) =>
  JOB_TITLE_LEVEL_OPTIONS.find((option) => option.value === value)?.label || value || '—';

const orgRef = (id) => {
  const org = mockOrganizations.find((o) => o._id === id);
  return org ? { _id: org._id, name: org.name, status: org.status } : null;
};

const branchRef = (id) => {
  if (!id) return null;
  const branch = mockBranches.find((b) => b._id === id);
  return branch ? { _id: branch._id, name: branch.name } : null;
};

const departmentRef = (id) => {
  if (!id) return null;
  const department = mockDepartments.find((item) => item._id === id);
  return department ? { _id: department._id, name: department.name } : null;
};

const ORG_A = mockOrganizations[0]?._id;
const ORG_B = mockOrganizations[1]?._id;

export const mockJobTitlesResponse = {
  message: 'Data fetched successfully',
  data: [
    {
      _id: '6a97b5bd0000000000000001',
      organizationId: ORG_A,
      branchId: '6a98c1000000000000000001',
      name: 'Head Chef',
      level: 'siteManagement',
      active: true,
      nameKey: 'head chef',
      createdAt: '2026-09-02T05:35:57.268Z',
      updatedAt: '2026-09-02T05:35:57.268Z',
      __v: 0,
      organization: orgRef(ORG_A),
      branch: { _id: '6a98c1000000000000000001', name: 'Willow House' },
    },
    {
      _id: '6a97b5bd0000000000000002',
      organizationId: ORG_A,
      branchId: null,
      name: 'Registered Nurse',
      level: 'lineManagement',
      active: true,
      nameKey: 'registered nurse',
      createdAt: '2026-09-02T05:40:12.000Z',
      updatedAt: '2026-09-02T05:40:12.000Z',
      __v: 0,
      organization: orgRef(ORG_A),
      branch: null,
    },
    {
      _id: '6a97b5bd0000000000000003',
      organizationId: ORG_A,
      branchId: null,
      name: 'Care Assistant',
      level: 'staff',
      active: false,
      nameKey: 'care assistant',
      createdAt: '2026-09-02T05:44:03.000Z',
      updatedAt: '2026-09-03T09:10:00.000Z',
      __v: 0,
      organization: orgRef(ORG_A),
      branch: null,
    },
    {
      _id: '6a97b5bd0000000000000004',
      organizationId: ORG_B,
      branchId: null,
      name: 'Operations Director',
      level: 'organizationManagement',
      active: true,
      nameKey: 'operations director',
      createdAt: '2026-09-01T12:00:00.000Z',
      updatedAt: '2026-09-01T12:00:00.000Z',
      __v: 0,
      organization: orgRef(ORG_B),
      branch: null,
    },
    {
      _id: '6a97b5bd0000000000000005',
      organizationId: ORG_B,
      branchId: null,
      name: 'Maintenance Lead',
      level: 'siteManagement',
      active: true,
      nameKey: 'maintenance lead',
      createdAt: '2026-09-01T12:15:00.000Z',
      updatedAt: '2026-09-01T12:15:00.000Z',
      __v: 0,
      organization: orgRef(ORG_B),
      branch: null,
    },
  ],
  meta: { currentPage: 1, totalPages: 1, totalRecords: 5, limit: 10 },
};

export const mockJobTitles = mockJobTitlesResponse.data;

// ----------------------------------------------------------------------
// Prototype helpers — no backend yet, so mutate the in-memory list so the
// list / detail screens reflect changes.
// ----------------------------------------------------------------------

export function createMockJobTitle({
  name,
  level,
  organizationId,
  branchId = null,
  departmentId = null,
  siteScope = branchId ? 'branch' : 'all',
  active = true,
} = {}) {
  const now = new Date().toISOString();
  const rand = Math.random().toString(36).slice(2, 10);

  const jobTitle = {
    _id: `mock-jt-${rand}`,
    organizationId,
    branchId: branchId || null,
    siteScope,
    departmentId: departmentId || null,
    name,
    level,
    active,
    nameKey: name?.toLowerCase() ?? '',
    createdAt: now,
    updatedAt: now,
    __v: 0,
    organization: orgRef(organizationId),
    branch: branchRef(branchId),
    department: departmentRef(departmentId),
  };

  mockJobTitles.unshift(jobTitle);
  mockJobTitlesResponse.meta.totalRecords = mockJobTitles.length;

  return jobTitle;
}

export function updateMockJobTitle(
  id,
  { name, level, organizationId, branchId, departmentId, siteScope, active } = {}
) {
  const jobTitle = mockJobTitles.find((jt) => jt._id === id);
  if (!jobTitle) return null;

  if (name !== undefined) {
    jobTitle.name = name;
    jobTitle.nameKey = name?.toLowerCase() ?? '';
  }
  if (level !== undefined) jobTitle.level = level;
  if (active !== undefined) jobTitle.active = active;
  if (organizationId !== undefined) {
    jobTitle.organizationId = organizationId;
    jobTitle.organization = orgRef(organizationId);
  }
  if (branchId !== undefined) {
    jobTitle.branchId = branchId || null;
    jobTitle.branch = branchRef(branchId);
  }
  if (departmentId !== undefined) {
    jobTitle.departmentId = departmentId || null;
    jobTitle.department = departmentRef(departmentId);
  }
  if (siteScope !== undefined) jobTitle.siteScope = siteScope;
  jobTitle.updatedAt = new Date().toISOString();

  return jobTitle;
}
