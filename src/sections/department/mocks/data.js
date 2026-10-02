// Mock departments data — shape mirrors `GET /admin/organizations/:organizationId/departments`.
// Replace the reads in the views with `useGetDepartmentsQuery` (see
// src/store/Reducer/departments-api.js) once the endpoint is available.

import { mockBranches } from 'src/sections/branch/mocks/data';
import { mockOrganizations } from 'src/sections/organization/mocks/data';

// ----------------------------------------------------------------------

export const DEPARTMENT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'inactive', label: 'Inactive', color: 'default' },
];

const orgRef = (id) => {
  const org = mockOrganizations.find((o) => o._id === id);
  return org ? { _id: org._id, name: org.name } : null;
};

const branchRef = (id) => {
  if (!id) return null;
  const branch = mockBranches.find((b) => b._id === id);
  return branch ? { _id: branch._id, name: branch.name } : null;
};

const ORG_A = mockOrganizations[0]?._id;
const ORG_B = mockOrganizations[1]?._id;

export const mockDepartmentsResponse = {
  message: 'Data fetched successfully',
  data: [
    {
      _id: '6aa1b1000000000000000001',
      name: 'Kitchen',
      sortOrder: 1,
      isActive: true,
      organizationId: ORG_A,
      organization: orgRef(ORG_A),
      branchId: '6a98c1000000000000000001',
      branch: { _id: '6a98c1000000000000000001', name: 'Willow House' },
      createdAt: '2026-09-01T10:00:00.000Z',
      updatedAt: '2026-09-01T10:00:00.000Z',
    },
    {
      _id: '6aa1b1000000000000000002',
      name: 'Care',
      sortOrder: 2,
      isActive: true,
      organizationId: ORG_A,
      organization: orgRef(ORG_A),
      createdAt: '2026-09-01T10:05:00.000Z',
      updatedAt: '2026-09-01T10:05:00.000Z',
    },
    {
      _id: '6aa1b1000000000000000003',
      name: 'Housekeeping',
      sortOrder: 3,
      isActive: false,
      organizationId: ORG_A,
      organization: orgRef(ORG_A),
      createdAt: '2026-09-01T10:10:00.000Z',
      updatedAt: '2026-09-02T09:00:00.000Z',
    },
    {
      _id: '6aa1b1000000000000000006',
      name: 'Maintenance',
      sortOrder: 4,
      isActive: true,
      organizationId: ORG_A,
      organization: orgRef(ORG_A),
      createdAt: '2026-09-03T09:00:00.000Z',
      updatedAt: '2026-09-03T09:00:00.000Z',
    },
    {
      _id: '6aa1b1000000000000000007',
      name: 'Administration',
      sortOrder: 5,
      isActive: true,
      organizationId: ORG_A,
      organization: orgRef(ORG_A),
      createdAt: '2026-09-03T09:05:00.000Z',
      updatedAt: '2026-09-03T09:05:00.000Z',
    },
    {
      _id: '6aa1b1000000000000000008',
      name: 'Management',
      sortOrder: 6,
      isActive: true,
      organizationId: ORG_A,
      organization: orgRef(ORG_A),
      createdAt: '2026-09-03T09:10:00.000Z',
      updatedAt: '2026-09-03T09:10:00.000Z',
    },
    {
      _id: '6aa1b1000000000000000009',
      name: 'Finance',
      sortOrder: 7,
      isActive: true,
      organizationId: ORG_A,
      organization: orgRef(ORG_A),
      createdAt: '2026-09-03T09:15:00.000Z',
      updatedAt: '2026-09-03T09:15:00.000Z',
    },
    {
      _id: '6aa1b1000000000000000010',
      name: 'Support',
      sortOrder: 8,
      isActive: true,
      organizationId: ORG_A,
      organization: orgRef(ORG_A),
      createdAt: '2026-09-03T09:20:00.000Z',
      updatedAt: '2026-09-03T09:20:00.000Z',
    },
    {
      _id: '6aa1b1000000000000000004',
      name: 'Maintenance',
      sortOrder: 4,
      isActive: true,
      organizationId: ORG_B,
      organization: orgRef(ORG_B),
      createdAt: '2026-09-01T11:00:00.000Z',
      updatedAt: '2026-09-01T11:00:00.000Z',
    },
    {
      _id: '6aa1b1000000000000000005',
      name: 'Administration',
      sortOrder: 5,
      isActive: true,
      organizationId: ORG_B,
      organization: orgRef(ORG_B),
      createdAt: '2026-09-01T11:15:00.000Z',
      updatedAt: '2026-09-01T11:15:00.000Z',
    },
    {
      _id: '6aa1b1000000000000000011',
      name: 'Management',
      sortOrder: 3,
      isActive: true,
      organizationId: ORG_B,
      organization: orgRef(ORG_B),
      createdAt: '2026-09-03T09:25:00.000Z',
      updatedAt: '2026-09-03T09:25:00.000Z',
    },
    {
      _id: '6aa1b1000000000000000012',
      name: 'Finance',
      sortOrder: 4,
      isActive: true,
      organizationId: ORG_B,
      organization: orgRef(ORG_B),
      createdAt: '2026-09-03T09:30:00.000Z',
      updatedAt: '2026-09-03T09:30:00.000Z',
    },
    {
      _id: '6aa1b1000000000000000013',
      name: 'Support',
      sortOrder: 5,
      isActive: true,
      organizationId: ORG_B,
      organization: orgRef(ORG_B),
      createdAt: '2026-09-03T09:35:00.000Z',
      updatedAt: '2026-09-03T09:35:00.000Z',
    },
  ],
  meta: { currentPage: 1, totalPages: 1, totalRecords: 13, limit: 10 },
};

export const mockDepartments = mockDepartmentsResponse.data;

// ----------------------------------------------------------------------
// Prototype helpers — no backend yet, so mutate the in-memory list so the
// list / detail screens reflect changes.
// ----------------------------------------------------------------------

export function createMockDepartment({
  name,
  sortOrder,
  organizationId,
  branchId = null,
  isActive = true,
} = {}) {
  const now = new Date().toISOString();
  const rand = Math.random().toString(36).slice(2, 10);

  const department = {
    _id: `mock-dept-${rand}`,
    name,
    sortOrder: Number(sortOrder) || 0,
    isActive,
    organizationId,
    organization: orgRef(organizationId),
    branchId: branchId || null,
    branch: branchRef(branchId),
    createdAt: now,
    updatedAt: now,
  };

  mockDepartments.unshift(department);
  mockDepartmentsResponse.meta.totalRecords = mockDepartments.length;

  return department;
}

export function updateMockDepartment(
  id,
  { name, sortOrder, organizationId, branchId, isActive } = {}
) {
  const department = mockDepartments.find((d) => d._id === id);
  if (!department) return null;

  if (name !== undefined) department.name = name;
  if (sortOrder !== undefined) department.sortOrder = Number(sortOrder) || 0;
  if (isActive !== undefined) department.isActive = isActive;
  if (organizationId !== undefined) {
    department.organizationId = organizationId;
    department.organization = orgRef(organizationId);
  }
  if (branchId !== undefined) {
    department.branchId = branchId || null;
    department.branch = branchRef(branchId);
  }
  department.updatedAt = new Date().toISOString();

  return department;
}
