// Mock organizations response — shape mirrors `GET /organizations`.
// Replace with an RTK Query slice (see src/store/Reducer/*-api.js) when the
// endpoint is available; the list view already reads `data` / `meta` the same
// way the real response is structured.

export const ORGANIZATION_STATUS_OPTIONS = [
  { value: 'pendingActivation', label: 'Pending Activation', color: 'warning' },
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'suspended', label: 'Suspended', color: 'error' },
];

export const mockOrganizationsResponse = {
  message: 'Data fetched successfully',
  data: [
    {
      _id: '6a96a00da9e9deba097fb21b',
      name: 'Bluebell Care Group',
      ownerUserId: '6a96a066a4e9deba097fb227',
      status: 'active',
      moduleAccess: [
        { moduleSlug: 'signInAttendance', enabled: true, purchasedAt: '2026-09-01T09:51:09.263Z', expiresAt: null },
        { moduleSlug: 'leave', enabled: true, purchasedAt: '2026-09-01T09:51:09.263Z', expiresAt: null },
      ],
      settings: { emergencyNotifyOffsite: false },
      createdAt: '2026-09-01T09:51:09.282Z',
      updatedAt: '2026-09-01T09:52:38.373Z',
      nameKey: 'bluebell care group',
      __v: 0,
      owner: {
        _id: '6a96a066a4e9deba097fb227',
        name: 'Sam Okafor',
        email: 'ada@bluebellcare.example',
      },
    },
    {
      _id: '6a9579204f38edb8df1640b6',
      name: 'Willow Care Group',
      ownerUserId: '6a9579584f38edb8df1640c2',
      status: 'active',
      moduleAccess: [
        { moduleSlug: 'leave', enabled: true, purchasedAt: '2026-08-31T12:50:11.487Z', expiresAt: '2026-09-30T12:50:11.487Z' },
      ],
      settings: { emergencyNotifyOffsite: false },
      createdAt: '2026-08-31T12:52:48.257Z',
      updatedAt: '2026-08-31T12:57:59.426Z',
      nameKey: 'willow care group',
      __v: 0,
      owner: {
        _id: '6a9579584f38edb8df1640c2',
        name: 'Priya Nair',
        email: 'priya@willowcare.example',
      },
    },
    {
      _id: '6a9576de4f38edb8df164091',
      name: 'Demo Care Group',
      ownerUserId: '6a9576de4f38edb8df16408d',
      status: 'pendingActivation',
      moduleAccess: [
        { moduleSlug: 'signInAttendance', enabled: true, purchasedAt: '2026-08-31T12:43:10.784Z', expiresAt: null },
        { moduleSlug: 'rotaScheduling', enabled: true, purchasedAt: '2026-08-31T12:43:10.784Z', expiresAt: null },
        { moduleSlug: 'leave', enabled: true, purchasedAt: '2026-08-31T12:43:10.784Z', expiresAt: null },
      ],
      settings: { emergencyNotifyOffsite: false },
      createdAt: '2026-08-31T12:43:10.801Z',
      updatedAt: '2026-08-31T12:43:10.801Z',
      nameKey: 'demo care group',
      __v: 0,
      owner: {
        _id: '6a9576de4f38edb8df16408d',
        name: 'Marcus Bennett',
        email: 'marcus@democare.example',
      },
    },
  ],
  meta: { currentPage: 1, totalPages: 1, totalRecords: 3, limit: 10 },
};

export const mockOrganizations = mockOrganizationsResponse.data;

// ----------------------------------------------------------------------
// Module catalog — the full set of platform modules. `name` / `description`
// are used as a fallback when the module-access API response only carries
// `moduleSlug`.
// ----------------------------------------------------------------------

export const MODULE_CATALOG = [
  {
    moduleSlug: 'signInAttendance',
    name: 'Sign-In & Attendance',
    description: 'Digital sign-in for staff and visitors with live attendance tracking.',
  },
  {
    moduleSlug: 'rotaScheduling',
    name: 'Rota Scheduling',
    description: 'Build and publish staff rotas across sites and teams.',
  },
  {
    moduleSlug: 'fireDrillEvacuation',
    name: 'Fire Drill & Evacuation',
    description: 'Run fire drills and record evacuation roll-calls.',
  },
  {
    moduleSlug: 'peepFloorPlan',
    name: 'PEEP & Floor Plan',
    description: 'Personal Emergency Evacuation Plans linked to site floor plans.',
  },
  {
    moduleSlug: 'documentsEsign',
    name: 'Documents & E-Sign',
    description: 'Share policies and collect electronic signatures.',
  },
  {
    moduleSlug: 'leave',
    name: 'Leave Management',
    description: 'Request, approve and track staff leave and absence.',
  },
  {
    moduleSlug: 'shiftBidding',
    name: 'Shift Bidding',
    description: 'Let staff bid on open shifts for manager approval.',
  },
  {
    moduleSlug: 'competencySupervisionAppraisal',
    name: 'Competency, Supervision & Appraisal',
    description: 'Track competencies, supervisions and appraisals for staff.',
  },
  {
    moduleSlug: 'onboardingDbs',
    name: 'Onboarding & DBS',
    description: 'Digital onboarding with DBS checks and right-to-work.',
  },
  {
    moduleSlug: 'payrollForecasting',
    name: 'Payroll Forecasting',
    description: 'Forecast payroll cost from rota and attendance data.',
  },
  {
    moduleSlug: 'visitorComms',
    name: 'Visitor Communications',
    description: 'Pre-registration and notifications for visitors.',
  },
  {
    moduleSlug: 'agencyShiftBids',
    name: 'Agency Shift Bids',
    description: 'Send open shifts to agencies and manage their bids.',
  },
];

// Fallback for `GET /admin/organizations/:id/module-access` while the endpoint
// is unavailable. Mirrors the expected response shape.
export const mockModuleAccessResponse = {
  message: 'Data fetched successfully',
  data: {
    moduleAccess: [
      { moduleSlug: 'signInAttendance', enabled: true, purchasedAt: '2026-09-01T09:51:09.263Z', expiresAt: null },
      { moduleSlug: 'leave', enabled: true, purchasedAt: '2026-09-01T09:51:09.263Z', expiresAt: '2026-12-31T00:00:00.000Z' },
      { moduleSlug: 'rotaScheduling', enabled: false, expiresAt: null },
    ],
  },
};

// ----------------------------------------------------------------------
// Prototype helper — org creation has no backend yet, so a "created" org is
// pushed into the in-memory list here so the detail screen can resolve it.
// ----------------------------------------------------------------------

export function createMockOrganization({ name, ownerName, ownerEmail, settings } = {}) {
  const now = new Date().toISOString();
  const rand = Math.random().toString(36).slice(2, 10);

  const organization = {
    _id: `mock-${rand}`,
    name,
    ownerUserId: `mock-owner-${rand}`,
    status: 'active',
    moduleAccess: [],
    settings: settings ?? { emergencyNotifyOffsite: false },
    createdAt: now,
    updatedAt: now,
    nameKey: name?.toLowerCase() ?? '',
    __v: 0,
    owner: { _id: `mock-owner-${rand}`, name: ownerName, email: ownerEmail },
  };

  mockOrganizations.unshift(organization);
  mockOrganizationsResponse.meta.totalRecords = mockOrganizations.length;

  return organization;
}
