// Mock branches data — shape mirrors:
//   GET /admin/organizations/:organizationId/branches
//   GET /admin/branches/:branchId
// Replace the reads in the views with the RTK Query hooks (see
// src/store/Reducer/branches-api.js) once the endpoints are available.

import { mockOrganizations } from 'src/sections/organization/mocks/data';

// ----------------------------------------------------------------------

export const BRANCH_STATUS_OPTIONS = [
  { value: 'pendingActivation', label: 'Pending Activation', color: 'warning' },
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'suspended', label: 'Suspended', color: 'error' },
];

export const getBranchStatusMeta = (value) =>
  BRANCH_STATUS_OPTIONS.find((option) => option.value === value) || {
    value,
    label: value || '—',
    color: 'default',
  };

// Client feedback: breaks need to be a removable option (some organizations
// don't use them) and, when on, follow a simple adjustable rule table rather
// than one fixed value — "shift at least this long -> this much unpaid
// break". `breaksPaid` says whether break time counts as paid work at all;
// `breakRules` only matters when it doesn't.
export const DEFAULT_BREAK_RULES = [
  { minHours: 12, unpaidMinutes: 60 },
  { minHours: 6, unpaidMinutes: 30 },
];

export const DEFAULT_BRANCH_SETTINGS = {
  enableBreaks: true,
  enableLeaveRequests: true,
  lateGraceMinutes: 5,
  allowPhoneCheckIn: false,
  breaksPaid: false,
  breakRules: DEFAULT_BREAK_RULES,
  autoClockOutHoursAfterShiftEnd: 3,
  autoClockOutHoursAfterClockIn: 10,
};

const orgRef = (id) => {
  const org = mockOrganizations.find((o) => o._id === id);
  return org ? { _id: org._id, name: org.name, status: org.status } : null;
};

const ORG_A = mockOrganizations[0]?._id;
const ORG_B = mockOrganizations[1]?._id;

export const mockBranchesResponse = {
  message: 'Data fetched successfully',
  data: [
    {
      _id: '6a98c1000000000000000001',
      organizationId: ORG_A,
      name: 'Willow House',
      code: 'WLH',
      timezone: 'Europe/London',
      address: '12 Willow Lane, London, EC1A 1BB',
      status: 'active',
      assemblyPoint: 'Front car park',
      settings: {
        enableBreaks: true,
        lateGraceMinutes: 5,
        allowPhoneCheckIn: false,
        breaksPaid: false,
        breakRules: DEFAULT_BREAK_RULES,
      },
      activation: { activatedAt: '2026-08-20T09:00:00.000Z', activatedBy: 'Sam Okafor' },
      manager: {
        _id: '6a98c1000000000000000101',
        name: 'Grace Mensah',
        email: 'grace.mensah@bluebellcare.example',
        jobTitleId: '6a97b5bd0000000000000001',
        jobTitle: { _id: '6a97b5bd0000000000000001', name: 'Head Chef' },
        departmentId: '6aa1b1000000000000000001',
        department: { _id: '6aa1b1000000000000000001', name: 'Kitchen' },
        startDate: '2026-10-01T00:00:00.000Z',
      },
      organization: orgRef(ORG_A),
      createdAt: '2026-08-18T10:00:00.000Z',
      updatedAt: '2026-08-20T09:00:00.000Z',
      __v: 0,
    },
    {
      _id: '6a98c1000000000000000002',
      organizationId: ORG_A,
      name: 'Rosewood Court',
      code: 'RWC',
      timezone: 'Europe/London',
      address: '5 Rosewood Road, Manchester, M1 3EX',
      status: 'pendingActivation',
      assemblyPoint: 'Rear garden gate',
      settings: {
        enableBreaks: true,
        lateGraceMinutes: 10,
        allowPhoneCheckIn: true,
        breaksPaid: true,
        breakRules: DEFAULT_BREAK_RULES,
      },
      activation: null,
      manager: null,
      organization: orgRef(ORG_A),
      createdAt: '2026-09-01T12:30:00.000Z',
      updatedAt: '2026-09-01T12:30:00.000Z',
      __v: 0,
    },
    {
      _id: '6a98c1000000000000000003',
      organizationId: ORG_B,
      name: 'Oakfield Lodge',
      code: 'OFL',
      timezone: 'Europe/Dublin',
      address: '88 Oakfield Avenue, Dublin, D02 XY45',
      status: 'active',
      assemblyPoint: 'Main reception steps',
      settings: {
        enableBreaks: false,
        lateGraceMinutes: 0,
        allowPhoneCheckIn: false,
        breaksPaid: false,
        breakRules: [],
      },
      activation: { activatedAt: '2026-07-11T08:15:00.000Z', activatedBy: 'Marcus Bennett' },
      manager: {
        _id: '6a98c1000000000000000103',
        name: 'Liam Doyle',
        email: 'liam.doyle@democare.example',
        jobTitleId: '6a97b5bd0000000000000005',
        jobTitle: { _id: '6a97b5bd0000000000000005', name: 'Maintenance Lead' },
        departmentId: null,
        department: null,
        startDate: '2026-10-15T00:00:00.000Z',
      },
      organization: orgRef(ORG_B),
      createdAt: '2026-07-08T09:00:00.000Z',
      updatedAt: '2026-07-11T08:15:00.000Z',
      __v: 0,
    },
  ],
  meta: { currentPage: 1, totalPages: 1, totalRecords: 3, limit: 10 },
};

export const mockBranches = mockBranchesResponse.data;

export const getMockBranchById = (id) => mockBranches.find((branch) => branch._id === id) ?? null;

// ----------------------------------------------------------------------
// Prototype helpers — no backend yet, so mutate the in-memory list so the
// list / detail screens reflect changes.
// ----------------------------------------------------------------------

const codeFromName = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 4) || 'BR';

export function createMockBranch({ organizationId, manager, ...rest } = {}) {
  const now = new Date().toISOString();
  const rand = Math.random().toString(36).slice(2, 10);

  const branch = {
    _id: `mock-branch-${rand}`,
    organizationId,
    name: rest.name ?? '',
    code: rest.code || codeFromName(rest.name),
    timezone: rest.timezone ?? '',
    address: rest.address ?? '',
    status: 'pendingActivation',
    assemblyPoint: rest.assemblyPoint ?? '',
    settings: { ...DEFAULT_BRANCH_SETTINGS, ...(rest.settings ?? {}) },
    activation: null,
    manager: manager
      ? {
          _id: `mock-mgr-${rand}`,
          name: manager.name ?? '',
          email: manager.email ?? '',
          jobTitleId: manager.jobTitleId ?? null,
          jobTitle: null,
          departmentId: manager.departmentId ?? null,
          department: null,
          startDate: manager.startDate ?? null,
        }
      : null,
    organization: orgRef(organizationId),
    createdAt: now,
    updatedAt: now,
    __v: 0,
  };

  mockBranches.unshift(branch);
  mockBranchesResponse.meta.totalRecords = mockBranches.length;

  return branch;
}

export function updateMockBranch(id, { manager, settings, ...rest } = {}) {
  const branch = mockBranches.find((b) => b._id === id);
  if (!branch) return null;

  ['name', 'code', 'timezone', 'address', 'assemblyPoint'].forEach((key) => {
    if (rest[key] !== undefined) branch[key] = rest[key];
  });

  if (settings) branch.settings = { ...branch.settings, ...settings };

  if (manager === null) {
    branch.manager = null;
  } else if (manager) {
    branch.manager = {
      ...(branch.manager ?? { _id: `mock-mgr-${id}` }),
      name: manager.name ?? branch.manager?.name ?? '',
      email: manager.email ?? branch.manager?.email ?? '',
      jobTitleId: manager.jobTitleId ?? branch.manager?.jobTitleId ?? null,
      departmentId: manager.departmentId ?? branch.manager?.departmentId ?? null,
      startDate: manager.startDate ?? branch.manager?.startDate ?? null,
    };
  }

  branch.updatedAt = new Date().toISOString();

  return branch;
}
